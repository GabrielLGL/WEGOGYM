# Passe 2/8 — Tests

**Date :** 2026-03-10 18:54
**Commande :** `npx jest --no-cache`

## Résultat

✅ **108 suites, 1691 tests — 0 fail**

### Note
6 tests échouaient initialement (`unsafeFetchRaw is not a function`) car les mocks de `getMaxWeightForExercise` n'avaient pas été mis à jour après la migration vers SQL aggregation. Corrigé dans `databaseHelpers.test.ts` et `buildRecapExercises.test.ts`.
