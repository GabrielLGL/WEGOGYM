<!-- v1.0 — 2026-03-01 -->
# Prompt — workout-ui-colors — 20260301-2000

## Demande originale
dans l'ecran en cours d'entrainement le bouton terminer la seance a les anciennes couleurs, les bouton de valitation de series sont trop voyants/gros et quand on valide c'est aussi les anciennes couleurs quand on veut valider de terminé la séance le texte n'est pas en blanc et dans le resumer certaines couleurs ne sont pas a jours

## Analyse
- **WorkoutScreen.tsx** : `endButton.backgroundColor = colors.success` (devrait être `colors.primary`) + `endButtonText.color = colors.text` (devrait être `colors.primaryText` blanc pur)
- **AlertDialog.tsx** : `buttonText.color = colors.text` pour le bouton confirm → devrait être `colors.primaryText` sur fond coloré
- **WorkoutExerciseCard.tsx** : bouton validate 38×38 trop gros/voyant (fond plein primary), icône checkmark avec mauvaise couleur
- **WorkoutSummarySheet.tsx** : style `completeBadge` sans couleur définie + vérification générale

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260301-2000-workout-ui-colors-A.md` | WorkoutScreen.tsx, AlertDialog.tsx | 1 | ⏳ |
| B | `20260301-2000-workout-ui-colors-B.md` | WorkoutExerciseCard.tsx | 1 | ⏳ |
| C | `20260301-2000-workout-ui-colors-C.md` | WorkoutSummarySheet.tsx | 1 | ⏳ |

## Ordre d'exécution
Tous les groupes sont indépendants — lancer en parallèle (Vague 1 unique).
