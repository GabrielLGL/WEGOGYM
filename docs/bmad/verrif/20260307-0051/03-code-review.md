# Passe 3 — Code Review
**Date:** 2026-03-07 00:51

| # | Sev | Fichier | Ligne | Probleme | Action |
|---|-----|---------|-------|----------|--------|
| C1 | CRIT | `components/WorkoutExerciseCard.tsx` | 301,306,311,315 | 4 strings FR hardcodees — pas i18n | FIXE |
| C2 | CRIT | `model/utils/statsVolume.ts` | 157 | `buildWeeklyActivity` ne filtre pas les histories soft-deleted | FIXE |
| W1 | WARN | `components/WorkoutSummarySheet.tsx` | 63 | `formatWeight` dead ternary — branches identiques | FIXE |
| W2 | WARN | `components/WorkoutExerciseCard.tsx` | 352-361 | `exercise.observe()` appele 2x dans withObservables — double subscription | FIXE |
| W3 | WARN | `screens/ProgramDetailScreen.tsx` | 257-260 | `setIsAlertVisible(false)` inatteignable si onConfirm throw — dialog bloquee | FIXE |
| W4 | WARN | `screens/ProgramsScreen.tsx` | 302-305 | Meme probleme — dialog bloquee sur erreur DB | FIXE |
| W5 | WARN | `model/models/SessionExercise.ts` | 18-19 | `@field` sur colonnes string `superset_id`/`superset_type` — devrait etre `@text` | FIXE |
| W6 | WARN | `components/BottomSheet.tsx` | 8 | `Dimensions.get` au scope module — casse sur rotation | NON FIXE (Android portrait lock) |
| S1 | SUGG | `screens/StatsVolumeScreen.tsx` | 107 | `muscleLabel` stocke comme string localisee — risque desync langue | NON FIXE (low risk) |
| S2 | SUGG | `components/WorkoutSummarySheet.tsx` | 179,235 | Index comme key dans les listes recap | NON FIXE (sheet modale, pas de reorder) |

**Critiques:** 2 (fixes)
**Warnings:** 6 (5 fixes, 1 ignore justifie)
**Suggestions:** 2 (ignores)
