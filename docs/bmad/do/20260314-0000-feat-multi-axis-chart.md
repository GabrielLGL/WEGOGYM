# feat(stats) — Multi-axis chart toggle in exercise history
Date : 2026-03-14 00:00

## Instruction
docs/bmad/prompts/20260314-0000-sprint5-D.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/ExerciseHistoryScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Ajout du type `ChartMetric = 'weight' | 'reps' | 'orm' | 'volume'`
- Import de `EPLEY_FORMULA_DIVISOR` depuis `model/constants`
- État local `chartMetric` (useState) dans `ExerciseHistoryContent`
- `chartData` useMemo rendu dynamique selon la métrique sélectionnée :
  - `weight` → `stat.maxWeight` (existant)
  - `reps` → `Math.max(...stat.sets.map(s => s.reps))` (calculé depuis sets)
  - `orm` → `Math.round(maxWeight * (1 + maxReps / EPLEY_FORMULA_DIVISOR))`
  - `volume` → `Math.round(stat.sets.reduce((acc, s) => acc + s.weight * s.reps, 0))`
- Toggle de 4 chips au-dessus du graphique (style chip actif = `colors.primary`)
- Titre de section dynamique (`t.exerciseHistory.chartMetric[chartMetric]`)
- `formatYLabel` conditionnel : unité kg pour weight/orm, valeur brute pour reps/volume
- 4 styles ajoutés : `metricToggle`, `metricChip`, `metricChipActive`, `metricChipText`, `metricChipTextActive`
- Clés `chartMetric.{weight,reps,orm,volume}` ajoutées dans fr.ts et en.ts

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés
- Tests : ✅ 22 passed (ExerciseHistoryScreen + exerciseStatsUtils)
- Nouveau test créé : non (comportement purement UI / calcul couvert par tests existants)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0000

## Commit
21de6f5 feat(stats): multi-axis chart toggle in exercise history — weight/reps/1RM/volume
