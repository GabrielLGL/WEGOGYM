# Passe 4/8 — Bugs silencieux

## Issues Found

### 🟡 WARN-1: RestTimer `finishTimer` captures potentially stale `haptics`
**Fichier:** `components/RestTimer.tsx:128-157`
**Problème:** `finishTimer` captures `haptics` by closure at mount. If `useHaptics()` returns new object each render, reference is stale.
**Atténuation:** `useHaptics` returns memoized functions — risque réel faible.

### 🟡 WARN-2: useWorkoutCompletion unsafe raw SQL result casting
**Fichier:** `hooks/useWorkoutCompletion.ts:154-161`
**Problème:** `unsafeFetchRaw()` result cast without validation. If SQL format changes, `count` silently becomes 0.
**Fix suggéré:** Add `__DEV__` warning if cast fails.

### 🔵 SUGG-1: useWorkoutState `unvalidateSet` recreated on every validatedSets change
**Fichier:** `hooks/useWorkoutState.ts:128-155`

### 🔵 SUGG-2-5: Various setState after async/unmount patterns
**Fichiers:** `components/settings/SettingsDataSection.tsx`, `hooks/useCalendarDayDetail.ts`, `screens/AssistantPreviewScreen.tsx`, `screens/HistoryDetailScreen.tsx`
**Atténuation:** React 18 tolerates setState after unmount. Risk: negligible.

## Vérifications conformes
- ✅ Toutes les mutations DB dans `database.write()`
- ✅ Tous les timers ont un cleanup
- ✅ Null safety correcte partout
- ✅ Pas de subscribe() sans unsubscribe

## Résumé
- 🔴 Critiques: 0
- 🟡 Warnings: 2
- 🔵 Suggestions: 5
