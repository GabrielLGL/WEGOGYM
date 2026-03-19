import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import User from '../../model/models/User'
import { getMondayOfCurrentWeek } from '../../model/utils/statsHelpers'
import { computeReadiness } from '../../model/utils/workoutReadinessHelpers'
import type { ReadinessLevel } from '../../model/utils/workoutReadinessHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeStatusStripProps {
  user: User | null
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
}

function getReadinessColor(level: ReadinessLevel, colors: ThemeColors) {
  switch (level) {
    case 'optimal': return colors.primary
    case 'good': return colors.success
    case 'moderate': return colors.amber
    case 'low': return colors.danger
  }
}

export function HomeStatusStrip({ user, histories, sets, exercises }: HomeStatusStripProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const streak = user?.currentStreak ?? 0

  // Weekly sessions count
  const { weekSessions, weekSessionsTarget, volumeDeltaPct } = useMemo(() => {
    const mondayTs = getMondayOfCurrentWeek()
    const prevMondayTs = mondayTs - 7 * 24 * 60 * 60 * 1000
    const active = histories.filter(h => h.deletedAt === null && !h.isAbandoned)
    const currentWeekIds = new Set(
      active.filter(h => h.startTime.getTime() >= mondayTs).map(h => h.id)
    )
    const prevWeekIds = new Set(
      active.filter(h => {
        const ts = h.startTime.getTime()
        return ts >= prevMondayTs && ts < mondayTs
      }).map(h => h.id)
    )
    const currentVol = sets
      .filter(s => currentWeekIds.has(s.history.id))
      .reduce((sum, s) => sum + s.weight * s.reps, 0)
    const prevVol = sets
      .filter(s => prevWeekIds.has(s.history.id))
      .reduce((sum, s) => sum + s.weight * s.reps, 0)
    const delta = prevVol > 0 ? Math.round(((currentVol - prevVol) / prevVol) * 100) : 0

    return {
      weekSessions: currentWeekIds.size,
      weekSessionsTarget: user?.streakTarget ?? 4,
      volumeDeltaPct: delta,
    }
  }, [histories, sets, user?.streakTarget])

  // Readiness
  const readiness = useMemo(() => {
    if (!sets.length) return null
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeReadiness(mappedSets, mappedExercises, mappedHistories)
  }, [sets, exercises, histories])

  const chips = [
    {
      label: `${streak}j`,
      icon: '🔥',
      onPress: () => navigation.navigate('StatsCalendar'),
    },
    {
      label: `${weekSessions}/${weekSessionsTarget}`,
      icon: '📊',
      onPress: () => navigation.navigate('ReportDetail' as never),
    },
    {
      label: readiness ? String(readiness.score) : '—',
      icon: '💪',
      dotColor: readiness ? getReadinessColor(readiness.level, colors) : colors.placeholder,
      onPress: () => {}, // scroll to body status — handled by parent
    },
    {
      label: volumeDeltaPct === 0 ? '—' : `${volumeDeltaPct > 0 ? '+' : ''}${volumeDeltaPct}%`,
      icon: '📈',
      onPress: () => navigation.navigate('StatsVolume'),
    },
  ]

  return (
    <View style={styles.container}>
      {chips.map((chip, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.chip}
          onPress={() => { haptics.onSelect(); chip.onPress() }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={chip.label}
        >
          <Text style={styles.chipIcon}>{chip.icon}</Text>
          <Text style={styles.chipLabel}>{chip.label}</Text>
          {chip.dotColor && (
            <View style={[styles.chipDot, { backgroundColor: chip.dotColor }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    chip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    chipIcon: {
      fontSize: fontSize.xs,
    },
    chipLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
    },
    chipDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  }), [colors])
}
