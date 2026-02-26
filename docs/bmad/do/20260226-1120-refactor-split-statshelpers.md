# REFACTOR(stats) — Découpage statsHelpers.ts en sous-modules
Date : 2026-02-26 11:20

## Instruction
docs/bmad/prompts/20260226-1120-split-statshelpers-B.md

## Rapport source
docs/bmad/prompts/20260226-1120-split-statshelpers-B.md

## Classification
Type : refactor
Fichiers modifiés :
- `mobile/src/model/utils/statsHelpers.ts` (transformé en barrel)
- `mobile/src/model/utils/statsTypes.ts` (créé)
- `mobile/src/model/utils/statsDateUtils.ts` (créé)
- `mobile/src/model/utils/statsDuration.ts` (créé)
- `mobile/src/model/utils/statsVolume.ts` (créé)
- `mobile/src/model/utils/statsMuscle.ts` (créé)
- `mobile/src/model/utils/statsPRs.ts` (créé)
- `mobile/src/model/utils/statsKPIs.ts` (créé)

## Ce qui a été fait
- Extraction des 12 types/interfaces + PERIOD_LABELS dans `statsTypes.ts`
- Extraction de `toDateKey`, `labelToPeriod`, `getPeriodStart` dans `statsDateUtils.ts`
- Extraction de `computeDurationStats`, `formatDuration` dans `statsDuration.ts`
- Extraction de `computeVolumeStats`, `computeCalendarData`, `buildHeatmapData`, `formatVolume` dans `statsVolume.ts`
- Extraction de `computeMuscleRepartition`, `computeSetsPerMuscleWeek`, `computeSetsPerMuscleHistory` dans `statsMuscle.ts`
- Extraction de `computePRsByExercise`, `computeTopExercisesByFrequency` dans `statsPRs.ts`
- Extraction de `computeGlobalKPIs`, `computeCurrentStreak`, `computeRecordStreak`, `computeMotivationalPhrase` dans `statsKPIs.ts`
- `statsKPIs.ts` importe `formatVolume` depuis `./statsVolume` (dépendance cross-fichier gérée)
- `statsHelpers.ts` réduit à 15 lignes de barrel `export * from './...'`
- Aucun fichier importeur modifié — compatibilité totale garantie par le barrel

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 71 passed (statsHelpers) / 1206 passed (global)
- Nouveau test créé : non (fonctions pures — tests existants couvrent tout)

## Documentation mise à jour
aucune (refactor interne, API publique inchangée)

## Statut
✅ Résolu — 20260226-1120

## Commit
[sera rempli à l'étape 7]
