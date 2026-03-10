# Passe 3/8 — Code Review

## Résultat : 1 warning trouvé

### 🟡 W1 — Hardcoded locale in ExerciseHistoryScreen chart labels

**Fichier :** `screens/ExerciseHistoryScreen.tsx:67`
**Problème :** La chart utilise `toLocaleDateString('fr-FR', ...)` alors que `dateLocale` est défini dynamiquement (ligne 54) et utilisé correctement pour l'historique (ligne 159). Incohérence i18n.
**Fix :** Remplacer `'fr-FR'` par `dateLocale` sur la ligne 67.

### ✅ Points positifs

- Architecture withObservables cohérente sur tous les écrans
- Portal pattern respecté (pas de `<Modal>` natif)
- useHaptics() utilisé partout
- Validation centralisée via validationHelpers.ts
- DRY : databaseHelpers.ts barrel re-export fonctionne bien
- Soft-delete correctement filtré dans les queries
- useStyles memoizé dans tous les écrans
- WorkoutScreen : cleanup isMountedRef, cancelled flag pattern OK
- recalculateSetPrsBatch : dedup via Set + single write
