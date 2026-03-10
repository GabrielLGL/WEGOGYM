# 03 — Code Review

**Run:** 2026-03-11 00:24
**Contexte:** Post-3 /do tasks (testClaudeConnection, observeCurrentUser, i18n units)

## /do tasks — Vérification conformité
- ✅ testClaudeConnection: max_tokens 2048→10, température 0 (claudeProvider.ts:59)
- ✅ HistoryDetailScreen: formatDuration importé de statsDuration.ts (L29, L137)
- ✅ observeCurrentUser(): créé dans userObservable.ts, re-exporté via databaseHelpers.ts, utilisé dans 6+ écrans
- ✅ i18n units: weightUnit/lengthUnit dans fr.ts et en.ts, utilisés dans StatsMeasurementsScreen

## Violations détectées

### 🟡 Moyennes
1. **HistoryDetailScreen:414** — `<Text>kg</Text>` hardcodé au lieu de `t.statsMeasurements.weightUnit`
2. **ExerciseHistoryScreen:110,129,169** — 3x `kg` hardcodé (PR display, Y-axis, set chips)
3. **HomeScreen:330** — `${totalVolume} kg` hardcodé dans résumé hebdo
4. **StatsCalendarScreen:379** — `${s.weight} kg` hardcodé dans detail sets
5. **ExerciseHistoryScreen:110** — `reps` hardcodé (devrait être `t.workout.reps`)

### 🔵 Mineures
6. **WorkoutSummarySheet:30-34** — `formatDuration(seconds)` locale duplique le nom de `formatDuration(minutes)` dans statsDuration.ts (signatures différentes)

## Score : 17/20
