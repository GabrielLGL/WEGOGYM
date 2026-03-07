# Passe 1/8 — Build & TypeScript

**Date :** 2026-03-07 22:24
**Commande :** `npx tsc --noEmit`

## Résultat initial

**4 erreurs TS2345** dans `src/model/utils/__tests__/buildRecapExercises.test.ts`

Les données de test `validatedSets` ne contenaient pas le champ `isPr` requis par `ValidatedSetData`.

- Ligne 61 : `{ reps: 10, weight: 80 }` → manque `isPr`
- Ligne 85 : `{ reps: 10, weight: 80 }` → manque `isPr`
- Ligne 98 : 3 entrées → manque `isPr`
- Ligne 115 : `{ reps: 10, weight: 90 }` → manque `isPr`

## Correction

Ajout de `isPr: false` à toutes les entrées de test.

## Résultat après correction

**0 erreurs** ✅
