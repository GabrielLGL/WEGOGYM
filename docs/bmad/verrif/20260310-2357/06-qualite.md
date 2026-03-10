# 06 — Qualité

**Run:** 2026-03-10 23:57
**Résultat:** 0 critique, 2 moyennes, 3 mineures

## Points conformes
- Couleurs centralisées via useColors() ✅
- fontSize via tokens theme ✅
- console.* gardés par __DEV__ ✅
- Timers avec cleanup ✅
- Observables via withObservables ✅
- Pas de `any` ✅
- i18n structurellement sync (en: typeof fr) ✅
- Patterns critiques (Portal, AlertDialog, BottomSheet, useHaptics, validationHelpers) ✅

## Violations détectées

### 🟡 Moyennes
1. **SessionDetailScreen:129,144** — `handleCreateGroup`/`handleUngroup` sans `useCallback`, invalide DraggableFlatList perf.
2. **StatsMeasurementsScreen:36-42** — Unités `'kg'`/`'cm'` hardcodées non i18n.

### 🔵 Mineures
3. **SessionDetailScreen:123,172** — `cancelSelection`/`handleAddExercise` sans useCallback (incohérence).
4. **AnimatedSplash:20-21** — Couleurs hardcodées (exception documentée, à extraire en constantes).
5. **OnboardingScreen:68-69** — ToastAndroid sans fallback iOS (target Android priority).

## Score : 18/20
