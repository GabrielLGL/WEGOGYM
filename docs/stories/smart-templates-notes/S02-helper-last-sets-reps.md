# S02 — Etendre getLastSetsForExercises : retourner poids + reps
> Feature: smart-templates-notes | Priorite: Must | Dependance: —

## Description
Modifier `getLastSetsForExercises()` pour retourner les reps en plus des poids. Le type de retour passe de `Record<string, Record<number, number>>` a `Record<string, Record<number, { weight: number; reps: number }>>`.

## Fichiers modifies
- `mobile/src/model/utils/databaseHelpers.ts`

## Taches techniques
1. Modifier le type de retour de `getLastSetsForExercises`
2. Modifier la boucle finale : `setData[s.setOrder] = { weight: s.weight, reps: s.reps }`
3. Mettre a jour les tests existants si necessaire

## Criteres d'acceptation
- [ ] Type retour : `Record<string, Record<number, { weight: number; reps: number }>>`
- [ ] Reps incluses dans les donnees retournees
- [ ] Retourne `{}` si exerciseIds vide
- [ ] Ne retourne que les sets de la derniere History non soft-deleted
- [ ] `npx tsc --noEmit` passe
- [ ] Tests unitaires
