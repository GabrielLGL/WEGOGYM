# feat(home) — WeeklyReportCard sur le HomeScreen
Date : 2026-03-11 20:30

## Instruction
docs/bmad/prompts/20260311-1930-rapport-app-B.md

## Rapport source
docs/bmad/prompts/20260311-1930-rapport-app-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/i18n/fr.ts` (ajout 4 clés weeklyReport)
- `mobile/src/i18n/en.ts` (ajout 4 clés weeklyReport)
- `mobile/src/components/WeeklyReportCard.tsx` (NOUVEAU)
- `mobile/src/screens/HomeScreen.tsx` (intégration card + exercises observable)
- `mobile/src/screens/__tests__/HomeScreen.test.tsx` (ajout prop exercises + fix Volume duplicate)

## Ce qui a été fait
- Ajout clés i18n FR/EN : weeklyReport, vsLastWeek, topMuscles, viewReport
- Création de `WeeklyReportCard.tsx` :
  - Design neumorphique cohérent avec les autres cards
  - KPIs : séances, volume, PRs en ligne
  - Comparaison % vs semaine dernière (vert/rouge)
  - Top 3 muscles
  - Utilise useColors(), useLanguage(), useHaptics()
- Intégration dans HomeScreen :
  - useMemo calcule les données hebdo à partir des helpers existants
  - Card placée après Weekly Activity, avant les grilles
  - Navigation vers 'ReportDetail' (écran à créer par Groupe C)
  - Ajout exercises au withObservables
- Mise à jour du test HomeScreen pour la nouvelle prop exercises

## Vérification
- TypeScript : ✅
- Tests : ✅ 1710 passed
- Nouveau test créé : non (test existant mis à jour)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2030

## Commit
ae7bafc feat(stats,home): weekly report helper + WeeklyReportCard on HomeScreen
