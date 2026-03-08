# Passe 2/8 — Tests

**Date :** 2026-03-08 14:01
**Commande :** `npx jest --verbose --coverage`

## Résultat

- **Test Suites:** 1 failed, 111 passed, 112 total
- **Tests:** 1 failed, 1736 passed, 1737 total

## Test en échec

### WorkoutExerciseCard.test.tsx — "affiche le résumé de la série validée"

**Erreur :** `Unable to find an element with text: 80 kg × 10 reps`

Le test cherche `'80 kg × 10 reps'` comme texte unique, mais le composant rend le poids/reps dans des `<Text>` séparés (weight, kg, ×, reps individuellement).

**Fix :** Adapter le test pour chercher les éléments individuellement au lieu d'un seul string.

## Couverture

| Métrique   | Score  |
|------------|--------|
| Statements | 80.16% |
| Branches   | 69.31% |
| Functions  | 73.17% |
| Lines      | 82.35% |
