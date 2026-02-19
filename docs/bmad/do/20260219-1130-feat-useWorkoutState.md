# feat(useWorkoutState) — ajouter unvalidateSet
Date : 2026-02-19 11:30

## Instruction
dans useWorkoutState.ts : ajouter unvalidateSet

## Classification
Type : feat
Fichiers :
- mobile/src/hooks/useWorkoutState.ts
- mobile/src/hooks/__tests__/useWorkoutState.test.ts

## Ce qui a été fait
Ajout de `unvalidateSet(sessionExercise, setOrder)` dans `useWorkoutState` :
- Vérifie que `historyId` est présent et que le set est bien dans `validatedSets`
- Fetch l'exercice depuis `sessionExercise.exercise.fetch()`
- Appelle `deleteWorkoutSet(historyId, exercise.id, setOrder)` (déjà disponible dans databaseHelpers)
- Supprime l'entrée de `validatedSets`
- Soustrait `weight * reps` du `totalVolume`
- Retourne `false` en cas d'erreur sans modifier l'état

Import de `deleteWorkoutSet` ajouté dans le fichier hook.
6 nouveaux tests couvrant : historyId vide, set non validé, fetch null, happy path, volume, erreur DB.

## Vérification
- TypeScript : ✅ (zéro erreur)
- Tests : ✅ 28 passed (22 existants + 6 nouveaux)
- Nouveau test créé : oui (6 cas)

## Commit
99f9f17 feat(useWorkoutState): add unvalidateSet to reverse a validated set
