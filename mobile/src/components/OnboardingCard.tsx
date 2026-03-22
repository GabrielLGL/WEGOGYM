import React, { useMemo } from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

interface OnboardingCardProps {
  label: string
  description?: string
  selected: boolean
  onPress: () => void
  icon?: React.ComponentProps<typeof Ionicons>['name']
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  label,
  description,
  selected,
  onPress,
  icon,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const haptics = useHaptics()

  const handlePress = () => {
    haptics.onSelect()
    onPress()
  }

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
            <Ionicons name={icon} size={20} color={selected ? colors.primary : colors.textSecondary} />
          </View>
        ) : null}
        <View style={styles.textContainer}>
          <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, selected && styles.descriptionSelected]}>{description}</Text>
          ) : null}
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.secondaryButton,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.ms,
    },
    iconContainerSelected: {
      backgroundColor: colors.primary + '33',
    },
    textContainer: {
      flex: 1,
    },
    label: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: '600',
    },
    labelSelected: {
      color: colors.primary,
    },
    description: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      marginTop: 2,
      lineHeight: 18,
    },
    descriptionSelected: {
      color: colors.text,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
  }), [colors])
}
