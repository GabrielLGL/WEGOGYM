# feat(workout) — Pré-remplissage des inputs avec suggestion de double progression
Date : 2026-03-11 20:25

## Instruction
docs/bmad/prompts/20260311-2000-progression-auto-A.md

## Rapport source
docs/bmad/prompts/20260311-2000-progression-auto-A.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/hooks/useWorkoutState.ts`

## Ce qui a été fait
- Ajout des imports `getLastPerformanceForExercise` (depuis databaseHelpers) et `suggestProgression` (depuis progressionHelpers)
- Ajout du state `suggestedExerciseIds: Set<string>` initialisé à `new Set()`
- Refactoring de l'useEffect : remplace `getLastSetsForExercises().then()` par une fonction async `loadInputs()` qui :
  1. Récupère `lastWeights` via `getLastSetsForExercises(exerciseIds)`
  2. Pour chaque `sessionExercise` avec `repsTarget != null`, appelle `getLastPerformanceForExercise(exerciseId, historyId)` en parallèle via `Promise.all`
  3. Si `lastPerf` existe → appelle `suggestProgression(lastPerf.avgWeight, lastPerf.avgReps, se.repsTarget)`
  4. Si suggestion obtenue → overwrite tous les sets de cet exercice dans `lastWeights` avec `{weight: suggestion.suggestedWeight, reps: suggestion.suggestedReps}` et ajoute `exerciseId` au Set
  5. Appelle `buildInitialInputs` et `setSuggestedExerciseIds` avec les résultats
- Exposition de `suggestedExerciseIds` dans le return du hook (consommé par le Groupe B)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 60 passed (progressionHelpers + useWorkoutState)
- Nouveau test créé : non (logique couverte par les tests existants du hook)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2025

## Commit
[sera rempli]
