# FEAT(exercises) — Wiring navigation ExerciseCatalog — Groupe C

Date : 2026-03-01 20:20

## Instruction
docs/bmad/prompts/20260301-1930-exercise-catalog-C.md

## Rapport source
docs/bmad/prompts/20260301-1930-exercise-catalog-C.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/navigation/index.tsx` (modifié)
- `mobile/src/screens/ExercisesScreen.tsx` (modifié)
- `mobile/src/screens/__tests__/ExercisesScreen.test.tsx` (modifié — fix mock)

## Ce qui a été fait

### `mobile/src/navigation/index.tsx`
- Import de `ExerciseCatalogScreen` ajouté
- `ExerciseCatalog: undefined` ajouté dans `RootStackParamList`
- `<Stack.Screen name="ExerciseCatalog" component={ExerciseCatalogScreen} options={{ title: 'Catalogue global' }} />` ajouté après `CreateExercise`

### `mobile/src/screens/ExercisesScreen.tsx`
- `useLayoutEffect` ajouté dans les imports React
- `useLayoutEffect` dans `ExercisesContent` pour injecter `headerRight` via `navigation.setOptions()` :
  - Icône `globe-outline` (Ionicons, 24px, `colors.primary`)
  - `haptics.onPress()` + `navigation.navigate('ExerciseCatalog')` au press
  - Deps : `[navigation, colors.primary, haptics]`

### `mobile/src/screens/__tests__/ExercisesScreen.test.tsx`
- Ajout de `setOptions: jest.fn()` dans `mockNavigation` — le `useLayoutEffect` appelait `navigation.setOptions()` qui n'était pas mocké, causant `TypeError: navigation.setOptions is not a function` sur tous les tests.

## Vérification
- TypeScript : ✅ `npx tsc --noEmit` → EXIT 0
- Tests : ✅ 1556 passed, 91 suites (2 suites pré-existantes en échec — statsHelpers + statsKPIs — non liées)
- Nouveau test créé : non (navigation — intégration, hors scope)

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260301-2020

## Commit
43a60ef feat(exercises): wire ExerciseCatalog route + globe button in ExercisesScreen header
