import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { RestSuggestion } from '../../model/utils/restDaySuggestionsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface BodyRestSuggestionCardProps {
  restSuggestion: RestSuggestion
}

function getConfidenceColor(confidence: RestSuggestion['confidence'], colors: ThemeColors) {
  switch (confidence) {
    case 'high': return colors.danger
    case 'medium': return colors.amber
    case 'low': return colors.textSecondary
  }
}

function BodyRestSuggestionCardInner({ restSuggestion }: BodyRestSuggestionCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useCardStyles(colors)

  const borderColor = getConfidenceColor(restSuggestion.confidence, colors)

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.home.restSuggestion.title}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.confidenceText}>
            {t.home.restSuggestion.confidence[restSuggestion.confidence]}
          </Text>
        </View>
      </View>
      <Text style={styles.reason}>
        {t.home.restSuggestion.reasons[restSuggestion.reason as keyof typeof t.home.restSuggestion.reasons]}
      </Text>
      {restSuggestion.musclesTired.length > 0 && (
        <Text style={styles.muscles}>
          {t.home.restSuggestion.tiredMuscles}: {restSuggestion.musclesTired.join(', ')}
        </Text>
      )}
    </View>
  )
}

export const BodyRestSuggestionCard = React.memo(BodyRestSuggestionCardInner)

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
      borderLeftWidth: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    confidenceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    confidenceText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.primaryText,
    },
    reason: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    muscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
