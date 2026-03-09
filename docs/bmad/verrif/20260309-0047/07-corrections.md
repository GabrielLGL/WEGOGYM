# Passe 7/8 — Corrections appliquees
**Date:** 2026-03-09 00:47

## Corrections critiques/warnings
1. **Soft-delete filter** dans `workoutSetUtils.ts` — `getMaxWeightForExercise` filtre maintenant les histories soft-deleted.
2. **Soft-delete filter** dans `exerciseStatsUtils.ts` — `getLastPerformanceForExercise` filtre les histories soft-deleted.
3. **SQL query** dans `useWorkoutCompletion.ts` — JOIN avec histories pour exclure les soft-deleted.
4. **`_muscles` access** dans `ExerciseCatalogScreen.tsx` — utilise le setter `record.muscles` au lieu de `record._muscles`.
5. **Hook `useDeferredMount()`** extrait dans `hooks/useDeferredMount.ts` — remplace le pattern duplique dans 17 ecrans.
6. **i18n** dans `ProgramDetailBottomSheet.tsx` — textes traduits via `t.programDetail.*`.
7. **i18n** dans `ProgramSection.tsx` — textes traduits via `t.home.*`.
8. **i18n** dans `SessionExerciseItem.tsx` — textes traduits via `t.common.notes`, `t.exerciseTargetInputs.*`.
9. **Cle i18n `common.notes`** ajoutee dans `fr.ts` et `en.ts`.

## Verification post-corrections
- `npx tsc --noEmit` → 0 erreurs
- `npx jest --no-coverage` → 112 suites, 1737 tests, 0 fail

## Reste a faire (non bloquant)
- Migration vers `useModalState()` (8 ecrans)
- `useMemo` sur `useStyles` (~30 fichiers)
- Decoupage fichiers > 500 lignes
- Accessibilite (ajout `accessibilityLabel`)
- Traduction MUSCLES_FOCUS_OPTIONS dans useAssistantWizard
