import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import { computeFatigueIndex } from '../../model/utils/fatigueIndexHelpers'
import type { FatigueResult } from '../../model/utils/fatigueIndexHelpers'
import { computeMuscleRecovery, getRecoveryColor } from '../../model/utils/muscleRecoveryHelpers'
import { computeReadiness } from '../../model/utils/workoutReadinessHelpers'
import type { ReadinessResult, ReadinessLevel } from '../../model/utils/workoutReadinessHelpers'
import { computeRestSuggestion } from '../../model/utils/restDaySuggestionsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'

interface HomeBodyStatusSectionProps {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
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

export function HomeBodyStatusSection({ sets, exercises, histories }: HomeBodyStatusSectionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const styles = useStyles(colors)

  const readinessData = useMemo<ReadinessResult | null>(() => {
    if (!sets.length) return null
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeReadiness(mappedSets, mappedExercises, mappedHistories)
  }, [sets, exercises, histories])

  const fatigueResult = useMemo<FatigueResult | null>(() => {
    if (!sets.length) return null
    return computeFatigueIndex(sets, histories)
  }, [sets, histories])

  const recoveryEntries = useMemo(() => {
    if (!sets.length || !exercises.length) return []
    const mappedSets = sets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      exerciseId: s.exerciseId,
      createdAt: s.createdAt,
    }))
    const mappedExercises = exercises.map(e => ({
      id: e.id,
      muscles: e.muscles,
    }))
    return computeMuscleRecovery(mappedSets, mappedExercises)
  }, [sets, exercises])

  const restSuggestion = useMemo(() => {
    if (!histories.length) return null
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    return computeRestSuggestion(mappedHistories, mappedSets, mappedExercises)
  }, [histories, sets, exercises])

  const ReadinessBar = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.readinessBarRow}>
      <Text style={styles.readinessBarLabel}>{label}</Text>
      <View style={styles.readinessBarBg}>
        <View style={[styles.readinessBarFill, { width: `${value}%`, backgroundColor: getReadinessColor(getReadinessLevel(value), colors) }]} />
      </View>
      <Text style={styles.readinessBarValue}>{value}</Text>
    </View>
  )

  return (
    <>
      {/* Readiness Score */}
      {readinessData && (() => {
        const levelColor = getReadinessColor(readinessData.level, colors)
        return (
          <View style={styles.readinessCard}>
            <View style={styles.readinessHeader}>
              <Ionicons name="fitness-outline" size={20} color={levelColor} />
              <Text style={styles.readinessTitle}>{t.home.readiness.title}</Text>
            </View>
            <View style={styles.readinessScoreContainer}>
              <Text style={[styles.readinessScore, { color: levelColor }]}>
                {readinessData.score}
              </Text>
              <Text style={styles.readinessMax}>/100</Text>
            </View>
            <Text style={[styles.readinessLevel, { color: levelColor }]}>
              {t.home.readiness.levels[readinessData.level]}
            </Text>
            <View style={styles.readinessComponents}>
              <ReadinessBar label={t.home.readiness.recovery} value={readinessData.components.recovery} />
              <ReadinessBar label={t.home.readiness.fatigue} value={readinessData.components.fatigue} />
              <ReadinessBar label={t.home.readiness.consistency} value={readinessData.components.consistency} />
            </View>
            <Text style={styles.readinessRec}>
              {t.home.readiness.recommendations[readinessData.level]}
            </Text>
          </View>
        )
      })()}

      {/* Fatigue Index */}
      {fatigueResult && fatigueResult.weeklyVolume > 0 && (() => {
        const fatigueColor = fatigueResult.zone === 'overreaching'
          ? colors.danger
          : fatigueResult.zone === 'reaching'
            ? colors.amber
            : fatigueResult.zone === 'recovery'
              ? colors.placeholder
              : colors.primary
        return (
          <View style={styles.fatigueCard}>
            <View style={styles.fatigueHeader}>
              <Ionicons
                name={
                  fatigueResult.zone === 'overreaching' ? 'warning-outline'
                    : fatigueResult.zone === 'reaching' ? 'alert-circle-outline'
                      : fatigueResult.zone === 'recovery' ? 'bed-outline'
                        : 'checkmark-circle-outline'
                }
                size={20}
                color={fatigueColor}
              />
              <Text style={[styles.fatigueTitle, { color: fatigueColor }]}>
                {t.home.fatigue.zones[fatigueResult.zone]}
              </Text>
            </View>
            <View style={styles.fatigueBarBg}>
              <View style={[
                styles.fatigueBarFill,
                { width: `${fatigueResult.index}%`, backgroundColor: fatigueColor },
              ]} />
              <View style={[styles.fatigueMarker, { left: '50%' }]} />
            </View>
            <Text style={styles.fatigueStats}>
              {t.home.fatigue.thisWeek}: {Math.round(fatigueResult.weeklyVolume)} kg
              {'  •  '}
              {t.home.fatigue.average}: {Math.round(fatigueResult.avgWeeklyVolume)} kg
            </Text>
            <Text style={styles.fatigueRecommendation}>
              {t.home.fatigue.recommendations[fatigueResult.zone]}
            </Text>
          </View>
        )
      })()}

      {/* Muscle Recovery */}
      {recoveryEntries.length > 0 && (
        <View style={styles.recoveryCard}>
          <Text style={styles.recoveryTitle}>{t.home.recovery.title}</Text>
          <View style={styles.recoveryGrid}>
            {recoveryEntries.map(entry => {
              const dotColor = getRecoveryColor(entry.status, colors)
              return (
                <View key={entry.muscle} style={styles.recoveryItem}>
                  <View style={[styles.recoveryDot, { backgroundColor: dotColor }]} />
                  <Text style={styles.recoveryMuscle} numberOfLines={1}>{entry.muscle}</Text>
                  <Text style={[styles.recoveryPercent, { color: dotColor }]}>
                    {entry.recoveryPercent}%
                  </Text>
                </View>
              )
            })}
          </View>
          <Text style={styles.recoveryDisclaimer}>{t.home.recovery.disclaimer}</Text>
        </View>
      )}

      {/* Rest Suggestion */}
      {restSuggestion && restSuggestion.shouldRest && (
        <View style={[styles.restCard, {
          borderLeftColor: restSuggestion.confidence === 'high' ? colors.danger
            : restSuggestion.confidence === 'medium' ? colors.amber : colors.textSecondary,
        }]}>
          <View style={styles.restHeader}>
            <Text style={styles.restTitle}>{t.home.restSuggestion.title}</Text>
            <View style={[styles.restConfidenceBadge, {
              backgroundColor: restSuggestion.confidence === 'high' ? colors.danger
                : restSuggestion.confidence === 'medium' ? colors.amber : colors.textSecondary,
            }]}>
              <Text style={styles.restConfidenceText}>
                {t.home.restSuggestion.confidence[restSuggestion.confidence]}
              </Text>
            </View>
          </View>
          <Text style={styles.restReason}>
            {t.home.restSuggestion.reasons[restSuggestion.reason as keyof typeof t.home.restSuggestion.reasons]}
          </Text>
          <Text style={styles.restSuggestionText}>
            {t.home.restSuggestion.suggestions[restSuggestion.suggestion as keyof typeof t.home.restSuggestion.suggestions]}
          </Text>
          {restSuggestion.musclesTired.length > 0 && (
            <Text style={styles.restMuscles}>
              {t.home.restSuggestion.tiredMuscles}: {restSuggestion.musclesTired.join(', ')}
            </Text>
          )}
        </View>
      )}
    </>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    readinessCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    readinessHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    readinessTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    readinessScoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    readinessScore: {
      fontSize: fontSize.jumbo,
      fontWeight: '800',
    },
    readinessMax: {
      fontSize: fontSize.md,
      color: colors.placeholder,
      marginLeft: spacing.xs,
    },
    readinessLevel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.ms,
    },
    readinessComponents: {
      gap: spacing.sm,
      marginBottom: spacing.ms,
    },
    readinessBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    readinessBarLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      width: 90,
    },
    readinessBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden',
    },
    readinessBarFill: {
      height: 8,
      borderRadius: borderRadius.xxs,
    },
    readinessBarValue: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
      width: 28,
      textAlign: 'right',
    },
    readinessRec: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    fatigueCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    fatigueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    fatigueTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    fatigueBarBg: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: 3,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      position: 'relative',
    },
    fatigueBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    fatigueMarker: {
      position: 'absolute',
      top: -2,
      width: 2,
      height: 10,
      backgroundColor: colors.text,
      borderRadius: 1,
    },
    fatigueStats: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    fatigueRecommendation: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    recoveryCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    recoveryTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    recoveryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    recoveryItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    recoveryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    recoveryMuscle: {
      flex: 1,
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    recoveryPercent: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
    recoveryDisclaimer: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    restCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderLeftWidth: 4,
    },
    restHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    restTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    restConfidenceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    restConfidenceText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: '#fff',
    },
    restReason: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    restSuggestionText: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: spacing.xs,
    },
    restMuscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
