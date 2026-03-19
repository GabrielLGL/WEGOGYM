# refactor(helpers) — DRY getMondayOfWeek + fixes groupe C
Date : 2026-03-19 12:00

## Instruction
Factorise les 5 implémentations différentes de getMondayOfWeek en un seul helper partagé dans dateHelpers.ts. + StatsScreen handleNavigate → useCallback, exerciseFrequencyHelpers trend guard <14j, muscleBalanceHelpers ratio cap 2 → 5.

## Rapport source
docs/bmad/verrif/20260319-1009/RAPPORT.md — problèmes #3, #6, #7, #13

## Classification
Type : refactor + perf
Fichiers modifiés :
- mobile/src/model/utils/dateHelpers.ts (CRÉÉ)
- mobile/src/model/utils/__tests__/dateHelpers.test.ts (CRÉÉ)
- mobile/src/model/utils/weeklyGoalsHelpers.ts
- mobile/src/model/utils/volumeRecordsHelpers.ts
- mobile/src/model/utils/streakHeatmapHelpers.ts
- mobile/src/model/utils/trainingCalendarHelpers.ts
- mobile/src/model/utils/statsMuscle.ts
- mobile/src/model/utils/exerciseFrequencyHelpers.ts
- mobile/src/model/utils/muscleBalanceHelpers.ts
- mobile/src/screens/StatsScreen.tsx

## Ce qui a été fait
1. **dateHelpers.ts** : Créé avec 3 fonctions centralisées — `getMondayOfWeek(Date)→Date`, `getMondayOfWeekTs(number)→number`, `getMondayOfCurrentWeek()→number`
2. **weeklyGoalsHelpers** : `getWeekStart` remplacé par alias vers `getMondayOfWeek` (re-exporté pour compat tests)
3. **volumeRecordsHelpers** : Fonction locale supprimée, import depuis dateHelpers
4. **streakHeatmapHelpers** : Fonction locale supprimée, import `getMondayOfWeekTs as getMondayOfWeek`
5. **trainingCalendarHelpers** : Idem streakHeatmapHelpers
6. **statsMuscle** : Fonction locale supprimée, import + re-export depuis dateHelpers
7. **StatsScreen** : `handleNavigate` enveloppé dans `useCallback`
8. **exerciseFrequencyHelpers** : Guard `periodDays >= 14` ajouté pour trend detection
9. **muscleBalanceHelpers** : Ratio fallback changé de 2 → 5

## Vérification
- TypeScript : ✅ (2 erreurs préexistantes non liées — sessionIntensityHelpers.amber, StatsMonthlyProgress.TREND_ICONS)
- Tests : ✅ 2229 passed, 1 failed (préexistant — sessionIntensityHelpers couleur)
- Nouveau test créé : oui (dateHelpers.test.ts — 7 tests)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260319-1200

## Commit
