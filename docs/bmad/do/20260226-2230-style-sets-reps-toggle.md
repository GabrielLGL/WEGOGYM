# style(ExerciseTargetInputs): revert séries single input + toggle Fixe/Plage pour les reps

**Date:** 2026-02-26 22:30
**Type:** style + feat
**Scope:** ExerciseTargetInputs + callers (ExercisePickerModal, SessionDetailScreen, useSessionManager)

## Résumé

Deux changements UX dans `ExerciseTargetInputs` :
1. **Revert séries** : suppression du mode range séries (setsMax). Un seul input numérique pour les séries, propre et simple.
2. **Toggle reps Fixe/Plage** : remplacement du texte libre ("6-8") par deux chips **Fixe | Plage** dans le label Reps. En mode Plage : deux inputs numériques [min] — [max] qui composent "N-M" pour le parent. Clavier numérique pur dans les deux modes.

## Fichiers modifiés

### `mobile/src/components/ExerciseTargetInputs.tsx` (réécrit)
- Suppression props `setsMax` et `onSetsMaxChange`
- Suppression du rendu conditionnel séries double
- Ajout état local `repsMode` / `repsMin` / `repsMax`
- Ajout handlers `handleRepsMinChange`, `handleRepsMaxChange`, `switchToFixed`, `switchToRange`
- Ajout toggle UI (chips Fixe/Plage) dans le header Reps
- Rendu conditionnel reps : input unique (Fixe) ou deux inputs (Plage)
- `repsWrapper` avec `flex: 1.4` pour laisser de la place au toggle
- `keyboardType="numeric"` dans les deux modes

### `mobile/src/components/ExercisePickerModal.tsx`
- Suppression `targetSetsMax`, `setTargetSetsMax` (useState)
- Suppression `setsMax`/`onSetsMaxChange` du reset useEffect
- `validateWorkoutInput` sans 4e param
- `onAdd` sans `setsMax`, interface `ExercisePickerModalProps.onAdd` mise à jour

### `mobile/src/screens/SessionDetailScreen.tsx`
- Suppression `targetSetsMax`, `setTargetSetsMax` de la destructuration hook
- `handleAddExercise` sans param `setsMax`
- `ExerciseTargetInputs` sans `setsMax`/`onSetsMaxChange`

### `mobile/src/hooks/useSessionManager.ts`
- Suppression `targetSetsMax`, `setTargetSetsMax` du state
- `addExercise` : 5 params (plus de `setsMax`), plus de `setsTargetMax` en DB write
- `updateTargets` : plus de `setsMaxVal`, plus de `se.setsTargetMax`
- `prepareEditTargets` : plus de `setTargetSetsMax`
- `resetTargets` : plus de `setTargetSetsMax`
- Return du hook : plus de `targetSetsMax`/`setTargetSetsMax`

Note: la colonne `sets_target_max` reste dans le schéma v24 (données existantes préservées).

### Tests mis à jour (4 fichiers)
- `ExerciseTargetInputs.test.tsx` : remplacement "mode range séries" → "toggle reps Fixe/Plage" (5 tests), correction "ignore reps 3 chiffres" → "clamp à 99"
- `ExercisePickerModal.test.tsx` : mock sans setsMax, assertions onAdd sans ''
- `useSessionManager.test.ts` : addExercise 5 args, suppression targetSetsMax/setTargetSetsMax, suppression test setsTargetMax

## Vérification

- `npx tsc --noEmit` → 0 erreur ✅
- `npm test` → 109 tests passent ✅

## Comportement attendu

| UX | Résultat |
|----|----------|
| Séries : un seul input | ✅ |
| Reps Fixe : input numérique clamp 1-99 | ✅ |
| Reps → Plage → [6] [10] → parent "6-10" | ✅ |
| Reps → Plage → [6] [] → parent "6" (valide) | ✅ |
| reps="6-10" → démarre en mode Plage | ✅ |

## Commits

```
style(ExerciseTargetInputs): revert sets to single input, remove setsMax
feat(reps): replace text range input with Fixe/Plage toggle in ExerciseTargetInputs
```
