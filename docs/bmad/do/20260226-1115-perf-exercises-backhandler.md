# PERF(screens) — Memoize FlatList + BackHandler race condition
Date : 2026-02-26 11:15

## Instruction
docs/bmad/verrif/20260226-0938/RAPPORT.md

## Rapport source
docs/bmad/verrif/20260226-0938/RAPPORT.md

## Classification
Type : perf / fix
Fichiers modifiés :
- `mobile/src/screens/ExercisesScreen.tsx`
- `mobile/src/screens/ProgramsScreen.tsx`

## Ce qui a été fait

### ExercisesScreen.tsx — Memoize FlatList items (Groupe C #3)
- Extraction du rendu de chaque ligne en un composant `ExerciseItem` séparé (`memo<ExerciseItemProps>`)
- Le linter a ajouté un comparateur custom adapté à WatermelonDB (qui mute les instances en place) :
  vérifie `item.name`, `item.equipment`, `item.muscles` en plus de la référence objet
- Extraction de `handleOptionsPress` en `useCallback` stable avec les bonnes dépendances
- `renderExerciseItem` réduit à une ligne passant `ExerciseItem + handleOptionsPress`
- **Impact** : les items ne re-rendent plus quand un modal s'ouvre/ferme dans l'écran parent

### ProgramsScreen.tsx — BackHandler race condition (Groupe C #4)
- Ajout d'un `backHandlerVisibilityRef` (objet ref) pour tracker les 4 états de visibilité
- Un `useEffect` dédié synchronise le ref avec l'état courant (dépendances: les 4 states)
- L'effet BackHandler passe maintenant à **deps vides `[]`** — enregistré une seule fois au mount
- **Impact** : élimine la fenêtre sans handler entre `remove()` et `addEventListener()` à chaque changement d'état
- Le ref pattern garantit que `backAction` lit toujours la valeur fraîche

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : ✅ 50 passed, 0 failed (ExercisesScreen + ProgramsScreen + StatsExercisesScreen)
- Nouveau test créé : non (comportement inchangé pour l'utilisateur)

## Documentation mise à jour
aucune (changements internes de performance, patterns déjà documentés)

## Statut
✅ Résolu — 20260226-1115

## Commit
4a0479a perf(screens): memoize FlatList items + fix BackHandler race condition
