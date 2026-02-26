# Groupe C — Composants d'affichage

## Pattern commun
- `neuShadow` importé dans chaque composant
- Container principal : `neuShadow.elevated` appliqué inline dans le style array
- Suppression des `borderWidth`/`borderColor` séparateurs
- `marginBottom` augmenté de `sm` → `md` pour laisser l'ombre respirer

## SessionItem.tsx
- `neuShadow.elevated` sur le container
- Supprimé : `borderWidth: 1, borderColor: colors.cardSecondary`
- `marginBottom: spacing.sm` → `spacing.md`

## WorkoutExerciseCard.tsx
- `neuShadow.elevated` sur la card principale
- `borderRadius.md` → `borderRadius.lg` (coins plus arrondis)
- `marginBottom: spacing.sm` → `spacing.md`
- `neuShadow.pressed` sur chaque `setRow` (effet enfoncé pour les inputs)
- `setRow` : ajout `paddingHorizontal`, `borderRadius`, `marginBottom`

## SetItem.tsx
- `neuShadow.elevatedSm` sur le container
- Supprimé : `borderWidth: 1, borderColor: colors.cardSecondary`

## WorkoutHeader.tsx
- `neuShadow.elevated` sur le container

## ProgramSection.tsx
- `neuShadow.elevated` sur le container
- Supprimé : `borderWidth: 1, borderColor: colors.border`
- `marginBottom: spacing.sm` → `spacing.md`
