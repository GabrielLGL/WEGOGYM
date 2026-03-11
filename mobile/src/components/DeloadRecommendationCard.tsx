/**
 * DeloadRecommendationCard — Affiche une recommandation de décharge/repos
 *
 * Carte animée avec bordure colorée selon la sévérité,
 * icône contextuelle, message interpolé et bouton dismiss.
 */

import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, borderRadius, fontSize } from '../theme'

// Types defined locally — will be reconciled with deloadHelpers in Groupe C
export type DeloadType = 'rest_day' | 'deload_week' | 'reduce_volume' | 'muscle_overload'
export type DeloadSeverity = 'warning' | 'suggestion'

export interface DeloadRecommendation {
  type: DeloadType
  severity: DeloadSeverity
  reasonKey: string
  reasonParams?: Record<string, string | number>
  affectedMuscles?: string[]
}

interface DeloadRecommendationCardProps {
  recommendation: DeloadRecommendation
  onDismiss: () => void
}

const ICONS: Record<DeloadType, string> = {
  rest_day: '😴',
  deload_week: '📉',
  reduce_volume: '⚠️',
  muscle_overload: '💪',
}

const TITLE_KEYS: Record<DeloadType, string> = {
  rest_day: 'restDayTitle',
  deload_week: 'deloadWeekTitle',
  reduce_volume: 'reduceVolumeTitle',
  muscle_overload: 'muscleOverloadTitle',
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  let result = template
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

function DeloadRecommendationCard({ recommendation, onDismiss }: DeloadRecommendationCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const borderColor = recommendation.severity === 'warning' ? colors.danger : colors.primary
  const icon = ICONS[recommendation.type]
  const titleKey = TITLE_KEYS[recommendation.type] as keyof typeof t.deload
  const title = t.deload[titleKey] as string
  const reasonKey = recommendation.reasonKey as keyof typeof t.deload
  const reasonTemplate = t.deload[reasonKey] as string
  const message = interpolate(reasonTemplate, recommendation.reasonParams)

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: borderColor,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {recommendation.affectedMuscles && recommendation.affectedMuscles.length > 0 && (
        <View style={styles.musclesRow}>
          {recommendation.affectedMuscles.map(muscle => (
            <View
              key={muscle}
              style={[styles.muscleChip, { backgroundColor: colors.border }]}
            >
              <Text style={[styles.muscleChipText, { color: colors.text }]}>{muscle}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t.deload.dismiss}
      >
        <Text style={[styles.dismissText, { color: colors.primary }]}>{t.deload.dismiss}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: fontSize.xl,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  muscleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  muscleChipText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dismissText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
})

export default DeloadRecommendationCard
