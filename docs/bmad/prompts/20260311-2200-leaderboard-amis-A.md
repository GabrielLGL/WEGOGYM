<!-- v1.0 — 2026-03-11 -->
# Rapport — Leaderboard amis — Groupe A (Data layer) — 20260311-2200

## Objectif
Créer toute la couche données pour le leaderboard entre amis : migration schema v36, modèle FriendSnapshot, helpers de classement, hook de gestion des amis, et génération/parsing du code ami partageable.

## Fichiers concernés
- `mobile/src/model/schema.ts` (MODIFIER — v35 → v36)
- `mobile/src/model/models/User.ts` (MODIFIER — ajouter champ `friend_code`)
- `mobile/src/model/models/FriendSnapshot.ts` (NOUVEAU)
- `mobile/src/model/utils/leaderboardHelpers.ts` (NOUVEAU)
- `mobile/src/hooks/useFriendManager.ts` (NOUVEAU)

## Contexte technique
- WatermelonDB schéma v35 — toute migration incrémente la version + ajoute `addColumns` ou `createTable` dans les migrations
- Pattern migration : dans `mobile/src/model/index.ts`, le tableau `migrations` utilise `schemaMigrations([{ toVersion, steps }])`. Lire ce fichier avant de modifier.
- Chaque `@field`/`@text`/`@date` dans un modèle DOIT avoir sa colonne dans schema.ts et vice versa.
- Mutations DB obligatoirement dans `database.write()`.
- Pas de `any` TypeScript. Pas de `console.log` sans `__DEV__`.
- Pattern modèle existant : voir `mobile/src/model/models/User.ts` pour les imports et decorators.
- `experimentalDecorators: true`, `useDefineForClassFields: false` — utiliser les decorators WatermelonDB classiques.
- `observeCurrentUser()` est dans `mobile/src/model/utils/databaseHelpers.ts`.

## Concept métier
L'app est offline-first — pas de backend. Le leaderboard fonctionne par **échange de codes** :
1. Chaque utilisateur a un `friend_code` unique généré à la première ouverture (ex: `KORE-A1B2C3`)
2. Partager son code = partager un JSON encodé en base64 avec ses stats actuelles
3. L'ami importe ce code → stocké en local dans `friend_snapshots`
4. Le leaderboard affiche : moi + tous les amis importés, classés par XP

## Format du code partageable
```typescript
// Objet avant encodage
interface FriendCodePayload {
  v: 1  // version du format
  code: string     // identifiant unique ex "KORE-A1B2C3"
  name: string     // prénom de l'utilisateur
  xp: number       // total_xp
  level: number
  streak: number   // current_streak
  tonnage: number  // total_tonnage
  prs: number      // total_prs
  sessions: number // nombre de séances terminées
}
// Encodage : JSON.stringify → btoa (base64) → string à partager
// Ex: "eyJ2IjoxLCJjb2RlIjoiS09SRS1BMUI..."
```

## Étapes

### 1. Migrer schema.ts (v35 → v36)

Dans `schema.ts`, changer `version: 35` en `version: 36`.

Ajouter la colonne `friend_code` dans la table `users` :
```typescript
{ name: 'friend_code', type: 'string', isOptional: true },
```

Ajouter la nouvelle table `friend_snapshots` :
```typescript
tableSchema({
  name: 'friend_snapshots',
  columns: [
    { name: 'friend_code', type: 'string' },       // identifiant unique ami
    { name: 'display_name', type: 'string' },       // prénom
    { name: 'total_xp', type: 'number' },
    { name: 'level', type: 'number' },
    { name: 'current_streak', type: 'number' },
    { name: 'total_tonnage', type: 'number' },
    { name: 'total_prs', type: 'number' },
    { name: 'total_sessions', type: 'number' },
    { name: 'imported_at', type: 'number' },        // timestamp ms
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ]
}),
```

### 2. Ajouter la migration dans index.ts

Lire `mobile/src/model/index.ts` et ajouter l'entrée de migration :
```typescript
{
  toVersion: 36,
  steps: [
    addColumns({
      table: 'users',
      columns: [{ name: 'friend_code', type: 'string', isOptional: true }],
    }),
    createTable({
      name: 'friend_snapshots',
      columns: [
        { name: 'friend_code', type: 'string' },
        { name: 'display_name', type: 'string' },
        { name: 'total_xp', type: 'number' },
        { name: 'level', type: 'number' },
        { name: 'current_streak', type: 'number' },
        { name: 'total_tonnage', type: 'number' },
        { name: 'total_prs', type: 'number' },
        { name: 'total_sessions', type: 'number' },
        { name: 'imported_at', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
},
```

### 3. Modifier User.ts

Ajouter le champ `friend_code` :
```typescript
@text('friend_code') friendCode!: string
```

### 4. Créer FriendSnapshot.ts

```typescript
import { Model } from '@nozbe/watermelondb'
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators'

export default class FriendSnapshot extends Model {
  static table = 'friend_snapshots'

  @text('friend_code') friendCode!: string
  @text('display_name') displayName!: string
  @field('total_xp') totalXp!: number
  @field('level') level!: number
  @field('current_streak') currentStreak!: number
  @field('total_tonnage') totalTonnage!: number
  @field('total_prs') totalPrs!: number
  @field('total_sessions') totalSessions!: number
  @field('imported_at') importedAt!: number
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
```

Puis enregistrer dans `mobile/src/model/index.ts` (ModelClasses array) — lire le fichier pour voir comment les autres modèles sont enregistrés.

### 5. Créer leaderboardHelpers.ts

```typescript
// mobile/src/model/utils/leaderboardHelpers.ts

import User from '../models/User'
import FriendSnapshot from '../models/FriendSnapshot'

export interface LeaderboardEntry {
  rank: number
  isMe: boolean
  friendCode: string
  displayName: string
  totalXp: number
  level: number
  currentStreak: number
  totalTonnage: number
  totalPrs: number
  totalSessions: number
}

export type LeaderboardSort = 'xp' | 'streak' | 'tonnage' | 'prs'

// Génère un code ami aléatoire unique
export function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KORE-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Encode les stats de l'utilisateur en code partageable (base64)
export function encodeFriendPayload(user: User, totalSessions: number): string {
  const payload = {
    v: 1,
    code: user.friendCode,
    name: user.name || 'Anonyme',
    xp: user.totalXp,
    level: user.level,
    streak: user.currentStreak,
    tonnage: user.totalTonnage,
    prs: user.totalPrs,
    sessions: totalSessions,
  }
  return btoa(JSON.stringify(payload))
}

// Décode un code partageable
export function decodeFriendPayload(encoded: string): {
  v: number
  code: string
  name: string
  xp: number
  level: number
  streak: number
  tonnage: number
  prs: number
  sessions: number
} | null {
  try {
    const json = atob(encoded.trim())
    const data = JSON.parse(json)
    if (!data.v || !data.code || !data.name) return null
    return data
  } catch {
    return null
  }
}

// Construit le classement à partir de User + FriendSnapshots
export function buildLeaderboard(
  user: User,
  userTotalSessions: number,
  friends: FriendSnapshot[],
  sort: LeaderboardSort = 'xp'
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    {
      rank: 0,
      isMe: true,
      friendCode: user.friendCode,
      displayName: user.name || 'Moi',
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      totalTonnage: user.totalTonnage,
      totalPrs: user.totalPrs,
      totalSessions: userTotalSessions,
    },
    ...friends.map(f => ({
      rank: 0,
      isMe: false,
      friendCode: f.friendCode,
      displayName: f.displayName,
      totalXp: f.totalXp,
      level: f.level,
      currentStreak: f.currentStreak,
      totalTonnage: f.totalTonnage,
      totalPrs: f.totalPrs,
      totalSessions: f.totalSessions,
    })),
  ]

  const sortKey: Record<LeaderboardSort, keyof LeaderboardEntry> = {
    xp: 'totalXp',
    streak: 'currentStreak',
    tonnage: 'totalTonnage',
    prs: 'totalPrs',
  }

  entries.sort((a, b) => (b[sortKey[sort]] as number) - (a[sortKey[sort]] as number))
  entries.forEach((e, i) => { e.rank = i + 1 })
  return entries
}
```

### 6. Créer useFriendManager.ts

```typescript
// mobile/src/hooks/useFriendManager.ts
// Hook pour gérer les amis : import, suppression, génération de son propre code

import { useState, useCallback } from 'react'
import { database } from '../model'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { decodeFriendPayload, generateFriendCode } from '../model/utils/leaderboardHelpers'
import FriendSnapshot from '../model/models/FriendSnapshot'

interface UseFriendManagerReturn {
  importFriend: (encodedCode: string) => Promise<'success' | 'invalid' | 'duplicate' | 'self'>
  removeFriend: (friendCode: string) => Promise<void>
  isImporting: boolean
  error: string | null
}

export function useFriendManager(): UseFriendManagerReturn {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFriend = useCallback(async (encodedCode: string): Promise<'success' | 'invalid' | 'duplicate' | 'self'> => {
    setIsImporting(true)
    setError(null)
    try {
      const payload = decodeFriendPayload(encodedCode)
      if (!payload) return 'invalid'

      // Vérifier que ce n'est pas soi-même
      const user = await observeCurrentUser().pipe(/* first() */).toPromise()
      // Note : observeCurrentUser() retourne un Observable. Pour obtenir la valeur courante,
      // utiliser database.get<User>('users').query(Q.take(1)).fetch() à la place.
      // Pattern correct :
      const users = await database.get('users').query().fetch()
      if (users.length === 0) return 'invalid'
      const currentUser = users[0] as import('../model/models/User').default
      if (currentUser.friendCode === payload.code) return 'self'

      // Vérifier doublon
      const existing = await database.get<FriendSnapshot>('friend_snapshots')
        .query(import('@nozbe/watermelondb').Q.where('friend_code', payload.code))
        .fetch()
      if (existing.length > 0) {
        // Mettre à jour le snapshot existant
        await database.write(async () => {
          await existing[0].update(snap => {
            snap.displayName = payload.name
            snap.totalXp = payload.xp
            snap.level = payload.level
            snap.currentStreak = payload.streak
            snap.totalTonnage = payload.tonnage
            snap.totalPrs = payload.prs
            snap.totalSessions = payload.sessions
            snap.importedAt = Date.now()
          })
        })
        return 'success'
      }

      // Créer nouveau snapshot
      await database.write(async () => {
        await database.get<FriendSnapshot>('friend_snapshots').create(snap => {
          snap.friendCode = payload.code
          snap.displayName = payload.name
          snap.totalXp = payload.xp
          snap.level = payload.level
          snap.currentStreak = payload.streak
          snap.totalTonnage = payload.tonnage
          snap.totalPrs = payload.prs
          snap.totalSessions = payload.sessions
          snap.importedAt = Date.now()
        })
      })
      return 'success'
    } catch (e) {
      if (__DEV__) console.log('[useFriendManager] importFriend error', e)
      setError('Erreur lors de l\'import')
      return 'invalid'
    } finally {
      setIsImporting(false)
    }
  }, [])

  const removeFriend = useCallback(async (friendCode: string) => {
    const snapshots = await database.get<FriendSnapshot>('friend_snapshots')
      .query(import('@nozbe/watermelondb').Q.where('friend_code', friendCode))
      .fetch()
    await database.write(async () => {
      await Promise.all(snapshots.map(s => s.destroyPermanently()))
    })
  }, [])

  return { importFriend, removeFriend, isImporting, error }
}
```

**Note importante sur les imports dynamiques** : Éviter les `import()` dynamiques dans le hook. Importer `Q` en statique depuis `@nozbe/watermelondb` en haut du fichier. Réécrire proprement sans imports dynamiques.

### 7. Assurer que User a un friend_code à l'initialisation

Dans `mobile/src/model/utils/databaseHelpers.ts` ou dans `OnboardingScreen`, lors de la création de l'utilisateur initial, générer le `friend_code` :
```typescript
import { generateFriendCode } from './leaderboardHelpers'
// Dans la création user :
u.friendCode = generateFriendCode()
```

Lire `databaseHelpers.ts` et `OnboardingScreen.tsx` pour identifier le bon endroit.

## Contraintes
- Ne pas casser le schéma existant v35 — migration additive uniquement
- Toutes les mutations dans `database.write()`
- Pas de `any` TypeScript
- Pas de `console.log` sans `__DEV__`
- Pas de couleurs hardcodées (ce groupe ne touche pas l'UI)
- Les imports dans useFriendManager.ts doivent être statiques (pas de `import()` dynamiques)
- FriendSnapshot doit être ajouté au ModelClasses dans index.ts

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Schema version = 36 avec migration propre
- `FriendSnapshot` importable depuis `mobile/src/model/models/FriendSnapshot`
- `buildLeaderboard`, `encodeFriendPayload`, `decodeFriendPayload`, `generateFriendCode` exportés depuis `leaderboardHelpers.ts`
- `useFriendManager` exporté depuis `hooks/useFriendManager.ts`

## Dépendances
Aucune dépendance — ce groupe peut être lancé immédiatement.

## Statut
⏳ En attente
