import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { colors, borderRadius, spacing, fontSize } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress: () => void | Promise<void>
  children: string | React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
  enableHaptics?: boolean // Désactiver les haptics si nécessaire (défaut: true)
}

/**
 * Button - Composant de bouton unifié avec variants et sizes
 *
 * Remplace les 20+ implémentations de boutons dispersées dans l'app.
 * Inclut haptics automatique selon le variant.
 *
 * @param variant - Style du bouton (primary, danger, secondary, ghost)
 * @param size - Taille du bouton (sm, md, lg)
 * @param disabled - Désactive le bouton
 * @param enableHaptics - Active/désactive les haptics (défaut: true)
 *
 * @example
 * <Button
 *   variant="danger"
 *   onPress={handleDelete}
 * >
 *   Supprimer
 * </Button>
 *
 * <Button
 *   variant="primary"
 *   size="lg"
 *   fullWidth
 *   onPress={handleSave}
 * >
 *   Enregistrer
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  enableHaptics = true,
}) => {
  const haptics = useHaptics()

  const handlePress = async () => {
    if (disabled) return

    // Haptics selon le variant
    if (enableHaptics) {
      if (variant === 'danger') {
        haptics.onDelete()
      } else {
        haptics.onPress()
      }
    }

    await onPress()
  }

  // Calcul du style du bouton
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[]

  // Calcul du style du texte
  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[]

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Base
  base: {
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Variants - Background
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },
  variant_secondary: {
    backgroundColor: colors.secondaryButton,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // Text base
  text: {
    fontWeight: 'bold',
  },

  // Text sizes
  text_sm: {
    fontSize: fontSize.sm,
  },
  text_md: {
    fontSize: fontSize.md,
  },
  text_lg: {
    fontSize: fontSize.lg,
  },

  // Text variants
  text_primary: {
    color: colors.text,
  },
  text_danger: {
    color: colors.text,
  },
  text_secondary: {
    color: colors.text,
  },
  text_ghost: {
    color: colors.primary,
  },

  textDisabled: {
    opacity: 0.6,
  },
})
