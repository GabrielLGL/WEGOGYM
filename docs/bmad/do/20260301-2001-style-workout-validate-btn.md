# do — style(workout): validate button outline style

**Date :** 2026-03-01 20:01
**Statut :** ✅ Terminé
**Fichier modifié :** `mobile/src/components/WorkoutExerciseCard.tsx`

## Changements

### `validateBtn` — outline au lieu de plein
- `width`/`height` : 38 → 32
- `backgroundColor` : `colors.primary` → `'transparent'`
- Ajout `borderWidth: 1.5`, `borderColor: colors.primary`

### `validateBtnDisabled` — cohérence outline
- `backgroundColor` : `colors.cardSecondary` → `'transparent'`
- Remplacement par `borderColor: colors.border`

### Icône checkmark — couleur conditionnelle
- `color` : `colors.text` (fixe) → `valid ? colors.primary : colors.border`

### `validateBtnActive` — taille réduite + fond teinté
- `width`/`height` : 38 → 32
- `backgroundColor` : `colors.success` → `colors.successBg`
- Ajout `borderWidth: 1`, `borderColor: colors.primary + '60'`

## Vérification

- `npx tsc --noEmit` → ✅ zéro erreur
- `npm test WorkoutExerciseCard` → ✅ 19/19 passed
