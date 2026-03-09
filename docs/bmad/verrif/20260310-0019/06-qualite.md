# Passe 6/8 — Code mort & qualité

**Date :** 2026-03-10 00:19

## Points conformes
- Aucun `any` en code de production (seulement dans __tests__)
- Aucun `<Modal>` natif — Portal pattern respecté partout
- Tous les console.* gardés par `__DEV__`
- Pas de Redux/Context pour les données — WatermelonDB partout

## Violations

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🔵 SUGG | ProgramsScreen.tsx | 211 | `paddingBottom: 150` magic number |
| 2 | 🔵 SUGG | ProgramDetailScreen.tsx | 289 | `paddingBottom: 100` magic number |
| 3 | 🔵 SUGG | ExerciseCatalogScreen.tsx | 623 | `paddingTop: 80` magic number |
| 4 | 🔵 SUGG | ChartsScreen.tsx | 352 | `marginTop: 50` magic number |
| 5 | 🔵 SUGG | ExercisePickerModal.tsx | 251 | `height: 200` magic number |
| 6 | 🔵 SUGG | ExerciseInfoSheet.tsx | 112 | `height: 200` magic number |
| 7 | 🔵 SUGG | HistoryDetailScreen.tsx | 490,500 | `width: 55`, `width: 60` magic numbers |
| 8 | 🔵 SUGG | StatsExercisesScreen.tsx | 193 | `height: 45` magic number |
| 9 | 🔵 SUGG | SessionDetailScreen.tsx | 459,477 | `height: 44`, `height: 50` magic numbers |
| 10 | 🔵 SUGG | CustomModal.tsx | 37-40 | Shadow hardcodée au lieu de neuShadow |
| 11 | 🔵 SUGG | CoachMarks.tsx | 340-343 | Shadow hardcodée |
| 12 | 🔵 SUGG | StatsDurationScreen.tsx | 416-419 | Shadow hardcodée |
| 13 | 🔵 SUGG | ProgramsScreen.tsx | 369-372 | Shadow hardcodée |
| 14 | 🔵 SUGG | ExercisesScreen.tsx | 375 | Shadow hardcodée |
| 15 | 🔵 SUGG | RestTimer.tsx | 205 | Shadow hardcodée |
| 16 | 🔵 SUGG | ExercisePickerModal.tsx | 235 | Shadow hardcodée |
| 17 | 🔵 SUGG | 16 fichiers | — | letterSpacing hardcodé sans token centralisé |

## Bilan
- 🔴 CRIT : 0
- 🟡 WARN : 0
- 🔵 SUGG : ~17
