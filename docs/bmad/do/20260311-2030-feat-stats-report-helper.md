# feat(stats) — Helper statsReport pour rapports hebdo/mensuels
Date : 2026-03-11 20:30

## Instruction
docs/bmad/prompts/20260311-1930-rapport-app-A.md

## Rapport source
docs/bmad/prompts/20260311-1930-rapport-app-A.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/statsTypes.ts` (ajout interfaces ReportPeriod, ReportSummary)
- `mobile/src/model/utils/statsReport.ts` (NOUVEAU)
- `mobile/src/model/utils/statsHelpers.ts` (re-export)
- `mobile/src/model/utils/__tests__/statsReport.test.ts` (NOUVEAU — 16 tests)

## Ce qui a été fait
- Ajout des interfaces `ReportPeriod` et `ReportSummary` dans `statsTypes.ts`
- Création de `statsReport.ts` avec 3 fonctions :
  - `getWeekPeriod(weekOffset)` — période lundi-dimanche avec label "Sem. X — Mois YYYY"
  - `getMonthPeriod(monthOffset)` — période 1er-dernier jour avec label "Mois YYYY"
  - `computeReportSummary(histories, sets, exercises, period, ctx?)` — agrège les compute*() existants, filtre par période, calcule comparison %
- Re-export depuis `statsHelpers.ts`
- 16 tests couvrant les 3 fonctions

## Vérification
- TypeScript : ✅
- Tests : ✅ 1710 passed
- Nouveau test créé : oui (16 tests)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2030

## Commit
ae7bafc feat(stats,home): weekly report helper + WeeklyReportCard on HomeScreen
