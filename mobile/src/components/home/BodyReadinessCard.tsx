import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ReadinessResult, ReadinessLevel } from '../../model/utils/workoutReadinessHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface BodyReadinessCardProps {
  readinessData: ReadinessResult
}

function getReadinessLevel(v: number): ReadinessLevel {
  if (v >= 80) return 'optimal'
  if (v >= 60) return 'good'
  if (v >= 40) return 'moderate'
  return 'low'
}

function getReadinessColor(level: ReadinessLevel, colors: ThemeColors) {
  switch (level) {
    case 'optimal': return colors.primary
    case 'good': return colors.success
    case 'moderate': return colors.amber
    case 'low': return colors.danger
  }
}

function ReadinessBar({ label, value, colors, styles }: {
  label: string
  value: number
  colors: ThemeColors
  styles: ReturnType<typeof useCardStyles>
}) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: getReadinessColor(getReadinessLevel(value), colors) }]} />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  )
}

function BodyReadinessCardInner({ readinessData }: BodyReadinessCardProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useCardStyles(colors)

  const levelColor = getReadinessColor(readinessData.level, colors)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="fitness-outline" size={20} color={levelColor} />
        <Text style={styles.title}>{t.home.readiness.title}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: levelColor }]}>{readinessData.score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
      <Text style={[styles.level, { color: levelColor }]}>
        {t.home.readiness.levels[readinessData.level]}
      </Text>
      <View style={styles.components}>
        <ReadinessBar label={t.home.readiness.recovery} value={readinessData.components.recovery} colors={colors} styles={styles} />
        <ReadinessBar label={t.home.readiness.fatigue} value={readinessData.components.fatigue} colors={colors} styles={styles} />
        <ReadinessBar label={t.home.readiness.consistency} value={readinessData.components.consistency} colors={colors} styles={styles} />
        {readinessData.components.sleep != null && (
          <ReadinessBar label={t.home.sleep?.title ?? 'Sommeil'} value={readinessData.components.sleep} colors={colors} styles={styles} />
        )}
        {readinessData.components.vitals != null && (
          <ReadinessBar label={t.home.vitals?.title ?? 'Vitals'} value={readinessData.components.vitals} colors={colors} styles={styles} />
        )}
      </View>
      <Text style={styles.recommendation}>
        {t.home.readiness.recommendations[readinessData.level]}
      </Text>
    </View>
  )
}

export const BodyReadinessCard = React.memo(BodyReadinessCardInner)

export { getReadinessLevel, getReadinessColor }

function useCardStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    score: {
      fontSize: fontSize.jumbo,
      fontWeight: '800',
    },
    scoreMax: {
      fontSize: fontSize.md,
      color: colors.placeholder,
      marginLeft: spacing.xs,
    },
    level: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.ms,
    },
    components: {
      gap: spacing.sm,
      marginBottom: spacing.ms,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    barLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      width: 90,
    },
    barBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden',
    },
    barFill: {
      height: 8,
      borderRadius: borderRadius.xxs,
    },
    barValue: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
      width: 28,
      textAlign: 'right',
    },
    recommendation: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  }), [colors])
}
