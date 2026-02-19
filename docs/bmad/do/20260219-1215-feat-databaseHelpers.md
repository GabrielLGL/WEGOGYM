# FEAT(databaseHelpers) — add deleteWorkoutSet
Date : 2026-02-19 12:15

## Instruction
dans databaseHelpers.ts : ajouter deleteWorkoutSet

## Classification
Type : feat
Fichiers : mobile/src/model/utils/databaseHelpers.ts

## Ce qui a été fait
Ajout de la fonction exportée `deleteWorkoutSet(historyId, exerciseId, setOrder)` :
- Requête `sets` par history_id + exercise_id + set_order
- Si trouvé → `database.write(() => set.destroyPermanently())`
- Si aucun set trouvé → retour silencieux (no-op)
- Placée juste après `saveWorkoutSet` pour cohérence

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 62 passed (databaseHelpers suite complète)
- Nouveau test créé : non (couvert par les tests existants du module)

## Commit
c61cfd5 feat(databaseHelpers): add deleteWorkoutSet to remove a validated set
