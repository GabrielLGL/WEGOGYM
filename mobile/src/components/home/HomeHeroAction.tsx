import React, { useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import History from '../../model/models/History'
import WorkoutSet from '../../model/models/Set'
import Exercise from '../../model/models/Exercise'
import Session from '../../model/models/Session'
import Program from '../../model/models/Program'
import { computeReadiness } from '../../model/utils/workoutReadinessHelpers'
import type { ReadinessLevel, HealthConnectData } from '../../model/utils/workoutReadinessHelpers'
import { createQuickStartSession } from '../../model/utils/workoutSessionUtils'
import { useColors } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useHaptics } from '../../hooks/useHaptics'
import type { ThemeColors } from '../../theme'
import { spacing, borderRadius, fontSize } from '../../theme'
import type { RootStackParamList } from '../../navigation'

interface HomeHeroActionProps {
  histories: History[]
  sets: WorkoutSet[]
  exercises: Exercise[]
  sessions: Session[]
  programs: Program[]
  healthData?: HealthConnectData
  weeklyTarget?: number
}

function getReadinessColor(level: ReadinessLevel, colors: ThemeColors) {
  switch (level) {
    case 'optimal': return colors.primary
    case 'good': return colors.success
    case 'moderate': return colors.amber
    case 'low': return colors.danger
  }
}

function HomeHeroActionInner({ histories, sets, exercises, sessions, programs, healthData, weeklyTarget }: HomeHeroActionProps) {
  const colors = useColors()
  const { t } = useLanguage()
  const haptics = useHaptics()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const styles = useStyles(colors)

  // Find active (in-progress) workout
  const activeWorkout = useMemo(() => {
    const inProgress = histories.find(h => h.startTime && !h.endTime && !h.isAbandoned && h.deletedAt === null)
    if (!inProgress) return null
    const session = sessions.find(s => s.id === inProgress.sessionId)
    return { history: inProgress, sessionName: session?.name ?? t.home.quickStart.noSession }
  }, [histories, sessions, t])

  // Last completed session for quick-start
  const lastSession = useMemo(() => {
    const completed = histories.filter(h => h.endTime && !h.isAbandoned && h.deletedAt === null)
    if (completed.length === 0) return null
    const last = completed.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0]
    const session = sessions.find(s => s.id === last.sessionId)
    if (!session) return null
    return { sessionId: session.id, sessionName: session.name }
  }, [histories, sessions])

  // Readiness
  const readiness = useMemo(() => {
    if (!sets.length) return null
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeReadiness(mappedSets, mappedExercises, mappedHistories, healthData, weeklyTarget)
  }, [sets, exercises, histories, healthData, weeklyTarget])

  const isRestRecommended = readiness && readiness.level === 'low'

  const handleGo = useCallback(() => {
    haptics.onPress()
    if (activeWorkout) {
      navigation.navigate('Workout', { sessionId: activeWorkout.history.sessionId, historyId: activeWorkout.history.id })
    } else if (lastSession) {
      navigation.navigate('Workout', { sessionId: lastSession.sessionId })
    } else {
      navigation.navigate('Programs')
    }
  }, [haptics, activeWorkout, lastSession, navigation])

  const handleQuickStart = useCallback(async () => {
    haptics.onPress()
    try {
      const today = new Date().toLocaleDateString('fr-FR')
      const sessionId = await createQuickStartSession(`${t.home.freeWorkout.sessionName} ${today}`)
      navigation.navigate('SessionDetail', { sessionId })
    } catch (e) {
      if (__DEV__) console.error('Quick start failed:', e)
    }
  }, [haptics, navigation, t])

  const handleShortcut = useCallback((route: keyof RootStackParamList) => {
    haptics.onSelect()
    // React Navigation overloads don't resolve union route types; all shortcut routes have no required params
    ;(navigation.navigate as (screen: string) => void)(route)
  }, [haptics, navigation])

  const shortcuts: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; route: keyof RootStackParamList }> = [
    { icon: 'library-outline', label: t.home.tiles.programs, route: 'Programs' },
    { icon: 'barbell-outline', label: t.home.tiles.exercises, route: 'Exercices' },
    { icon: 'calendar-outline', label: t.home.tiles.calendar, route: 'StatsCalendar' },
    { icon: 'time-outline', label: t.home.tiles.duration, route: 'StatsHistory' },
  ]

  return (
    <View style={styles.container}>
      {/* Hero Card */}
      <TouchableOpacity
        style={styles.heroCard}
        onPress={handleGo}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={activeWorkout ? t.accessibility.resumeWorkout : t.accessibility.startWorkout}
      >
        {activeWorkout ? (
          // State: Workout in progress
          <>
            <View style={styles.heroLabelRow}>
              <View style={[styles.heroDot, { backgroundColor: colors.amber }]} />
              <Text style={styles.heroLabel}>{t.home.hero.inProgress}</Text>
            </View>
            <Text style={styles.heroSessionName} numberOfLines={1}>{activeWorkout.sessionName}</Text>
            <View style={styles.heroBtn}>
              <Ionicons name="play" size={18} color={colors.primaryText} />
              <Text style={styles.heroBtnText}>{t.home.hero.resume}</Text>
            </View>
          </>
        ) : isRestRecommended ? (
          // State: Rest recommended
          <>
            <View style={styles.heroLabelRow}>
              <Ionicons name="bed-outline" size={18} color={colors.amber} />
              <Text style={[styles.heroLabel, { color: colors.amber }]}>{t.home.hero.restRecommended}</Text>
            </View>
            <Text style={styles.heroSubtext}>
              {t.home.readiness.recommendations.low}
            </Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: colors.cardSecondary }]}
              onPress={handleGo}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t.accessibility.trainAnyway}
            >
              <Text style={[styles.heroBtnText, { color: colors.text }]}>{t.home.hero.trainAnyway}</Text>
            </TouchableOpacity>
          </>
        ) : (
          // State: Ready to train
          <>
            <View style={styles.heroLabelRow}>
              {readiness && (
                <View style={[styles.readinessBadge, { backgroundColor: getReadinessColor(readiness.level, colors) }]}>
                  <Text style={styles.readinessBadgeText}>{readiness.score}</Text>
                </View>
              )}
              <Text style={styles.heroLabel}>
                {lastSession ? t.home.hero.readyToTrain : t.home.hero.getStarted}
              </Text>
            </View>
            {lastSession && (
              <Text style={styles.heroSessionName} numberOfLines={1}>{lastSession.sessionName}</Text>
            )}
            <View style={styles.heroBtn}>
              <Ionicons name="flash" size={18} color={colors.primaryText} />
              <Text style={styles.heroBtnText}>{t.home.quickStart.go}</Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Quick Start — Entraînement libre */}
      {!activeWorkout && (
        <TouchableOpacity
          style={styles.quickStartBtn}
          onPress={handleQuickStart}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t.home.freeWorkout.label}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.quickStartText}>{t.home.freeWorkout.label}</Text>
        </TouchableOpacity>
      )}

      {/* Shortcut Pills */}
      <View style={styles.pillsRow}>
        {shortcuts.map(s => (
          <TouchableOpacity
            key={s.route}
            style={styles.pill}
            onPress={() => handleShortcut(s.route)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={s.label}
          >
            <Ionicons name={s.icon} size={16} color={colors.primary} />
            <Text style={styles.pillLabel} numberOfLines={1}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export const HomeHeroAction = React.memo(HomeHeroActionInner)

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    heroLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    heroDot: {
      width: 8,
      height: 8,
      borderRadius: borderRadius.xs,
    },
    heroLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    heroSessionName: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    heroSubtext: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    heroBtn: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.ms,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    heroBtnText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.primaryText,
    },
    readinessBadge: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    readinessBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.primaryText,
    },
    quickStartBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.ms,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary + '40',
      borderStyle: 'dashed',
    },
    quickStartText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    pillsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    pill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    pillLabel: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.text,
    },
  }), [colors])
}
