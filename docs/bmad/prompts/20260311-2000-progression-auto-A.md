<!-- v1.0 — 2026-03-11 -->
# Rapport — Progression automatique — Groupe A (Logique) — 20260311-2000

## Objectif
Modifier le pré-remplissage des inputs d'entraînement pour utiliser les valeurs suggérées
par l'algorithme de double progression, plutôt que les valeurs brutes de la dernière session.

**Comportement actuel :**
- `useWorkoutState.ts` appelle `getLastSetsForExercises()` → pré-remplit les inputs avec les
  valeurs exactes de la dernière session (ex: 80kg × 8 reps)
- `suggestProgression()` est appelé dans l'UI mais n'affecte PAS les inputs

**Comportement cible :**
- Si `repsTarget` est défini sur le `SessionExercise` ET qu'une lastPerformance existe :
  → Pré-remplir les inputs avec `suggestProgression(avgWeight, avgReps, repsTarget)`
- Si pas de `repsTarget` OU pas de lastPerformance → comportement inchangé (valeurs dernière session)

## Fichiers concernés
- `mobile/src/hooks/useWorkoutState.ts` — logique principale de pré-remplissage
- `mobile/src/model/utils/exerciseStatsUtils.ts` — `getLastSetsForExercises()` et `getLastPerformanceForExercise()`
- `mobile/src/model/utils/progressionHelpers.ts` — `suggestProgression()` (NE PAS MODIFIER — lire seulement)

## Contexte technique

### Stack
- React Native + Expo 52, Fabric (New Arch), TypeScript strict
- WatermelonDB : mutations obligatoirement dans `database.write()`
- Composants fonctionnels uniquement

### Données disponibles dans useWorkoutState
```typescript
// sessionExercises[] → chaque entrée a :
//   .exerciseId (string)
//   .repsTarget (string | null) — ex: "6-8", "5", null
//   .id (string) — sessionExerciseId

// getLastSetsForExercises(exerciseIds) renvoie :
// Record<exerciseId, Record<setOrder, { weight: number; reps: number }>>

// getLastPerformanceForExercise(exerciseId, historyId) renvoie :
// { maxWeight, avgWeight, avgReps, setsCount, date } | null

// suggestProgression(lastWeight, lastReps, repsTarget) renvoie :
// { suggestedWeight: number, suggestedReps: number, label: string } | null
```

### Stratégie d'implémentation
1. Dans `useWorkoutState.ts`, après avoir récupéré `lastSets` via `getLastSetsForExercises()` :
2. Pour chaque `sessionExercise` qui a un `repsTarget` non-null :
   a. Appeler `getLastPerformanceForExercise(exerciseId, historyId)`
   b. Si lastPerf existe → appeler `suggestProgression(avgWeight, avgReps, repsTarget)`
   c. Si suggestion obtenue → pré-remplir TOUS les sets de cet exercice avec les valeurs suggérées
3. Si pas de suggestion → garder les valeurs de `lastSets` (comportement actuel inchangé)

**Note importante** : Le pré-remplissage par setOrder peut rester le même weight/reps pour tous les sets
(la suggestion donne un poids et des reps uniques, pas set par set). C'est normal.

### Retour d'info à l'UI
Ajouter un champ `prefilledFromSuggestion: Set<string>` (ou `Record<exerciseId, boolean>`) dans
le return de `useWorkoutState`, pour permettre à l'UI (Groupe B) d'afficher un indicateur visuel.

## Étapes
1. Lire `useWorkoutState.ts` entièrement pour comprendre l'état actuel
2. Lire `getLastSetsForExercises()` dans `exerciseStatsUtils.ts`
3. Modifier l'initialisation des inputs dans `useWorkoutState.ts` :
   - Après `getLastSetsForExercises()`, boucler sur les `sessionExercises`
   - Si `repsTarget` défini → `getLastPerformanceForExercise()` + `suggestProgression()`
   - Si suggestion → overwrite les inputs de cet exercice avec les valeurs suggérées
   - Tracker les exerciseIds dont les inputs viennent de la suggestion
4. Exposer `suggestedExerciseIds: Set<string>` dans le return du hook
5. Vérifier que le type `SetInputData` accepte les valeurs numériques converties en string

## Contraintes
- Ne pas casser : validation des sets existante, PR detection, `unvalidateSet`, `totalVolume`
- Respecter : TypeScript strict (pas de `any`), pas de `console.log` sans `__DEV__`
- Mutations DB : uniquement dans `database.write()` (la modification est en lecture seule ici)
- Les tests existants de `progressionHelpers.test.ts` ne doivent pas être cassés
- Ne pas modifier `progressionHelpers.ts` ni `exerciseStatsUtils.ts` (sauf si absolument nécessaire)

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Comportement : si un exercice a repsTarget="6-8" et lastPerf avgWeight=80 avgReps=8 → inputs = 82.5kg × 6
- Comportement : si exercice sans repsTarget → inputs = valeurs dernière session (inchangé)
- Comportement : premier entraînement (pas de lastPerf) → inputs vides (inchangé)

## Dépendances
Aucune dépendance externe. Groupe B dépend de ce groupe (il consomme `suggestedExerciseIds`).

## Statut
⏳ En attente
