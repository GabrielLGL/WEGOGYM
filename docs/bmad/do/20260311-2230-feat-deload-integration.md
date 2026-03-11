# feat(deload) — Intégration HomeScreen + réconciliation types
Date : 2026-03-11 22:30

## Instruction
docs/bmad/prompts/20260311-2000-deload-C.md

## Rapport source
docs/bmad/prompts/20260311-2000-deload-C.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/HomeScreen.tsx (intégration DeloadRecommendationCard)
- mobile/src/components/DeloadRecommendationCard.tsx (réconciliation types → import depuis deloadHelpers)

## Ce qui a été fait
- Réconcilié les types : supprimé les types locaux de DeloadRecommendationCard, importés depuis deloadHelpers.ts (source de vérité Groupe A)
- Ajouté useMemo dans HomeScreen pour calculer la recommandation deload (volumes hebdo depuis sets, histories pour jours consécutifs)
- useState local pour dismiss session-scoped
- Card insérée entre WeeklyReportCard et les tuiles de navigation
- setsPerMuscle passé à undefined (simplicité MVP)
- Pas de schema change (v35 conservé), pas de modification de updateStreak()

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 33 passed (HomeScreen + DeloadRecommendationCard + deloadHelpers)
- Nouveau test créé : non (tests existants couvrent le rendu)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2230

## Commit
(voir ci-dessous)
