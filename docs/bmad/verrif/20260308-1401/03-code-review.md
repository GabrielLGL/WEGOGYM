# Passe 3/8 — Code Review

**Date :** 2026-03-08 14:01

## Résumé

- 🔴 Critiques : 1
- 🟡 Warnings : 3
- 🔵 Suggestions : 2

## Violations détectées

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🔴 | WorkoutHeader.tsx | 35 | Chaîne française hardcodée `séries` au lieu de i18n |
| 2 | 🟡 | WorkoutHeader.tsx | 47-96 | `useStyles()` appelle `StyleSheet.create()` sans `useMemo` |
| 3 | 🟡 | WorkoutSupersetBlock.tsx | 219-222 | `exerciseColors` useMemo dépend de `sessionExercises` (référence instable) |
| 4 | 🟡 | ExercisesScreen.tsx | 346-354 | `useExerciseItemStyles()` sans memoization dans FlatList item |
| 5 | 🔵 | ExercisesScreen.tsx | 331-344 | 14 constantes magiques au lieu des tokens du thème |
| 6 | 🔵 | WorkoutSupersetBlock.tsx | 94-119 | Props passthrough inutiles dans withObservables |
