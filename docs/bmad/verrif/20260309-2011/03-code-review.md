# Passe 3/8 — Code Review

**Date :** 2026-03-09 20:11

## Points conformes

- Pas de `<Modal>` natif — Portal pattern appliqué partout
- Toutes les mutations WatermelonDB dans `database.write()`
- `withObservables` HOC utilisé systématiquement
- Schema v33 synchronisé avec les modèles
- `useHaptics()` appliqué partout
- `console.*` gardés par `__DEV__`
- Pas de couleurs hardcodées

## Violations détectées

| # | Sévérité | Fichier | Ligne(s) | Problème |
|---|----------|---------|----------|----------|
| 1 | WARN | `hooks/useWorkoutState.ts` | 79, 87, 128 | `updateSetInput`, `validateSet`, `unvalidateSet` pas wrappées en `useCallback` — invalide le `renderWorkoutItem` du FlatList à chaque keystroke |
| 2 | WARN | `hooks/__tests__/useWorkoutCompletion.test.ts` | 85+ (x10) | `let output: any` — 10 occurrences de `any` explicite |
| 3 | WARN | `screens/HomeScreen.tsx` | 145-153 | `handleCloseCelebration` pas wrappée en `useCallback` |
| 4 | SUGG | `screens/SettingsScreen.tsx` | 44-79 | 8 `useState` dupliquant les données WatermelonDB (pattern intentionnel pour optimistic UI) |
| 5 | SUGG | `components/WorkoutExerciseCard.tsx` | 355-357 | `lastPerformance` one-shot observable via `from(Promise)` (acceptable trade-off) |

## Recommandations prioritaires

1. **WARN #1** : Wrapper les 3 fonctions de `useWorkoutState` en `useCallback` — impact perf significatif sur le FlatList workout
2. **WARN #2** : Remplacer `any` par types propres dans les tests
3. **WARN #3** : Wrapper `handleCloseCelebration` en `useCallback`
