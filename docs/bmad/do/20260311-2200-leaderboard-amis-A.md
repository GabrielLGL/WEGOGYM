# Leaderboard Amis — Groupe A : Data Layer

**Date :** 2026-03-11 22:00
**Statut :** Terminé

---

## Fichiers modifiés

### Schéma & Migrations
- `mobile/src/model/schema.ts` — version 36 → 37 ; ajout colonne `friend_code` dans `users` ; ajout table `friend_snapshots` (11 colonnes)
- `mobile/src/model/migrations.ts` — ajout migration `toVersion: 37` (addColumns users + createTable friend_snapshots)

### Modèles
- `mobile/src/model/models/User.ts` — ajout `@text('friend_code') friendCode!: string`
- `mobile/src/model/models/FriendSnapshot.ts` — **créé** (Model WatermelonDB, 11 champs)
- `mobile/src/model/index.ts` — import + enregistrement de `FriendSnapshot` dans `modelClasses`

### Utilitaires
- `mobile/src/model/utils/leaderboardHelpers.ts` — **créé** (interfaces LeaderboardEntry, LeaderboardSort ; fonctions generateFriendCode, encodeFriendPayload, decodeFriendPayload, buildLeaderboard)
- `mobile/src/model/seed.ts` — ajout `u.friendCode = generateFriendCode()` lors de la création initiale du user

### Hooks
- `mobile/src/hooks/useFriendManager.ts` — **créé** (importFriend, removeFriend, isImporting, error)

---

## Notes d'implémentation

- Le schéma était déjà à v36 (progress_photos avait été ajouté précédemment), la migration leaderboard utilise donc `toVersion: 37`.
- `FriendSnapshot` utilise `@readonly @date('created_at')` et `@readonly @date('updated_at')` — WatermelonDB les gère automatiquement.
- `useFriendManager` : toutes les mutations sont dans `database.write()`, imports statiques uniquement, `console.log` gardé par `__DEV__`.
- `generateFriendCode` produit des codes de format `KORE-XXXXXX` (charset sans ambiguïtés : sans 0/O/1/I).
- `decodeFriendPayload` : le bloc `catch` est vide (sans binding `e`) conformément à TypeScript strict — pattern autorisé.

---

## Erreurs rencontrées

Aucune.

---

## Validation TypeScript

```
npx tsc --noEmit
```

Résultat : **0 erreur, 0 avertissement**.
