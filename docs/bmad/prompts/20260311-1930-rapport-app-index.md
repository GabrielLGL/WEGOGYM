<!-- v1.0 — 2026-03-11 -->
# Prompt — Rapports hebdo/mensuels in-app — 20260311-1930

## Demande originale
`FINAL` Rapports hebdo/mensuels automatiques pour l'application

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260311-1930-rapport-app-A.md | `statsReport.ts`, `statsTypes.ts`, `statsHelpers.ts` | 1 | ⏳ |
| B | 20260311-1930-rapport-app-B.md | `WeeklyReportCard.tsx`, `HomeScreen.tsx`, `fr.ts`, `en.ts` | 1 | ⏳ |
| C | 20260311-1930-rapport-app-C.md | `ReportDetailScreen.tsx`, `navigation/index.tsx` | 2 | ⏳ |

## Ordre d'exécution
- **Vague 1** : A et B en parallèle (fichiers différents, aucune dépendance croisée)
- **Vague 2** : C après A (utilise `computeReportSummary` de A) et après B (utilise les clés i18n de B)

## Architecture
Pas de nouveau modèle DB — tout est calculé à la volée depuis les données réactives existantes (History, Set, Exercise). Les helpers stats existants (`computeGlobalKPIs`, `computeVolumeStats`, `computeMuscleRepartition`, `computePRsByExercise`, `computeDurationStats`) sont réutilisés via un agrégateur `computeReportSummary()`.
