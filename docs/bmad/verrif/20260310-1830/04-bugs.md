# Passe 4/8 — Bugs

**Run:** 20260310-1830

## Bugs trouvés et corrigés

| Sévérité | Fichier | Problème | Correction |
|----------|---------|----------|------------|
| HAUTE | workoutSetUtils.ts:203 | `Promise.all` → si 1 exercice échoue, les autres abandonnés silencieusement | Remplacé par `Promise.allSettled` + log __DEV__ |
| HAUTE | workoutSetUtils.ts:44 | `Math.max(...spread)` → RangeError potentiel sur grand tableau | Remplacé par `reduce()` |
| HAUTE | HistoryDetailScreen.test.tsx:65 | Mock manquant pour `recalculateSetPrsBatch` → crash futur si test handleSave | Ajouté au mock |

## Bugs non bloquants (acceptés)

| Sévérité | Fichier | Problème | Raison acceptation |
|----------|---------|----------|--------------------|
| INFO | HistoryDetailScreen.tsx:441 | `findAndObserve` erreur si exercice supprimé | Mitigé : sets supprimés en premier, ExerciseCard démontée avant |
| INFO | HomeScreen.tsx:674 | `Date.now()` évalué une seule fois dans withObservables | Fenêtre 30j → staleness de quelques heures acceptable |
| INFO | HistoryDetailScreen.tsx:381 | `exercise.muscles?.join` — `?.` inutile (getter retourne toujours []) | Harmless, pas de changement |
