import React, { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
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
import { useHaptics } from '../../hooks/useHaptics'
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

function HomeBodyStatusSectionInner({ sets, exercises, histories }: HomeBodyStatusSectionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const styles = useStyles(colors)
  const [expanded, setExpanded] = useState(false)

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
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    return computeMuscleRecovery(mappedSets, mappedExercises)
  }, [sets, exercises])

  const restSuggestion = useMemo(() => {
    if (!histories.length) return null
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    return computeRestSuggestion(mappedHistories, mappedSets, mappedExercises)
  }, [histories, sets, exercises])

  if (!readinessData && !fatigueResult) return null

  const tiredMuscleCount = recoveryEntries.filter(e => e.status === 'fatigued' || e.status === 'recovering').length

  const handleToggle = () => {
    haptics.onSelect()
    setExpanded(!expanded)
  }

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
    <View style={styles.container}>
      {/* Compact summary (always visible) */}
      <TouchableOpacity
        style={styles.summaryCard}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t.accessibility.bodyStatus}
        accessibilityHint={t.accessibility.toggleExpand}
      >
        <View style={styles.summaryContent}>
          {readinessData && (
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryValue, { color: getReadinessColor(readinessData.level, colors) }]}>
                {readinessData.score}
              </Text>
              <Text style={styles.summaryLabel}>{t.home.readiness.title.split(' ')[0]}</Text>
            </View>
          )}
          {fatigueResult && fatigueResult.weeklyVolume > 0 && (
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryValue}>
                {t.home.fatigue.zones[fatigueResult.zone]}
              </Text>
              <Text style={styles.summaryLabel}>{t.home.fatigue.title.split(' ')[0]}</Text>
            </View>
          )}
          {recoveryEntries.length > 0 && (
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryValue}>{tiredMuscleCount}</Text>
              <Text style={styles.summaryLabel}>{t.home.recovery.title.split(' ')[0]}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Expanded details */}
      {expanded && (
        <>
          {/* Readiness Score */}
          {readinessData && (() => {
            const levelColor = getReadinessColor(readinessData.level, colors)
            return (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="fitness-outline" size={20} color={levelColor} />
                  <Text style={styles.detailTitle}>{t.home.readiness.title}</Text>
                </View>
                <View style={styles.readinessScoreContainer}>
                  <Text style={[styles.readinessScore, { color: levelColor }]}>{readinessData.score}</Text>
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
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
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
                  <Text style={[styles.detailTitle, { color: fatigueColor }]}>
                    {t.home.fatigue.zones[fatigueResult.zone]}
                  </Text>
                </View>
                <View style={styles.fatigueBarBg}>
                  <View style={[styles.fatigueBarFill, { width: `${fatigueResult.index}%`, backgroundColor: fatigueColor }]} />
                  <View style={[styles.fatigueMarker, { left: '50%' }]} />
                </View>
                <Text style={styles.fatigueStats}>
                  {t.home.fatigue.thisWeek}: {Math.round(fatigueResult.weeklyVolume)} kg
                  {'  •  '}
                  {t.home.fatigue.average}: {Math.round(fatigueResult.avgWeeklyVolume)} kg
                </Text>
              </View>
            )
          })()}

          {/* Muscle Recovery */}
          {recoveryEntries.length > 0 && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{t.home.recovery.title}</Text>
              <View style={styles.recoveryGrid}>
                {recoveryEntries.map(entry => {
                  const dotColor = getRecoveryColor(entry.status, colors)
                  return (
                    <View key={entry.muscle} style={styles.recoveryItem}>
                      <View style={[styles.recoveryDot, { backgroundColor: dotColor }]} />
                      <Text style={styles.recoveryMuscle} numberOfLines={1}>{entry.muscle}</Text>
                      <Text style={[styles.recoveryPercent, { color: dotColor }]}>{entry.recoveryPercent}%</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Rest Suggestion */}
          {restSuggestion && restSuggestion.shouldRest && (
            <View style={[styles.restCard, {
              borderLeftColor: restSuggestion.confidence === 'high' ? colors.danger
                : restSuggestion.confidence === 'medium' ? colors.amber : colors.textSecondary,
            }]}>
              <View style={styles.restHeader}>
                <Text style={styles.detailTitle}>{t.home.restSuggestion.title}</Text>
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
              {restSuggestion.musclesTired.length > 0 && (
                <Text style={styles.restMuscles}>
                  {t.home.restSuggestion.tiredMuscles}: {restSuggestion.musclesTired.join(', ')}
                </Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
  )
}

export const HomeBodyStatusSection = React.memo(HomeBodyStatusSectionInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryContent: {
      flexDirection: 'row',
      gap: spacing.lg,
      flex: 1,
    },
    summaryMetric: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    summaryLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    detailTitle: {
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
    },
    recoveryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.sm,
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
    restCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.sm,
      borderLeftWidth: 4,
    },
    restHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    restConfidenceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    restConfidenceText: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.primaryText,
    },
    restReason: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    restMuscles: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
  }), [colors])
}
