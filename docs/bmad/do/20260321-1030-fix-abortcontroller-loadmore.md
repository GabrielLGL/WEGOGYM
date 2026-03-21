# fix(catalog) — AbortController loadMore ExerciseCatalogScreen
Date : 2026-03-21 10:30

## Instruction
AbortController loadMore ExerciseCatalogScreen

## Rapport source
Description directe

## Classification
Type : fix
Fichiers modifiés : mobile/src/screens/ExerciseCatalogScreen.tsx

## Ce qui a été fait
- Ajout d'un `abortMoreRef` dédié pour stocker le controller de `loadMore`
- `loadMore` annule maintenant la requête précédente avant d'en lancer une nouvelle
- `loadInitial` annule aussi les requêtes `loadMore` en cours (évite les race conditions query change + pagination)
- Cleanup unmount annule les deux controllers (initial + loadMore)
- Guard `controller.signal.aborted` dans le finally de `loadMore` (cohérent avec `loadInitial`)

## Vérification
- TypeScript : OK
- Tests : 1943 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
OK — 20260321-1030

## Commit
