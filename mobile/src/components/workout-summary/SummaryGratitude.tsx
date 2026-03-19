import React, { useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { spacing, borderRadius, fontSize } from '../../theme'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'

interface SummaryGratitudeProps {
  selectedEmoji: string | null
  gratitudeNote: string
  gratitudeSubmitted: boolean
  onEmojiSelect: (emoji: string) => void
  onNoteChange: (text: string) => void
  onSubmit: () => void
}

const EMOJIS = ['💪', '🔥', '😌', '😤']

const SummaryGratitude: React.FC<SummaryGratitudeProps> = ({
  selectedEmoji,
  gratitudeNote,
  gratitudeSubmitted,
  onEmojiSelect,
  onNoteChange,
  onSubmit,
}) => {
  const colors = useColors()
  const styles = useMemo(() => createStyles(colors), [colors])
  const { t } = useLanguage()

  if (gratitudeSubmitted) {
    return (
      <View style={styles.gratitudeDoneRow}>
        <Text style={styles.gratitudeDoneText}>{selectedEmoji} {t.gratitude.saved}</Text>
      </View>
    )
  }

  return (
    <View style={styles.gratitudeSection}>
      <Text style={styles.gratitudeQuestion}>{t.gratitude.question}</Text>
      <View style={styles.emojiRow}>
        {EMOJIS.map(emoji => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.emojiBtn,
              selectedEmoji === emoji && styles.emojiBtnActive,
            ]}
            onPress={() => onEmojiSelect(emoji)}
            accessibilityRole="button"
            accessibilityLabel={emoji}
            accessibilityState={{ selected: selectedEmoji === emoji }}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedEmoji && (
        <>
          <TextInput
            style={styles.gratitudeInput}
            placeholder={t.gratitude.placeholder}
            placeholderTextColor={colors.placeholder}
            value={gratitudeNote}
            onChangeText={onNoteChange}
            maxLength={120}
            multiline
            accessibilityLabel={t.gratitude.placeholder}
          />
          <TouchableOpacity
            style={styles.gratitudeSubmitBtn}
            onPress={onSubmit}
            accessibilityRole="button"
            accessibilityLabel={t.common.validate}
          >
            <Text style={styles.gratitudeSubmitText}>{t.gratitude.save}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

export default React.memo(SummaryGratitude)

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    gratitudeSection: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    gratitudeQuestion: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emojiRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    emojiBtn: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiBtnActive: {
      backgroundColor: colors.primary + '33',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    emojiText: {
      fontSize: 26,
    },
    gratitudeInput: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      fontSize: fontSize.sm,
      color: colors.text,
      minHeight: 60,
      textAlignVertical: 'top',
      marginBottom: spacing.sm,
    },
    gratitudeSubmitBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    gratitudeSubmitText: {
      fontSize: fontSize.sm,
      color: colors.background,
      fontWeight: '600',
    },
    gratitudeDoneRow: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    gratitudeDoneText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
  })
}
