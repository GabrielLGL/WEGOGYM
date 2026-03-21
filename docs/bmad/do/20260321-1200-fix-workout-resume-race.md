# fix(workout) — Race condition lors du resume de séance
Date : 2026-03-21 12:00

## Instruction
Resume race condition WorkoutScreen

## Rapport source
docs/bmad/verrif/20260321-0822/03-code-review.md (ligne 18)

## Classification
Type : fix
Fichiers modifiés : mobile/src/screens/WorkoutScreen.tsx

## Ce qui a été fait
Séparé le useEffect monolithique (lignes 248-301) en deux effets distincts :

1. **Effect 1** (mount only) : Charge ou crée le History record. Ne touche plus aux sessionExercises.
2. **Effect 2** (dépend de historyId + sessionExercises) : Restaure les sets validés uniquement quand les deux données sont disponibles. Guard `restoredSets !== null` empêche les exécutions multiples.

**Problème :** Le useEffect original avait `[]` comme deps et capturait `sessionExercises` depuis la closure initiale. Si withObservables n'avait pas encore émis les données (ou émettait un tableau vide en premier), le `.find()` à la ligne 270 échouait silencieusement — les sets validés n'étaient pas restaurés lors du resume.

**Risque avant fix :** Low (withObservables/JSI émet de façon synchrone sur WatermelonDB), mais le pattern était fragile et pouvait casser si le comportement de withObservables changeait.

## Vérification
- TypeScript : ✅
- Tests : ✅ 1943 passed
- Nouveau test créé : non (logique async DB, couvert par tests d'intégration)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260321-1200

## Commit
