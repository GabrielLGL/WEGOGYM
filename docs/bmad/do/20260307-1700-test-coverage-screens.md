# test(screens) — add tests for ExerciseCatalog, CreateExercise, HistoryDetail
Date : 2026-03-07 17:00

## Instruction
docs/bmad/morning/20260306-0900-test-coverage-gaps.md

## Rapport source
docs/bmad/morning/20260306-0900-test-coverage-gaps.md

## Classification
Type : test
Fichiers modifies :
- mobile/src/screens/__tests__/ExerciseCatalogScreen.test.tsx (new)
- mobile/src/screens/__tests__/CreateExerciseScreen.test.tsx (new)
- mobile/src/screens/__tests__/HistoryDetailScreen.test.tsx (new)

## Ce qui a ete fait
Ajout de 31 tests pour 3 screens sans couverture :

**ExerciseCatalogScreen (9 tests)** :
- Rendu initial, barre de recherche, resultats, message vide
- Erreur reseau, debounce recherche, ouverture detail
- Affichage target/equipment, pagination offset 0

**CreateExerciseScreen (11 tests)** :
- Rendu initial, labels (nom, muscles, equipement, description)
- Affichage chips muscles et boutons equipement
- Saisie nom, selection muscle, selection equipement, description
- Creation via database.write, erreur AlertDialog

**HistoryDetailScreen (11 tests)** :
- Rendu sans crash (wrapper withObservables mocke)
- Affichage session, date, duree, note, series
- Boutons supprimer/sauvegarder/ajouter serie
- Confirmation suppression, appel softDeleteHistory
- Helpers integration (softDeleteHistory, addRetroactiveSet, recalculateSetPrs)

## Verification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1589 passed (96 suites), 0 failed (+31 nouveaux tests)
- Nouveau test cree : oui (3 fichiers)

## Documentation mise a jour
aucune

## Statut
✅ Resolu — 20260307-1700

## Commit
6a9a95e test(screens): add tests for ExerciseCatalog, CreateExercise, HistoryDetail
