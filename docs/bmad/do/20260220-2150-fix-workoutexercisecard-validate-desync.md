# fix(WorkoutExerciseCard) — onValidate valide localState au lieu de l'état parent stale
Date : 2026-02-20 21:50

## Instruction
rapport review 20260220-2145 — bug #1 : WorkoutExerciseCard onValidate
valide input parent stale au lieu de localWeight/localReps —
passer localWeight/localReps au callback ou flush debounce immédiat sur validate

## Rapport source
docs/bmad/reviews/20260220-2145-review.md

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/components/WorkoutExerciseCard.tsx
- mobile/src/components/__tests__/WorkoutExerciseCard.test.tsx

## Ce qui a été fait

### Problème
`onValidate` était défini dans le parent avec `validateSetInput(input.weight, input.reps)` où `input` est l'état parent.
`WorkoutSetRow` utilise `localWeight`/`localReps` (état local avec debounce 300ms).
Si l'utilisateur tapait une valeur puis tappait "✓" avant 300ms, la validation échouait sur l'ancienne valeur (ex: `""` au lieu de `"100"`).

### Fix
1. **Signature `onValidate`** : changée de `() => Promise<void>` → `(weight: string, reps: string) => Promise<void>`
2. **`handleValidate` dans `WorkoutSetRow`** : flush immédiat des deux timers debounce (appel `onUpdateInput` synchrone), puis appel `onValidate(localWeight, localReps)`.
3. **Parent** : `onValidate={async (weight, reps) => { validateSetInput(weight, reps) ... }}` — utilise les valeurs passées par l'enfant.

### Bénéfice double
- La validation est correcte même < 300ms après la frappe.
- Le parent reçoit aussi la valeur finale immédiatement via `onUpdateInput` flushé (état parent cohérent).

## Vérification
- TypeScript : ✅ 0 erreur (erreurs sentry.test.ts pré-existantes non liées)
- Tests : ✅ 674 passed, 0 failed (673 avant + 1 nouveau)
- Nouveau test créé : oui — `flush le debounce et valide avec les valeurs locales si validate tapé < 300ms après la saisie`

## Documentation mise à jour
aucune (pattern debounce déjà documenté, fix mineur de cohérence)

## Statut
✅ Résolu — 20260220-2150

## Commit
5bf9c50 fix(WorkoutExerciseCard): flush debounce on validate to fix localState desync
