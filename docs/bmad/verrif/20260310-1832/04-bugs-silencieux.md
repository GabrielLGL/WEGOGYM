# Passe 4/8 — Bugs Silencieux

**Date :** 2026-03-10 18:32

## Résumé : 0 CRIT, 3 WARN, 5 SUGG

### Points positifs
- ✅ Tous les `database.write()` sont corrects
- ✅ Zéro `any` en production
- ✅ Tous les `console.*` gardés par `__DEV__`
- ✅ Pas de `AbortSignal.timeout()` (Hermes)
- ✅ Tous les timers ont cleanup
- ✅ Pas de `.subscribe()` manuels — tout via `withObservables`
- ✅ Schema-model sync OK
- ✅ Données sensibles via `expo-secure-store`

---

### 🟡 B-1 — `duplicateSession()` ne remappe pas les superset IDs
**Fichier :** `hooks/useProgramManager.ts:159-175`
Lors de la duplication d'une session, `supersetId` est copié tel quel → les exercices dupliqués partagent les mêmes IDs de superset que l'original. `Program.duplicate()` remappe correctement — cette logique session-level devrait faire pareil.
**Fix :** Ajouter un `supersetIdMap` (comme dans `Program.duplicate()`).

### 🟡 B-2 — Quick-start pourrait naviguer vers une session supprimée
**Fichier :** `screens/HomeScreen.tsx:194-199, 300`
`lastCompletedHistory.session.id` → si la session a été supprimée, naviguer vers Workout avec un `sessionId` inexistant causerait un crash dans `findAndObserve`.
**Fix :** Guard navigation + error handling dans WorkoutScreen.

### 🟡 B-3 — Stale closure `unvalidateSet` (doublon CR-1)
**Fichier :** `hooks/useWorkoutState.ts:128-155`
Même problème que CR-1.

---

### 🔵 B-4 — `startErrorModal.open()` dans useEffect sans dep
**Fichier :** `screens/WorkoutScreen.tsx:214`
Refs stables → pas de bug runtime, mais ESLint flaggerait.

### 🔵 B-5 — `onboardingModal.open()` dans useEffect sans dep
**Fichier :** `screens/ProgramsScreen.tsx:115-120`
Idem B-4.

### 🔵 B-6 — `recalculateSetPrsBatch` concurrent writes perf
**Fichier :** `model/utils/workoutSetUtils.ts:203`
`Promise.allSettled` queue des write() séquentiels — léger overhead vs un seul batch.

### 🔵 B-7 — `BodyMeasurement.date` utilise `@field` au lieu de `@date`
**Fichier :** `model/models/BodyMeasurement.ts:8`
Incohérence de style, pas de bug fonctionnel.

### 🔵 B-8 — ExercisesScreen focus listener refs modals
**Fichier :** `screens/ExercisesScreen.tsx:103-112`
Refs stables, pas de bug mais code smell.
