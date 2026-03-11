<!-- v1.0 — 2026-03-11 -->
# Rapport — Leaderboard amis — Groupe C (UI) — 20260311-2200

## Objectif
Créer l'écran LeaderboardScreen (classement + gestion des amis), ajouter la route de navigation, et intégrer une tuile "Classement" dans HomeScreen.

## Fichiers concernés
- `mobile/src/screens/LeaderboardScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx` (MODIFIER — ajouter route `Leaderboard`)
- `mobile/src/screens/HomeScreen.tsx` (MODIFIER — ajouter tuile classement)

## Contexte technique

### Patterns obligatoires
- **Modaux** : utiliser `<BottomSheet>` et `<AlertDialog>` — jamais `<Modal>` natif (crash Fabric)
- **Couleurs** : `const colors = useColors()` — jamais de couleurs hardcodées
- **i18n** : `const { t } = useLanguage()` puis `t.leaderboard.*`
- **Haptics** : `const haptics = useHaptics()` — `haptics.onPress()`, `haptics.onDelete()`, `haptics.onSuccess()`
- **Données DB** : `withObservables` HOC de `@nozbe/with-observables`
- **Modal state** : `useModalState()` pour open/close
- **Validation** : pas inline, utiliser helpers existants ou simple check

### Données disponibles (Groupe A)
- `FriendSnapshot` model depuis `../model/models/FriendSnapshot`
- `buildLeaderboard`, `encodeFriendPayload`, `LeaderboardEntry`, `LeaderboardSort` depuis `../model/utils/leaderboardHelpers`
- `useFriendManager` depuis `../hooks/useFriendManager`
- `User.friendCode` disponible

### HomeScreen
- Lire HomeScreen.tsx pour comprendre le pattern de tuiles existant (section "tiles" ou cards)
- Ajouter une tuile "Classement" dans la section appropriée qui navigue vers `Leaderboard`
- Utiliser le même style que les tuiles existantes (ne pas inventer un nouveau style)

### Navigation
- Lire `navigation/index.tsx` pour voir le pattern existant (route type, lazy loading, etc.)
- La route `Leaderboard` ne prend aucun paramètre

## Étapes

### 1. Ajouter la route dans navigation/index.tsx

Lire `navigation/index.tsx` pour identifier :
- L'endroit où ajouter `Leaderboard: undefined` dans `RootStackParamList`
- L'endroit où ajouter le `<Stack.Screen name="Leaderboard" ...>`

Utiliser le même pattern de lazy loading que les autres écrans secondaires (si applicable).

### 2. Créer LeaderboardScreen.tsx

L'écran a deux sections principales dans une même vue scrollable :
1. **Mon code** — affiche le code encodé + bouton "Partager mon code"
2. **Classement** — liste triable + bouton "Ajouter un ami"

#### Structure du composant

```typescript
// LeaderboardScreen — withObservables wrapping
const enhance = withObservables([], () => ({
  user: database.get('users').query(Q.take(1)).observe().pipe(
    map(users => users[0])
  ),
  friends: database.get('friend_snapshots').query().observe(),
  histories: database.get('histories').query(
    Q.where('deleted_at', null),
    Q.where('is_abandoned', false)
  ).observe(),
}))
```

#### Interface Props
```typescript
interface LeaderboardScreenProps {
  user: User
  friends: FriendSnapshot[]
  histories: History[]
}
```

#### Logique interne
- `totalSessions = histories.length`
- `encodedCode = encodeFriendPayload(user, totalSessions)` — mémoïsé avec `useMemo`
- `leaderboard = buildLeaderboard(user, totalSessions, friends, sort)` — mémoïsé
- Sort state : `useState<LeaderboardSort>('xp')`
- Modal "Ajouter ami" : `useModalState()` + `<BottomSheet>`
- Modal "Retirer ami" : `useModalState()` + `<AlertDialog>`
- `{ importFriend, removeFriend, isImporting } = useFriendManager()`

#### Partage du code
```typescript
import { Share } from 'react-native'
// ...
await Share.share({ message: encodedCode })
haptics.onSuccess()
```

#### Layout LeaderboardScreen

```
┌─────────────────────────────────┐
│ ← Classement                    │  ← Header natif
├─────────────────────────────────┤
│  🏆 MON CODE                    │
│  [code encodé tronqué...]  [📋] │  ← Copier dans clipboard
│  [Partager mon code]            │  ← Share sheet natif
├─────────────────────────────────┤
│  CLASSEMENT          [+ Ajouter]│
│  Trier: [XP] [Streak] [Tonnage] │  ← ChipSelector ou boutons
│                                 │
│  1. 🥇 Gabriel (Moi)     Niv.18 │
│     12 500 XP | 8 sem streak    │
│                                 │
│  2. 🥈 Thomas            Niv.15 │
│     9 200 XP | 5 sem streak  🗑️ │
│                                 │
│  [Aucun ami — hint]             │  ← Si liste vide
└─────────────────────────────────┘
```

#### Rendu d'une entrée de classement

Chaque `LeaderboardEntry` affiche :
- Rang (#1 = 🥇, #2 = 🥈, #3 = 🥉, autres = numéro)
- Nom + badge "Moi" si `isMe`
- Niveau + XP total
- Valeur de tri secondaire (streak ou tonnage selon le sort actif)
- Bouton suppression (icône poubelle) si `!isMe` — avec haptics.onDelete() + AlertDialog

#### BottomSheet "Ajouter un ami"

```
┌─────────────────────────────────┐
│ Ajouter un ami              [×] │
│                                 │
│ [TextInput — Coller le code...] │
│                                 │
│ [Importer]                      │
│                                 │
│ ℹ️ Comment ça marche ?           │
│ [texte explicatif]              │
└─────────────────────────────────┘
```

- TextInput multiligne autorisé
- `importFriend(text.trim())` sur press
- Afficher le résultat ('success' → toast/message vert, 'invalid' → message rouge)
- `haptics.onSuccess()` si succès, pas de haptic si erreur

#### Indication "mis à jour"

Pour les entrées amis, afficher `t.leaderboard.lastUpdated` + date relative (ex: "il y a 2j") basée sur `importedAt`. Formater avec une fonction simple dans le composant ou dans leaderboardHelpers.ts.

### 3. Modifier HomeScreen.tsx

Lire HomeScreen.tsx pour comprendre la structure des tuiles (cards cliquables dans une section).

Ajouter une tuile "Classement" dans la section des tuiles secondaires (pas en premier plan — les tuiles d'entraînement restent prioritaires). Style identique aux tuiles existantes.

```typescript
// Tuile classement
<TouchableOpacity
  onPress={() => { haptics.onPress(); navigation.navigate('Leaderboard') }}
  style={[styles.tileCard, { backgroundColor: colors.card }]}
>
  <Text style={styles.tileIcon}>🏆</Text>
  <Text style={[styles.tileLabel, { color: colors.text }]}>{t.leaderboard.title}</Text>
  {friends.length > 0 && (
    <Text style={[styles.tileSub, { color: colors.textSecondary }]}>
      {friends.length} ami{friends.length > 1 ? 's' : ''}
    </Text>
  )}
</TouchableOpacity>
```

Pour avoir accès à `friends`, ajouter `friends: database.get('friend_snapshots').query().observe()` dans le `withObservables` de HomeScreen.

Lire HomeScreen.tsx en entier avant de modifier pour ne rien casser.

## Contraintes
- Ne pas casser les tuiles existantes de HomeScreen
- Ne pas modifier WorkoutScreen, StatsScreen, ni aucun autre écran
- Pas de `<Modal>` natif — uniquement `<BottomSheet>` et `<AlertDialog>`
- Utiliser `useColors()` et `useLanguage()` — pas de couleurs hardcodées ni textes hardcodés
- Respecter le pattern `withObservables` — pas de `useState` pour les données DB
- Toutes mutations dans `database.write()` (via useFriendManager)
- Pas de `any` TypeScript
- Pas de `console.log` sans `__DEV__`
- Le style doit être cohérent avec le design neumorphique existant (cartes, espacements, typography)
- Utiliser `spacing.*`, `borderRadius.*`, `fontSize.*` du thème

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Navigation vers `Leaderboard` depuis HomeScreen fonctionne
- Import d'un ami avec code valide → apparaît dans le classement
- Import d'un code invalide → message d'erreur
- Suppression d'un ami → AlertDialog de confirmation → supprimé
- Tri par XP/Streak/Tonnage/PRs → classement se réordonne
- Partage du code → Share sheet natif s'ouvre

## Dépendances
Ce groupe dépend de :
- **Groupe A** (schema, models, helpers, useFriendManager)
- **Groupe B** (clés i18n `t.leaderboard.*`)

Lancer APRÈS la complétion des groupes A et B.

## Statut
⏳ En attente
