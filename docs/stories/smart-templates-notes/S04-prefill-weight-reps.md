# S04 — Pre-remplissage poids + reps dans useWorkoutState
> Feature: smart-templates-notes | Priorite: Must | Dependance: S02

## Description
Modifier `useWorkoutState` et `buildInitialInputs` pour consommer le nouveau format de `getLastSetsForExercises` et pre-remplir les reps en plus des poids.

## Fichiers modifies
- `mobile/src/hooks/useWorkoutState.ts`

## Taches techniques
1. Modifier le type de `initialWeights` en `initialData: Record<string, Record<number, { weight: number; reps: number }>>`
2. Modifier `buildInitialInputs()` pour remplir `reps` depuis `lastData.reps`
3. Garder le fallback : si pas d'historique → champs vides
4. Mettre a jour les tests existants

## Criteres d'acceptation
- [ ] Reps pre-remplies en string (ex: "10") depuis l'historique
- [ ] Poids pre-remplis (comportement existant preserve)
- [ ] Si pas d'historique → champs vides (fallback)
- [ ] Pas de crash si erreur DB (graceful)
- [ ] `npx tsc --noEmit` passe
- [ ] Tests unitaires
