# refactor(workoutSetUtils, WorkoutSummarySheet) — DRY + rename
Date : 2026-03-11 12:00

## Instruction
workoutSetUtils createSetRecord DRY + WorkoutSummarySheet formatDuration rename ← groupe C (parallèle)

## Rapport source
Description directe

## Classification
Type : refactor
Fichiers modifiés :
- mobile/src/model/utils/workoutSetUtils.ts
- mobile/src/components/WorkoutSummarySheet.tsx

## Ce qui a été fait
1. **workoutSetUtils.ts** — Extracted private `createSetRecord` helper that both `saveWorkoutSet` and `addRetroactiveSet` delegate to. Eliminates duplicated history/exercise fetch + set creation logic (identical 7-line bodies).
2. **WorkoutSummarySheet.tsx** — Renamed local `formatDuration` → `formatElapsedTime` to disambiguate from `statsDuration.formatDuration` (different signature: seconds→MM:SS vs minutes→Xh Ym).

## Vérification
- TypeScript : ✅ zero errors
- Tests : ✅ 33 passed (workoutSetUtils ×13, WorkoutSummarySheet ×20)
- Nouveau test créé : non (private helper, public API unchanged)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-1200

## Commit
bcbe051 refactor(workoutSetUtils, WorkoutSummarySheet): extract createSetRecord DRY helper + rename formatDuration
