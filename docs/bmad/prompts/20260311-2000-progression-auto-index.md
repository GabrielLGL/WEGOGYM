<!-- v1.0 — 2026-03-11 -->
# Prompt — Progression automatique (suggestion poids/reps) — 20260311-2000

## Demande originale
Progression automatique (suggestion poids/reps)

## Analyse
L'algorithme de double progression (`suggestProgression`) **existe déjà** dans
`progressionHelpers.ts` et est déjà appelé dans l'UI. Mais les inputs de workout sont
pré-remplis avec les valeurs brutes de la dernière session, pas avec la suggestion.

Gap à combler :
1. Modifier le pré-remplissage pour utiliser les valeurs suggérées (Groupe A - logique)
2. Ajouter un indicateur visuel "↑ Progression appliquée" (Groupe B - UI)

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260311-2000-progression-auto-A.md` | `useWorkoutState.ts` | 1 | ⏳ |
| B | `docs/bmad/prompts/20260311-2000-progression-auto-B.md` | `WorkoutExerciseCard.tsx`, `WorkoutSupersetBlock.tsx`, `WorkoutScreen.tsx`, `fr.ts`, `en.ts` | 2 | ⏳ |

## Ordre d'exécution
- **Vague 1** : Groupe A seul (logique de pré-remplissage + expose `suggestedExerciseIds`)
- **Vague 2** : Groupe B (UI, consomme `suggestedExerciseIds` du Groupe A)

## Fichiers clés (référence)
- `mobile/src/hooks/useWorkoutState.ts`
- `mobile/src/model/utils/progressionHelpers.ts` (NE PAS MODIFIER)
- `mobile/src/model/utils/exerciseStatsUtils.ts`
- `mobile/src/components/WorkoutExerciseCard.tsx`
- `mobile/src/components/WorkoutSupersetBlock.tsx`
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/i18n/fr.ts` + `en.ts`
