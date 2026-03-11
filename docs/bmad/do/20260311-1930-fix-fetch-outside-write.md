# fix(model) — fetch() outside database.write()
Date : 2026-03-11 19:30

## Instruction
docs/bmad/morning/20260311-1900-fetch-outside-write.md

## Rapport source
docs/bmad/morning/20260311-1900-fetch-outside-write.md

## Classification
Type : fix
Fichiers modifies :
- mobile/src/model/utils/workoutSessionUtils.ts
- mobile/src/model/models/Exercise.ts
- mobile/src/model/utils/workoutSetUtils.ts
- mobile/src/model/utils/__tests__/workoutSetUtils.test.ts
- mobile/src/model/utils/__tests__/databaseHelpers.test.ts

## Ce qui a ete fait
- **workoutSessionUtils.ts** : 5 fonctions (createWorkoutHistory, completeWorkoutHistory, abandonWorkoutHistory, updateHistoryNote, softDeleteHistory) — deplace `find()` avant `database.write()`
- **Exercise.ts** : deleteAllAssociatedData — deplace 3 `query().fetch()` avant `database.write()`, seul le batch reste dans le write
- **workoutSetUtils.ts** :
  - `createSetRecord` refactorise pour accepter `history: History` et `exercise: Exercise` en params (plus de find internes)
  - `saveWorkoutSet` et `addRetroactiveSet` font les find avant le write puis passent les objets
  - `deleteWorkoutSet` — deplace `query().fetch()` avant le write, early return si 0 sets (skip write inutile)
- **Tests** : 2 tests adaptes pour verifier que write n'est PAS appele quand aucun set ne correspond (comportement plus optimal)

## Verification
- TypeScript : OK 0 erreurs
- Tests : OK 1694 passed
- Nouveau test cree : non (tests existants adaptes)

## Documentation mise a jour
aucune

## Statut
Resolu — 20260311-1930

## Commit
e4bc8b9 fix(model): move fetch/find outside database.write() to prevent deadlocks
