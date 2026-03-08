# UI Review — WorkoutSetRow — 20260308

## Diagnostic
| # | Probleme | Severite | Statut |
|---|----------|----------|--------|
| 1 | Touch target validate btn 32×32 < 44px | :red_circle: | Corrige (40×40) |
| 2 | Inputs deconnectes du suffix (kg/reps separes) | :yellow_circle: | Corrige (bloc unifie) |
| 3 | Inputs trop petits (62/52px, padding 4px) | :yellow_circle: | Corrige (flex, padding 8px) |
| 4 | Row plate sans profondeur | :yellow_circle: | Corrige (input border subtle) |
| 5 | Etat valide banal (texte simple) | :blue_circle: | Corrige (poids/reps split, bold, undo discret) |

## Corrections appliquees
| Fichier | Modification |
|---------|-------------|
| `WorkoutExerciseCard.tsx` | Inputs unifies (inputBlock = input + suffix), flex layout, border subtle |
| `WorkoutExerciseCard.tsx` | Badge: 30×30, fond cardSecondary, border discrete |
| `WorkoutExerciseCard.tsx` | Validate btn: 40×40, fond primaryBg quand valid, icone 22px |
| `WorkoutExerciseCard.tsx` | Validated: poids/reps splittes en gras, multiply "×" style, undo btn 28×28 discret |
| `WorkoutExerciseCard.tsx` | PR chip: plus gros padding, fond primary 25%, letterSpacing |
| `WorkoutExerciseCard.tsx` | Row padding: ms (12px) au lieu de sm (8px) |

## Verification
- TypeScript : OK (0 erreurs)
