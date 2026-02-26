# Groupe B — Composants interactifs

## Button.tsx
- Import `neuShadow` depuis theme
- Switché de `TouchableOpacity` → `Pressable` pour le pressed state callback
- Style dynamique : `neuShadow.elevated` au repos, `neuShadow.pressed` quand pressed
- Variants `primary`, `secondary`, `danger` → ombre active
- Variant `ghost` → pas d'ombre (fond transparent)

## ChipSelector.tsx
- Import `neuShadow` depuis theme
- Chip non-sélectionné : `colors.card` + `neuShadow.elevatedSm`
- Chip sélectionné : `colors.primary` + `neuShadow.pressed` (effet enfoncé)
- Supprimé : `borderWidth: 1, borderColor: colors.border`

## BottomSheet.tsx
- Import `neuShadow` depuis theme
- `neuShadow.elevated` appliqué inline sur `<Animated.View style={[styles.content, neuShadow.elevated, ...]}`
- Supprimé des styles : `elevation`, `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`

## AlertDialog.tsx
- Import `neuShadow` depuis theme
- `neuShadow.elevated` appliqué inline sur le contenu
- Dans StyleSheet : `elevation: 12`, `shadowColor: colors.neuShadowDark` (valeurs spécifiques AlertDialog)
