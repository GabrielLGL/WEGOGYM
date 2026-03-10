# Passe 3/8 — Code Review

**Date :** 2026-03-10 18:32

## Résumé : 1 CRIT, 4 WARN, 3 SUGG

---

### 🔴 CR-1 — Stale closure `unvalidateSet` cascade re-renders
**Fichier :** `hooks/useWorkoutState.ts:128-155`
`unvalidateSet` dépend de `validatedSets` dans ses deps → recréé à chaque validation de set → cause re-render en cascade de tout le workout.
**Fix :** Utiliser un ref `validatedSetsRef` (pattern déjà utilisé pour `setInputsRef`).

---

### 🟡 CR-2 — N+1 queries dans `getMaxWeightForExercise`
**Fichier :** `model/utils/workoutSetUtils.ts:19-45`
Chaque validation de set fetch TOUTES les histories + tous les sets de l'exercice. Avec 500+ sessions, 2 requêtes complètes par set.
**Fix :** SQL aggregation `MAX(weight)` en une seule requête.

### 🟡 CR-3 — HomeScreen observe TOUTES les histories sans filtre temps
**Fichier :** `screens/HomeScreen.tsx:671`
`histories` charge tout l'historique alors que seules les données récentes sont utilisées.
**Fix :** Filtrer à 90 jours ou splitter en queries ciblées.

### 🟡 CR-4 — Stale `validatedSets` dans superset rest timer logic
**Fichier :** `screens/WorkoutScreen.tsx:281-310`
`handleValidateSet` vérifie `validatedSets[...]` pour la logique superset, mais la state peut être stale lors de validations rapides.
**Fix :** Utiliser `validatedSetsRef` pour lire l'état courant.

### 🟡 CR-5 — Accès synchrone à lazy relation `se.exercise.id`
**Fichier :** `hooks/useWorkoutState.ts:18,59`
Fonctionne via l'API interne WatermelonDB mais fragile. Considérer un `@field('exercise_id')` explicite.

---

### 🔵 CR-6 — `useWorkoutCompletion` empty deps pattern
**Fichier :** `hooks/useWorkoutCompletion.ts:242`
`completeWorkout` avec `useCallback([], [])` et ref — fonctionne mais non-conventionnel.

### 🔵 CR-7 — ExercisePickerModal: ScrollView pour grande liste
**Fichier :** `components/ExercisePickerModal.tsx:155-179`
`.map()` dans ScrollView au lieu de FlatList virtualisée.

### 🔵 CR-8 — `handleTilePress` non memoized
**Fichier :** `screens/HomeScreen.tsx:210`
Fonction non wrappée dans `useCallback`, recréée à chaque render.
