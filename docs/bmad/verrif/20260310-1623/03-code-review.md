# Passe 3/8 — Code Review

## Issues Found

### 🔴 CRIT-1: `recalculateSetPrs` called sequentially for each exercise after batch save
**Fichier:** `screens/HistoryDetailScreen.tsx:214-217`
**Problème:** After `handleSave` completes its `database.write()`, it calls `recalculateSetPrs(exId)` in a loop. Each call does its own `database.write()` with fetches. With 5 exercises, that's 15+ sequential DB operations freezing the UI.
**Fix suggéré:** Run them concurrently with `Promise.all()` (safe since each targets different exercise data).

### 🟡 WARN-1: `Program.duplicate()` uses sequential creates instead of batch
**Fichier:** `model/models/Program.ts:47-86`
**Problème:** Inside `database.write()`, creates sessions and exercises one by one with N+1 queries (fetches exercise for each SE). For 5 sessions x 6 exercises = 65 sequential operations.
**Fix suggéré:** Use `prepareCreate` + single `database.batch()`. Access `se.exercise.id` without fetching.

### 🟡 WARN-2: `HistoryDetailScreen` fetches exercises imperatively via useState+useEffect
**Fichier:** `screens/HistoryDetailScreen.tsx:81,102-122`
**Problème:** Exercises loaded via imperative `.fetch()` + `useState`. If exercise renamed while screen open, data stale.
**Fix suggéré:** Add exercises to `withObservables` layer.

### 🟡 WARN-3: `getLastPerformanceForExercise` in withObservables is one-shot Promise
**Fichier:** `components/WorkoutExerciseCard.tsx:355-363`, `components/WorkoutSupersetBlock.tsx:108-116`
**Problème:** `from(getLastPerformanceForExercise(...))` fires once, doesn't re-emit when sets change.
**Fix suggéré:** Accept as design tradeoff (correct at mount, used during active workout) — add documenting comment.

### 🟡 WARN-4: HomeScreen observes entire `sets` table without filter
**Fichier:** `screens/HomeScreen.tsx:674`
**Problème:** Observes all sets (thousands for active users). Every set change triggers full recalculation.
**Fix suggéré:** Filter sets to relevant time range, or only observe sets whose history is not soft-deleted.

### 🔵 SUGG-1: AnimatedSplash hardcoded colors
**Fichier:** `components/AnimatedSplash.tsx:20-21`
**Problème:** `#181b21` and `#00cec9` hardcoded (justified — rendered before ThemeProvider).
**Fix suggéré:** Import raw dark constants from theme/index.ts.

### 🔵 SUGG-2: ExerciseCatalogScreen uses 6 separate useState for API state
**Fichier:** `screens/ExerciseCatalogScreen.tsx:284-290`
**Problème:** Loading/error/data managed via 6 useState calls — risk of impossible states.
**Fix suggéré:** Consider useReducer with explicit states.

## Résumé
- 🔴 Critiques: 1
- 🟡 Warnings: 4
- 🔵 Suggestions: 2
