import React, { useMemo } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { Button } from '../Button'
import { spacing, borderRadius, fontSize } from '../../theme'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'

interface SummaryActionsProps {
  onNoteChange: (text: string) => void
  onSharePress: () => void
  onClose: () => void
}

const SummaryActions: React.FC<SummaryActionsProps> = ({
  onNoteChange,
  onSharePress,
  onClose,
}) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  return (
    <>
      <View style={styles.separator} />

      <Text style={styles.noteLabel}>{t.workoutSummary.noteLabel}</Text>
      <TextInput
        style={styles.noteInput}
        multiline
        numberOfLines={3}
        defaultValue=""
        onChangeText={onNoteChange}
        placeholder={t.workoutSummary.notePlaceholder}
        placeholderTextColor={colors.placeholder}
        textAlignVertical="top"
        accessibilityLabel={t.workoutSummary.notePlaceholder}
      />

      <Button
        variant="secondary"
        size="md"
        fullWidth
        onPress={onSharePress}
        enableHaptics={false}
      >
        {t.share.shareButton}
      </Button>

      <View style={{ height: spacing.sm }} />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={onClose}
        enableHaptics={false}
      >
        {t.workoutSummary.finish}
      </Button>
    </>
  )
}

export default React.memo(SummaryActions)

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },
    noteLabel: {
      color: colors.textSecondary,
      fontSize: fontSize.xs,
      marginBottom: spacing.xs,
    },
    noteInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.separator,
      color: colors.text,
      fontSize: fontSize.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      minHeight: 80,
    },
  })
}
