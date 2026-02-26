# Index — fix(ExerciseTargetInputs) saisie rapide

**Date :** 2026-02-27

## Groupes

| Groupe | Fichier | Statut |
|--------|---------|--------|
| A | `20260227-0300-fix-input-fast-type-A.md` | ✅ Terminé |

## Résumé

Race condition corrigée dans `ExerciseTargetInputs` : le clamping a été déplacé de `onChangeText` vers `onBlur` pour les 4 inputs (sets, weight, repsMin, repsMax).

- TypeScript : 0 erreur
- Tests : 26/26 ✓
