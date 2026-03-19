import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import Session from '../../model/models/Session'
import Program from '../../model/models/Program'
import { computeWorkoutSummary } from '../../model/utils/workoutSummaryHelpers'
import type { WorkoutSummary } from '../../model/utils/workoutSummaryHelpers'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeWorkoutSectionProps {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
  sessions: Session[]
  programs: Program[]
}

export function HomeWorkoutSection({ histories, sets, exercises, sessions, programs }: HomeWorkoutSectionProps) {
  const colors = useColors()
  const { t, language } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  const lastCompletedHistory = useMemo(() => {
    const completed = histories.filter(h => h.endTime)
    if (completed.length === 0) return null
    return completed.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0]
  }, [histories])

  const lastSessionName = useMemo(() => {
    if (!lastCompletedHistory) return null
    const sessionId = lastCompletedHistory.session.id
    const session = sessions.find(s => s.id === sessionId)
    return session?.name ?? null
  }, [lastCompletedHistory, sessions])

  const lastWorkout = useMemo<WorkoutSummary | null>(() => {
    if (!histories.length || !sets.length) return null
    const mappedHistories = histories.map(h => ({
      id: h.id,
      startedAt: h.startTime,
      completedAt: h.endTime,
      isAbandoned: h.isAbandoned,
      sessionId: h.sessionId,
    }))
    const mappedSets = sets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      exerciseId: s.exerciseId,
      historyId: s.historyId,
      isPr: s.isPr,
    }))
    const mappedExercises = exercises.map(e => ({ id: e.id, name: e.name }))
    const mappedSessions = sessions.map(s => ({ id: s.id, name: s.name, programId: s.programId }))
    const mappedPrograms = programs.map(p => ({ id: p.id, name: p.name }))
    return computeWorkoutSummary(mappedHistories, mappedSets, mappedExercises, mappedSessions, mappedPrograms, language)
  }, [histories, sets, exercises, sessions, programs, language])

  return (
    <>
      {/* Last Workout Summary */}
      {lastWorkout && (
        <View style={styles.lastWorkoutCard}>
          <View style={styles.lastWorkoutHeader}>
            <Text style={styles.lastWorkoutTitle}>{t.home.lastWorkout.title}</Text>
            <Text style={styles.lastWorkoutTime}>{lastWorkout.timeAgo}</Text>
          </View>
          <Text style={styles.lastWorkoutSession}>
            {lastWorkout.sessionName}
            {lastWorkout.programName && ` — ${lastWorkout.programName}`}
          </Text>
          <View style={styles.lastWorkoutStats}>
            <View style={styles.lwStatItem}>
              <Text style={styles.lwStatValue}>{lastWorkout.durationMinutes}m</Text>
              <Text style={styles.lwStatLabel}>{t.home.lastWorkout.duration}</Text>
            </View>
            <View style={styles.lwStatItem}>
              <Text style={styles.lwStatValue}>{(lastWorkout.totalVolume / 1000).toFixed(1)}t</Text>
              <Text style={styles.lwStatLabel}>{t.home.lastWorkout.volume}</Text>
            </View>
            <View style={styles.lwStatItem}>
              <Text style={styles.lwStatValue}>{lastWorkout.totalSets}</Text>
              <Text style={styles.lwStatLabel}>{t.home.lastWorkout.sets}</Text>
            </View>
            <View style={styles.lwStatItem}>
              <Text style={styles.lwStatValue}>{Math.round(lastWorkout.density)}</Text>
              <Text style={styles.lwStatLabel}>kg/min</Text>
            </View>
          </View>
          {lastWorkout.prsHit > 0 && (
            <Text style={styles.lastWorkoutPRs}>
              {lastWorkout.prsHit} {t.home.lastWorkout.prs}
            </Text>
          )}
        </View>
      )}

      {/* Quick-start */}
      {lastCompletedHistory && lastSessionName && (
        <TouchableOpacity
          style={styles.quickStartCard}
          activeOpacity={0.7}
          onPress={() => {
            haptics.onPress()
            const sessionId = lastCompletedHistory.session.id
            const sessionExists = sessions.find(s => s.id === sessionId)
            if (sessionExists) {
              navigation.navigate('Workout', { sessionId })
            }
          }}
        >
          <Ionicons name="play-circle-outline" size={32} color={colors.primary} />
          <View style={styles.quickStartTextBlock}>
            <Text style={styles.quickStartTitle}>{lastSessionName}</Text>
            <Text style={styles.quickStartSubtitle}>{t.home.quickStart.subtitle}</Text>
          </View>
          <View style={styles.quickStartGoBtn}>
            <Text style={styles.quickStartGoText}>{t.home.quickStart.go}</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    lastWorkoutCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    lastWorkoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    lastWorkoutTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    lastWorkoutTime: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    lastWorkoutSession: {
      fontSize: fontSize.bodyMd,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    lastWorkoutStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    lwStatItem: {
      alignItems: 'center',
    },
    lwStatValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
    },
    lwStatLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    lastWorkoutPRs: {
      fontSize: fontSize.caption,
      color: colors.success,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    quickStartCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.ms,
    },
    quickStartTextBlock: {
      flex: 1,
    },
    quickStartTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    quickStartSubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    quickStartGoBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    quickStartGoText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.primaryText,
    },
  }), [colors])
}
