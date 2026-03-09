# Passe 3/8 — Code Review
**Date:** 2026-03-09 00:47

## Critiques (0)
Aucun.

## Warnings (7)
1. **useModalState() non adopte uniformement** — ~25 etats modaux dans 8 ecrans utilisent `useState(false)` au lieu de `useModalState()`. Ecrans: WorkoutScreen, ProgramDetailScreen, ProgramsScreen, SessionDetailScreen, ExercisesScreen, ChartsScreen, HistoryDetailScreen, CreateExerciseScreen.
2. **Acces direct `_muscles`** dans ExerciseCatalogScreen l.389 → **CORRIGE** (utilise maintenant `record.muscles = muscles`).
3. **Acces direct `_raw`** dans StatsCalendarScreen (7 occurrences) — contourne l'API WatermelonDB.
4. **Textes hardcodes sans i18n** dans ProgramDetailBottomSheet, ProgramSection, SessionExerciseItem → **CORRIGE**.
5. **`useStyles` sans `useMemo`** dans ~30 fichiers — recreation d'objets a chaque rendu.
6. **`any` dans tests** — 10 occurrences `let output: any` dans useWorkoutCompletion.test.ts.
7. **Accessibilite quasi-absente** — seulement 6 annotations dans tout le codebase.

## Suggestions
- Migration progressive vers `useModalState()` pour les ecrans restants.
- Ajout `useMemo` sur `useStyles` dans les composants restants.
- Ajout d'annotations d'accessibilite.
