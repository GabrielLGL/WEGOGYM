<!-- v1.0 — 2026-02-27 -->
# Prompt — input-flicker — 20260227-0010

## Demande originale
"quand j'ecris dans series ou poids un chiffre, il disparait et reaparait quasiment instantanément alors que ça ne ce produit pas dans rep j'aimerais regler ça dans tous les endroits de l'app où il y a de la saisie de donnée"

## Analyse
Seul `ExerciseTargetInputs.tsx` est affecté. Les autres composants utilisent déjà le bon pattern :
- `WorkoutExerciseCard` : `localWeight` + `localReps` avec debounce 300ms ✓
- `StatsMeasurementsScreen` : local `form` state ✓
- `SettingsScreen` : local state + save on blur ✓

## Cause
`sets` et `weight` sont des props directes → cycle parent re-render → flicker.
`repsMin`/`repsMax` sont des états locaux → update instantané → pas de flicker.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260227-0010-input-flicker-A.md` | `ExerciseTargetInputs.tsx` | 1 | ⏳ |

## Ordre d'exécution
Un seul groupe, pas de dépendances.
