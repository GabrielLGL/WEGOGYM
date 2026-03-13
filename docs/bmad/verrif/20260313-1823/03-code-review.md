# Passe 3 — Code Review — 20260313-1823

## 🔴 CRITIQUE (4)

### C1 — Race condition dans `useFriendManager.removeFriend()`
**Fichier**: `mobile/src/hooks/useFriendManager.ts:74-81`
- Fetch des snapshots en dehors de `database.write()` → race condition possible
- Pas de try-catch → état `isImporting` peut rester actif si erreur

### C2 — Parsing JSON non sécurisé dans `decodeFriendPayload()`
**Fichier**: `mobile/src/model/utils/leaderboardHelpers.ts:55-64`
- Cast `as FriendCodePayload` sans validation des types numériques
- `totalXp` peut être string → calculs faux, injection de données

### C3 — Type coercion non-sécurisée dans `buildLeaderboard()`
**Fichier**: `mobile/src/model/utils/leaderboardHelpers.ts:106`
- Cast `as number` sur les données triées sans vérification → NaN si données corrompues → classement aléatoire

### C4 — `colors.primary + '20'` dans ShareCard
**Fichier**: `mobile/src/components/ShareCard.tsx`
- Si `colors.primary` est undefined → `"undefined20"` → style invalide

## 🟡 WARNINGS (3)

### W1 — Pas de contrainte unique `friend_code` dans le schéma
**Fichier**: `mobile/src/model/schema.ts` + `mobile/src/model/models/FriendSnapshot.ts`
- Pas d'index unique → doublons possibles + queries O(n)

### W2 — useCallback avec 11 dépendances dans WorkoutSummarySheet
**Fichier**: `mobile/src/components/WorkoutSummarySheet.tsx:141`
- Array de dépendances excessif → re-création fréquente du callback
- `recapExercises.map()` appelé 2 fois

### W3 — Types inline complexes dans sous-composants ShareCard
**Fichier**: `mobile/src/components/ShareCard.tsx`
- `ReturnType<typeof useColors>` inline fragile

## 🔵 SUGGESTIONS (1)
- S1 : Manque de validation des données importées (xp >= 0, level >= 1, etc.) dans `importFriend`

---
**Score Code Review** : à affiner en passe 4-5 pour confirmer les critiques réels.
