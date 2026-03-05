# feat(model) — Notes par exercice, couche data
Date : 2026-03-05 22:45

## Instruction
docs/bmad/prompts/20260305-2230-exercise-notes-A.md

## Rapport source
docs/bmad/prompts/20260305-2230-exercise-notes-A.md

## Classification
Type : feat
Fichiers modifies :
- mobile/src/model/schema.ts (v28 -> v29, colonne notes)
- mobile/src/model/migrations.ts (migration v29)
- mobile/src/model/models/SessionExercise.ts (@text notes)
- mobile/src/model/models/Program.ts (duplicate copie notes)
- mobile/src/hooks/useSessionManager.ts (updateExerciseNotes)
- CLAUDE.md (schema v17 -> v29)

## Ce qui a ete fait
1. Schema v29 : ajout colonne `notes` (string, optional) a `session_exercises`
2. Migration v28->v29 : `addColumns` pour la nouvelle colonne
3. Model SessionExercise : ajout `@text('notes') notes?: string`
4. Program.duplicate() : copie le champ `notes` lors de la duplication
5. useSessionManager : nouvelle fonction `updateExerciseNotes(sessionExercise, notes)` exportee
6. CLAUDE.md : mise a jour reference schema v17 -> v29

## Verification
- TypeScript : OK (zero erreur)
- Tests : OK (93 suites, 1560 passed)
- Nouveau test cree : non (changement data layer, pas de logique metier complexe)

## Documentation mise a jour
- CLAUDE.md (version schema)

## Statut
OK - 20260305-2245

## Commit
(a remplir)
