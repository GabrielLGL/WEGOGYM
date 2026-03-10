# Passe 7/8 — Corrections

**Date :** 2026-03-10 18:54

## 7a — Critiques 🔴 (2 corrigés)

### C1 — Test mocks `unsafeFetchRaw` manquants
**Fichiers :** `model/utils/__tests__/databaseHelpers.test.ts`, `model/utils/__tests__/buildRecapExercises.test.ts`
**Problème :** Après la migration de `getMaxWeightForExercise` vers SQL aggregation (`unsafeSqlQuery`+`unsafeFetchRaw`), les mocks utilisaient encore `fetch()` → 6 tests en échec.
**Fix :** Mocks mis à jour pour utiliser `unsafeFetchRaw` avec les résultats au format SQL (`{ max_weight: N }`).

## 7b — Warnings 🟡 (1 corrigé)

### W1 — `recalculateSetPrsBatch` deduplication
**Fichier :** `model/utils/workoutSetUtils.ts`
**Problème :** Pas de déduplication des `exerciseIds` → recalculs concurrents potentiellement stale si doublon.
**Fix :** `const uniqueIds = [...new Set(exerciseIds)]`

## Non corrigés (risque régression / hors scope verrif)

- CR-1 (MUSCLES_FOCUS_OPTIONS i18n) : **Faux positif** — les labels sont traduits au rendu via `t.assistant.musclesFocus[muscle]`
- CR-2/CR-3 (StatsVolumeScreen/ExerciseHistoryScreen perf) : Optimisation perf, nécessite refactoring queries → `/do`
- CR-4 (ErrorBoundary i18n) : Refactoring class→functional wrapper → `/do`
- CR-5 (abandon workout data) : Changement de comportement fonctionnel → `/do` avec design decision
- B-2 (deleteAllData CGU reset) : Choix fonctionnel délibéré → à valider

## Vérification post-correction

- TypeScript : ✅ 0 erreur
- Tests : ✅ 1691 passed, 108 suites, 0 fail
