# Groupe C — Leaderboard Amis : UI

**Date :** 2026-03-11
**Statut :** Terminé

---

## Fichiers créés

- `mobile/src/screens/LeaderboardScreen.tsx` — Écran complet du classement entre amis

## Fichiers modifiés

- `mobile/src/navigation/index.tsx`
  - Ajout de `Leaderboard: undefined` dans `RootStackParamList`
  - Import lazy de `LeaderboardScreen`
  - Ajout de `<Stack.Screen name="Leaderboard" ... />`

- `mobile/src/i18n/fr.ts`
  - Ajout de `navigation.leaderboard: 'Classement'`

- `mobile/src/i18n/en.ts`
  - Ajout de `navigation.leaderboard: 'Leaderboard'`

- `mobile/src/screens/HomeScreen.tsx`
  - Import de `FriendSnapshot`
  - Ajout de `friends: FriendSnapshot[]` dans l'interface `Props`
  - Ajout de `friends` dans le destructuring du composant
  - Ajout de la section "Outils" avec la tuile Classement (affiche le nombre d'amis si > 0)
  - Ajout de `friends` dans `withObservables`

- `mobile/src/screens/__tests__/HomeScreen.test.tsx`
  - Ajout de `friends={[]}` dans tous les appels de rendu de test
  - Mise à jour du test "affiche les 2 sections" → "affiche les sections" (inclut désormais "Outils")
  - Ajout d'une assertion sur la tuile "Classement"

---

## Architecture de LeaderboardScreen

### withObservables
- `user` : `users` collection, `Q.take(1)`, via `.pipe(map(...))`
- `friends` : `friend_snapshots` collection entière
- `histories` : filtrées `deleted_at = null` et `is_abandoned = false`

### Fonctionnalités
- **Code personnel** : encodé via `encodeFriendPayload`, affiché tronqué avec bouton copier (📋) et bouton partager (Share sheet natif)
- **Classement** : `buildLeaderboard()` + tri par XP / Streak / Tonnage / PRs
- **Rang visuel** : 🥇🥈🥉 pour les 3 premiers, numéro sinon
- **Badge "Moi"** : couleur `colors.primary`, fond `colors.primaryBg`
- **Suppression d'ami** : bouton 🗑️ → `haptics.onDelete()` → `AlertDialog` de confirmation → `removeFriend()`
- **Ajout d'ami** : bouton "+ Ajouter un ami" → `BottomSheet` avec `TextInput` + bouton Importer → `importFriend()` → affichage résultat (succès en `colors.primary`, erreur en `colors.danger`)
- **Date relative** : `formatRelative()` pour `importedAt` des amis

### Contraintes respectées
- Pas de `<Modal>` natif — `BottomSheet` + `AlertDialog` via Portal
- `useColors()` pour toutes les couleurs
- `useLanguage()` pour tous les textes
- `useHaptics()` pour le feedback sémantique
- `useModalState()` pour les états modaux
- `withObservables` HOC pour les données DB
- `useFriendManager()` pour les mutations
- Pas de `any` TypeScript
- Pas de `console.log` sans `__DEV__`
- Toutes couleurs via `colors.*` du thème

---

## Résultat TypeScript

```
npx tsc --noEmit → 0 erreurs, 0 warnings
```
