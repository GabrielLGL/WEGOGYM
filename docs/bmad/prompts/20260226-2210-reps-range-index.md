<!-- v1.0 — 2026-02-26 -->
# Prompt — reps-range — 20260226-2210

## Demande originale
"nan la tu a modifier le nombre de series moi je vaus modifier les reps avoir une range
6-8, un seul endroit pour ecrire les reps mais les choses autorisées sont soit
repmin-repmax soit rep et il met tout seul soit repmin et repmax soit repmin = repmax"

## Analyse
Feature : reps range dans un **seul input texte**. L'utilisateur tape `8` (valeur fixe)
ou `6-8` (range). Pas de changement de schéma — `reps_target` est déjà `string`.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260226-2210-reps-range-A.md` | ExerciseTargetInputs.tsx, validationHelpers.ts | 1 | ⏳ |

## Ordre d'exécution
Groupe unique — pas de dépendances.
