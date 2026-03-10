# Passe 3/8 — Code Review

## Issues Found

### 🔴 CRIT-1: HistoryDetailScreen — edits overwritten on sets emission
**Fichier:** `screens/HistoryDetailScreen.tsx:86-95`
**Problème:** `useEffect` resets ALL edit buffers when `sets` observable emits. Adding a set triggers re-emission → overwrites unsaved edits on other sets.
**Fix:** Merge incoming DB values with existing edits instead of overwriting.

### 🟡 WARN-1: KPI mismatch — sets filtered 30 days but histories unfiltered
**Fichier:** `screens/HomeScreen.tsx:673-676`
**Problème:** `sets` has 30-day + soft-delete filter but `histories` has no time filter. `computeMotivationalPhrase` receives mismatched data.
**Fix:** Document the tradeoff or align filters.

### 🟡 WARN-2: `_celebrationQueue` useState never read — causes unnecessary re-renders
**Fichier:** `screens/HomeScreen.tsx:144`
**Problème:** Queue state only used via setter callback. Could be useRef to avoid re-renders.
**Fix:** Replace with useRef.

### 🟡 WARN-3: Non-reactive exercise names in HistoryDetailScreen
**Fichier:** `screens/HistoryDetailScreen.tsx:102-122`
**Problème:** Exercises fetched imperatively via useState+useEffect. Stale if exercise renamed while screen open.

### 🟡 WARN-4: recalculateSetPrs redundant histories queries
**Fichier:** `model/utils/workoutSetUtils.ts:143-151`
**Problème:** Each concurrent call fetches all histories independently. N calls = N identical queries.

### 🔵 SUGG-1: Hardcoded colors in test files
### 🔵 SUGG-2: Missing deleteWorkoutModal in useCallback deps (stable, no real risk)

## Résumé
- 🔴 Critiques: 1
- 🟡 Warnings: 4
- 🔵 Suggestions: 2
