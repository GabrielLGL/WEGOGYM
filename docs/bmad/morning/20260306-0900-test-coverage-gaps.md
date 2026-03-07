# Tests manquants — 3 screens sans couverture

## Statut : ✅ Résolu — 20260307-1700

## Contexte
La couverture est a ~80.71% (1 572 tests, 93 suites). Trois screens n'ont pas de tests :
- `ExerciseCatalogScreen`
- `CreateExerciseScreen`
- `HistoryDetailScreen`

## Actions
1. Creer les fichiers de test :
   - `mobile/src/screens/__tests__/ExerciseCatalogScreen.test.tsx`
   - `mobile/src/screens/__tests__/CreateExerciseScreen.test.tsx`
   - `mobile/src/screens/__tests__/HistoryDetailScreen.test.tsx`
2. Pour chaque screen, tester :
   - Rendu initial sans crash
   - Interactions principales (boutons, inputs)
   - Integration WatermelonDB (mocks)
   - Cas limites (liste vide, erreurs)
3. Viser 80%+ de couverture par screen
4. Commit : `test(screens): add tests for ExerciseCatalog, CreateExercise, HistoryDetail`

## Patterns de test existants
- Voir `mobile/src/screens/__tests__/` pour les patterns existants
- Mock WatermelonDB avec `@nozbe/watermelondb/adapters/sqlite/test`
- Mock i18n avec `__mocks__/LanguageContextMock.ts`

## Risques
- Les mocks WatermelonDB peuvent etre complexes
- S'assurer que les tests sont deterministes

## Priorite : IMPORTANT
Augmente la confiance avant la soumission Play Store.

## Résolution
Rapport do : docs/bmad/do/20260307-1700-test-coverage-screens.md
