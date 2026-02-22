# Passe 2/8 — Tests — 20260222-1519

## Résultat
✅ **789 tests passed**, 0 failed, 46 suites

## Couverture

| Métrique | Score |
|----------|-------|
| Statements | 62.21% |
| Branches | 54.75% |
| Functions | 54.29% |
| Lines | 64.42% |

## Fichiers à 0% de couverture (potentiellement critiques)

### Nouveaux écrans stats (feature récente)
- `screens/StatsScreen.tsx` — 0%
- `screens/StatsDurationScreen.tsx` — 0%
- `screens/StatsVolumeScreen.tsx` — 0%
- `screens/StatsCalendarScreen.tsx` — 0%
- `screens/StatsRepartitionScreen.tsx` — 0%
- `screens/StatsExercisesScreen.tsx` — 0%
- `screens/StatsMeasurementsScreen.tsx` — 0%

### Helpers sans tests
- `model/utils/statsHelpers.ts` — 0% (logique pure, critique)

### Autres écrans à 0%
- `screens/AssistantScreen.tsx` — 0%
- `screens/ChartsScreen.tsx` — 0%

### Models à 0%
- `model/models/BodyMeasurement.ts` — 0%

### Services à 0% ou faible
- `services/ai/types.ts` — 0% (types, acceptable)
- `services/ai/programGenerator/exerciseSelector.ts` — 0%
- `services/ai/programGenerator/sessionBuilder.ts` — 0%
- `services/ai/openaiProvider.ts` — 50%

## Priorité pour augmenter la couverture
1. **`statsHelpers.ts`** — logique pure, facile à tester, fort impact
2. **`exerciseSelector.ts` + `sessionBuilder.ts`** — logique métier AI
3. **Nouveaux écrans stats** — au moins les renders de base
