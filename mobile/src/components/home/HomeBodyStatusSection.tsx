import React, { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import { computeFatigueIndex } from '../../model/utils/fatigueIndexHelpers'
import type { FatigueResult } from '../../model/utils/fatigueIndexHelpers'
import { computeMuscleRecovery } from '../../model/utils/muscleRecoveryHelpers'
import { computeReadiness } from '../../model/utils/workoutReadinessHelpers'
import type { ReadinessResult } from '../../model/utils/workoutReadinessHelpers'
import { computeSleepScore } from '../../model/utils/sleepHelpers'
import type { SleepInput, SleepScore } from '../../model/utils/sleepHelpers'
import { computeVitalsScore } from '../../model/utils/vitalsHelpers'
import type { VitalsInput, VitalsScore } from '../../model/utils/vitalsHelpers'
import { computeRestSuggestion } from '../../model/utils/restDaySuggestionsHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import { BodyReadinessCard, getReadinessLevel, getReadinessColor } from './BodyReadinessCard'
import { BodyFatigueCard } from './BodyFatigueCard'
import { BodyMuscleRecoveryCard } from './BodyMuscleRecoveryCard'
import { BodyRestSuggestionCard } from './BodyRestSuggestionCard'

interface HomeBodyStatusSectionProps {
  sets: WorkoutSet[]
  exercises: Exercise[]
  histories: History[]
  sleepRecords?: SleepInput[]
  vitalsRecords?: VitalsInput[]
  weeklyTarget?: number
}

function HomeBodyStatusSectionInner({ sets, exercises, histories, sleepRecords, vitalsRecords, weeklyTarget }: HomeBodyStatusSectionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const styles = useStyles(colors)
  const [expanded, setExpanded] = useState(false)

  const sleepData = useMemo<SleepScore | null>(() => {
    if (!sleepRecords?.length) return null
    return computeSleepScore(sleepRecords)
  }, [sleepRecords])

  const vitalsData = useMemo<VitalsScore | null>(() => {
    if (!vitalsRecords?.length) return null
    return computeVitalsScore(vitalsRecords)
  }, [vitalsRecords])

  const readinessData = useMemo<ReadinessResult | null>(() => {
    if (!sets.length) return null
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeReadiness(mappedSets, mappedExercises, mappedHistories, {
      sleepScore: sleepData?.score ?? null,
      vitalsScore: vitalsData?.score ?? null,
    }, weeklyTarget)
  }, [sets, exercises, histories, sleepData, vitalsData])

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

  const avgRecoveryPct = recoveryEntries.length > 0
    ? Math.round(recoveryEntries.reduce((sum, e) => sum + e.recoveryPercent, 0) / recoveryEntries.length)
    : null

  const handleToggle = () => {
    haptics.onSelect()
    setExpanded(!expanded)
  }

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
          {avgRecoveryPct != null && (
            <View style={styles.summaryMetric}>
              <Text style={[styles.summaryValue, { color: getReadinessColor(getReadinessLevel(avgRecoveryPct), colors) }]}>
                {avgRecoveryPct}%
              </Text>
              <Text style={styles.summaryLabel}>{t.home.readiness.recovery.split(' ')[0]}</Text>
            </View>
          )}
          {sleepData && (
            <View style={styles.summaryMetric}>
              <Text style={styles.summaryValue}>
                {Math.floor(sleepData.durationMinutes / 60)}h{String(sleepData.durationMinutes % 60).padStart(2, '0')}
              </Text>
              <Text style={styles.summaryLabel}>{t.home.sleep?.title ?? 'Sommeil'}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Expanded details — delegated to sub-components */}
      {expanded && (
        <>
          {readinessData && <BodyReadinessCard readinessData={readinessData} />}
          {fatigueResult && fatigueResult.weeklyVolume > 0 && <BodyFatigueCard fatigueResult={fatigueResult} />}
          {recoveryEntries.length > 0 && <BodyMuscleRecoveryCard recoveryEntries={recoveryEntries} />}
          {restSuggestion && restSuggestion.shouldRest && <BodyRestSuggestionCard restSuggestion={restSuggestion} />}
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
  }), [colors])
}
