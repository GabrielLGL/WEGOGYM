# Prompt exécuté — ChartsScreen WatermelonDB Join — 2026-02-19

## Prompt original
Crash log : "To nest Q.on inside Q.and/Q.or you must explicitly declare Q.experimentalJoinTables"
Composant : withObservables[exerciseId] { setsForExercise, histories, sessions } (ChartsContent)

## Prompt généré
Corriger les deux queries problématiques dans ObservableExerciseStats :
1. histories : ajouter Q.experimentalJoinTables(['sets'])
2. sessions : ajouter Q.experimentalJoinTables(['histories']) + Q.experimentalNestedJoin('histories', 'sets')

## Résultat

Ce qui a été fait :
- Query `histories` : ajout de `Q.experimentalJoinTables(['sets'])` en tête
- Query `sessions` : ajout de `Q.experimentalJoinTables(['histories'])` + `Q.experimentalNestedJoin('histories', 'sets')`

Fichiers modifiés :
- `mobile/src/screens/ChartsScreen.tsx` (+3 lignes)

Tests : ✅ 499/500 passed (1 fail pré-existant dans providerUtils.test.ts, hors scope)
TypeScript : ✅ 0 erreur
Commit : 44d1bd0
Push : ✅ 0bb7103..44d1bd0 main -> main
