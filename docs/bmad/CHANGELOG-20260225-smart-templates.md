# Changelog -- Smart Templates + Notes Exercice -- 2026-02-25

## Resume
Feature core Phase 1 Fondations : pre-remplissage intelligent des seances + notes persistantes par exercice.

## Decisions cles
- Notes sur Exercise (global) et non SessionExercise (par seance) : plus simple, meilleure UX
- Double progression : range = +reps puis +poids ; fixe = +poids seulement
- Increment fixe +2.5 kg (standard musculation)
- Suggestion informative (texte) sans modifier les inputs pre-remplis
- Edition inline (TextInput onBlur) sans modal pour ne pas casser le flow workout
- progressionHelpers.ts separe de databaseHelpers.ts (separation of concerns)

## Stories implementees
| Story | Description | Statut |
|-------|-------------|--------|
| S01 | Schema migration: colonne notes sur exercises | PASS |
| S02 | getLastSetsForExercises retourne poids + reps | PASS |
| S03 | Helper suggestProgression + parseRepsTarget | PASS |
| S04 | Pre-remplissage poids + reps dans useWorkoutState | PASS |
| S05 | Indicateur visuel suggestion progression | PASS |
| S06 | Notes editables inline WorkoutExerciseCard | PASS |
| S07 | Indicateur note SessionExerciseItem | PASS |

## Resultat QA
- 1172 tests : tous passent
- 30 nouveaux tests (progressionHelpers)
- 0 erreur TypeScript de cette feature
- 7/7 criteres d'acceptation valides
