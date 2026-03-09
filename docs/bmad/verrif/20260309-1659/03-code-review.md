# Passe 3/8 — Code Review

**Date :** 2026-03-09 16:59

## Résultat : 7 problèmes trouvés

### CRITICAL

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| C1 | `useWorkoutState.ts` | 87-155 | `validateSet`/`unvalidateSet` non wrappées dans `useCallback` → re-renders cascade sur WorkoutScreen |
| C2 | `useWorkoutCompletion.ts` | 176-192 | Race condition : lecture `user.*` puis écriture après plusieurs `await` → last-write-wins si User modifié entre-temps |

### WARNING

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| W1 | `HistoryDetailScreen.tsx` | 102-122 | Fetch impératif des exercices (`useState` + `useEffect`) au lieu de `withObservables` réactif |
| W2 | `ExerciseCatalogScreen.tsx` | 200 | `useDetailStyles` non memoized (StyleSheet.create sur chaque render) |
| W3 | `ProgramsScreen.tsx` | 88-104 | BackHandler capture `.close()` depuis closure initiale → fragile si refs changent |

### SUGGESTION

| # | Fichier | Lignes | Description |
|---|---------|--------|-------------|
| S1 | `useAssistantWizard.ts` | 58 | `MUSCLES_FOCUS_OPTIONS` hardcodé en français, non traduit via i18n |
| S2 | WorkoutExerciseCard, WorkoutSupersetBlock, etc. | -- | Pattern `createStyles` au lieu de `useStyles` → inconsistance avec le reste du codebase |
