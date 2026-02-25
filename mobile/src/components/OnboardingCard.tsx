import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, spacing, borderRadius, fontSize } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

interface OnboardingCardProps {
  label: string
  description?: string
  selected: boolean
  onPress: () => void
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  label,
  description,
  selected,
  onPress,
}) => {
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
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.secondaryButton,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  labelSelected: {
    color: colors.primary,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
})
