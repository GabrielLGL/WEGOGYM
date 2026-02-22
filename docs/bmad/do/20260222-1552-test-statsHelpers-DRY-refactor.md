# TEST+REFACTOR(stats) — statsHelpers coverage + DRY refactoring
Date : 2026-02-22 15:52

## Instruction
docs/bmad/morning/20260222-1530-briefing.md

## Rapport source
docs/bmad/morning/20260222-1530-briefing.md

## Classification
Type : test + refactor
Fichiers modifiés :
- `mobile/src/model/utils/statsHelpers.ts` — exports ajoutés (toDateKey, PERIOD_LABELS, labelToPeriod)
- `mobile/src/model/utils/__tests__/statsHelpers.test.ts` — créé (58 tests)
- `mobile/src/theme/index.ts` — ajout intensityColors, fontSize.hero
- `mobile/src/theme/chartConfig.ts` — créé (createChartConfig factory)
- `mobile/src/components/ChipSelector.tsx` — items: readonly string[]
- `mobile/src/screens/StatsDurationScreen.tsx` — useWindowDimensions, createChartConfig
- `mobile/src/screens/StatsVolumeScreen.tsx` — useWindowDimensions, createChartConfig, import PERIOD_LABELS/labelToPeriod, fontSize.hero
- `mobile/src/screens/StatsRepartitionScreen.tsx` — import PERIOD_LABELS/labelToPeriod (supprimé local)
- `mobile/src/screens/StatsCalendarScreen.tsx` — intensityColors depuis theme, toDateKey depuis statsHelpers
- `mobile/src/screens/StatsMeasurementsScreen.tsx` — useWindowDimensions, createChartConfig

## Ce qui a été fait

### Tests
Créé `statsHelpers.test.ts` avec 58 tests couvrant les 13 exports :
- `formatDuration` (4 tests), `formatVolume` (3), `toDateKey` (3)
- `labelToPeriod` (4), `PERIOD_LABELS` (1)
- `computeGlobalKPIs` (5), `computeCurrentStreak` (6), `computeRecordStreak` (4)
- `computeDurationStats` (4), `computeCalendarData` (4), `computeVolumeStats` (5)
- `computeMuscleRepartition` (3), `computePRsByExercise` (4), `computeTopExercisesByFrequency` (3)
- `computeMotivationalPhrase` (3)

### Refactoring DRY
1. **chartConfig** : Factory `createChartConfig()` dans `theme/chartConfig.ts`, supprimé de 3 écrans (PRIMARY_RGB, TEXT_RGB, chartConfig inline)
2. **PERIOD_LABELS + labelToPeriod** : Exportés depuis statsHelpers, supprimés de StatsVolumeScreen et StatsRepartitionScreen
3. **INTENSITY_COLORS** : Token `intensityColors` dans `theme/index.ts`, supprimé de StatsCalendarScreen
4. **toDateKey** : Exportée depuis statsHelpers, remplace le calcul inline dans StatsCalendarScreen
5. **useWindowDimensions** : Remplace `Dimensions.get('window').width` dans 3 écrans (se met à jour à la rotation)
6. **fontSize: 32** → `fontSize.hero` dans StatsVolumeScreen
7. **ChipSelector.items** : `readonly string[]` pour accepter les tuples as const

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 847 passed (58 nouveaux), 0 failed
- Coverage statsHelpers.ts : Statements 93.1%, Branches 79.8%, Functions 89.7%, Lines 93.7% (> 80% requis)
- Nouveau test créé : oui (58 tests)

## Documentation mise à jour
Aucune — les nouvelles fonctions exportées sont documentées via JSDoc dans leurs fichiers source

## Statut
✅ Résolu — 20260222-1552

## Commit
1cdf093 test(stats): add statsHelpers coverage + DRY refactoring
