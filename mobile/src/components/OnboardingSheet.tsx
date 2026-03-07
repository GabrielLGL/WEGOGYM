import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { useHaptics } from '../hooks/useHaptics'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, borderRadius, fontSize } from '../theme'
import type { ThemeColors } from '../theme'
import { PRESET_PROGRAMS } from '../model/onboardingPrograms'
import type { PresetProgram } from '../model/onboardingPrograms'

interface Props {
  visible: boolean
  onClose: () => void
  onProgramSelected: (preset: PresetProgram) => Promise<void>
  onSkip: () => void
}

export const OnboardingSheet: React.FC<Props> = ({
  visible,
  onClose,
  onProgramSelected,
  onSkip,
}) => {
  const haptics = useHaptics()
  const { colors } = useTheme()
  const { t } = useLanguage()
  const styles = useStyles(colors)
  const [isImporting, setIsImporting] = useState(false)

  const handleSelectProgram = async (preset: PresetProgram) => {
    if (isImporting) return
    haptics.onSelect()
    setIsImporting(true)
    try {
      await onProgramSelected(preset)
      haptics.onSuccess()
    } finally {
      setIsImporting(false)
    }
  }

  const handleSkip = () => {
    if (isImporting) return
    haptics.onPress()
    onSkip()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.onboarding.programChoice.title}>
      {PRESET_PROGRAMS.map(preset => (
        <TouchableOpacity
          key={preset.name}
          style={[styles.card, isImporting && styles.cardDisabled]}
          onPress={() => handleSelectProgram(preset)}
          disabled={isImporting}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{preset.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{preset.sessions.length} {t.onboarding.programChoice.sessions}</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>{preset.description}</Text>
          {isImporting && (
            <Text style={styles.importingText}>{t.onboarding.programChoice.importing}</Text>
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.skipButton, isImporting && styles.cardDisabled]}
        onPress={handleSkip}
        disabled={isImporting}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>{t.onboarding.programChoice.skip}</Text>
      </TouchableOpacity>
    </BottomSheet>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardDisabled: {
      opacity: 0.5,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    cardName: {
      color: colors.text,
      fontSize: fontSize.md,
      fontWeight: 'bold',
      flex: 1,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginLeft: spacing.sm,
    },
    badgeText: {
      color: colors.text,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
    importingText: {
      color: colors.primary,
      fontSize: fontSize.xs,
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
    skipButton: {
      marginTop: spacing.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    skipText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: '500',
    },
  })
}
