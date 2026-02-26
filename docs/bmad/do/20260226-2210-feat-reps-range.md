# feat(reps): support range format in reps target input

**Date:** 2026-02-26 22:10
**Type:** feat
**Scope:** reps input + validation

## Résumé

Ajout du support du format range pour le champ reps cible. L'utilisateur peut désormais saisir `"8"` (fixe) ou `"6-8"` (range). Aucun changement de schéma requis — `reps_target` est déjà `string` en DB.

## Fichiers modifiés

### `mobile/src/components/ExerciseTargetInputs.tsx`
- `handleRepsChange` : remplacé parseInt/clamp par filtre regex `^\d{1,2}(-\d{0,2})?$`
- `keyboardType` reps input : `"numeric"` → `"default"` (seul type autorisant `-` sur Android + iOS)
- JSDoc mis à jour : `@param reps` et `@param onRepsChange` mentionnent le format range

### `mobile/src/model/utils/validationHelpers.ts`
- `validateWorkoutInput` : validation reps remplacée par logique range-aware
  - Entier simple : valide si `1 ≤ n ≤ 99`
  - Range `N-M` : valide si `1 ≤ N,M ≤ 99` et `N ≤ M`
  - Autre format : erreur explicite
- JSDoc `@param reps` mis à jour

### `mobile/src/components/__tests__/ExerciseTargetInputs.test.tsx`
- Test "clamp reps à 99" → remplacé par "ignore valeur à 3 chiffres" (nouveau comportement)
- Ajout test "accepte range 6-8"

### `mobile/src/model/utils/__tests__/validationHelpers.test.ts`
- Message d'erreur "reps vide" mis à jour
- Ajout 4 nouveaux tests : range valide, min > max, hors bornes, format invalide

## Vérification

- `npx tsc --noEmit` → 0 erreur ✅
- `npm test` → 67 tests passent ✅

## Comportement attendu

| Saisie | Résultat |
|--------|----------|
| `"8"` | Valide ✅ |
| `"6-8"` | Valide ✅ |
| `"8-6"` | Erreur (min > max) ✅ |
| `"0"` | Erreur ✅ |
| `"abc"` | Ignoré à la frappe ✅ |
| `"6-"` | Accepté en cours de frappe ✅ |
| `"200"` | Ignoré (3 chiffres) ✅ |

## Commit

```
feat(reps): support range format in reps target input (e.g. "6-8")
```
