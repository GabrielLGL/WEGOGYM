# style(theme) — hardcoded borderRadius → tokens theme
Date : 2026-03-09 03:00

## Instruction
hardcoded borderRadius → tokens theme (7 fichiers) — groupe D

## Rapport source
description directe

## Classification
Type : style
Fichiers modifiés :
- mobile/src/screens/SessionDetailScreen.tsx (22 → borderRadius.xl)
- mobile/src/screens/StatsVolumeScreen.tsx (3 → borderRadius.xxs, x2)
- mobile/src/screens/StatsCalendarScreen.tsx (6 → borderRadius.xs, 8 → borderRadius.sm)
- mobile/src/theme/chartConfig.ts (16 → borderRadius.md)
- mobile/src/theme/__tests__/chartConfig.test.ts (16 → borderRadius.md)
- mobile/src/screens/__tests__/StatsDurationScreen.test.tsx (mock 16 → 14)
- mobile/src/screens/__tests__/StatsMeasurementsScreen.test.tsx (mock 16 → 14)

## Ce qui a été fait
Remplacé toutes les valeurs hardcodées de borderRadius par les tokens du theme (`borderRadius.*`).
Mapping appliqué : 3→xxs(2), 6→xs(4), 8→sm(10), 16→md(14), 22→xl(26).

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1737 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260309-0300
