# style(reps-toggle): layout 2 lignes pour agrandir la zone Reps

**Date:** 2026-02-27
**Type:** style
**Fichier:** `mobile/src/components/ExerciseTargetInputs.tsx`

## Changements

### JSX — Nouveau layout 2 lignes
- **Ligne 1** : `[Séries flex:1]` + `[Poids flex:1]` côte à côte
- **Ligne 2** : Section Reps pleine largeur (label + toggle + input)

### Styles
| Style | Avant | Après |
|-------|-------|-------|
| `row.gap` | — | `spacing.sm` (8px) |
| `inputWrapper.marginRight` | `spacing.sm` | supprimé (géré par gap) |
| `repsWrapper` | `flex: 1.4` | **supprimé** |
| `modeBtn.paddingHorizontal` | `spacing.xs` (4px) | `spacing.sm` (8px) |
| `modeBtn.paddingVertical` | `2` (px fixe) | `spacing.xs` (4px) |
| `modeBtnText.fontSize` | `fontSize.caption` (11) | `fontSize.xs` (12) |

## Vérification
- `npx tsc --noEmit` → 0 erreur
- `npm test ExerciseTargetInputs` → 24/24 tests passés

## Résultat visuel
```
┌──────────────────┬──────────────────┐
│ Séries           │ Poids (kg)       │
│ [     3        ] │ [     60       ] │
└──────────────────┴──────────────────┘
┌────────────────────────────────────────┐
│ Reps                  [ Fixe ][ Plage ]│
│ [            10                      ] │  ← mode Fixe
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ Reps                  [ Fixe ][ Plage ]│
│ [     6      ] ——— [     10     ]      │  ← mode Plage
└────────────────────────────────────────┘
```
