/**
 * HomeScreen — Dashboard principal / hub de navigation
 *
 * Affiche en un coup d'œil :
 * - Profil utilisateur (niveau, XP, streak, badges récents)
 * - KPIs globaux (séances totales, tonnage, PRs)
 * - Activité de la semaine (jours d'entraînement)
 * - Phrase motivationnelle dynamique
 * - CoachMarks (tutoriel premier lancement)
 *
 * Toutes les données sont observées via withObservables → mise à jour automatique.
 * Les célébrations (milestones, badges) sont transmises depuis WorkoutScreen
 * via les params de navigation et affichées en overlay au retour sur Home.
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

import { database } from '../model'
import History from '../model/models/History'
import WorkoutSet from '../model/models/Set'
import Session from '../model/models/Session'
import User from '../model/models/User'
import UserBadge from '../model/models/UserBadge'
import Exercise from '../model/models/Exercise'
import FriendSnapshot from '../model/models/FriendSnapshot'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import { BADGES_LIST } from '../model/utils/badgeConstants'
import { computeMotivationalPhrase, buildWeeklyActivity, getMondayOfCurrentWeek } from '../model/utils/statsHelpers'
import { xpToNextLevel, formatTonnage } from '../model/utils/gamificationHelpers'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../model/utils/badgeConstants'
import { MilestoneCelebration } from '../components/MilestoneCelebration'
import { BadgeCelebration } from '../components/BadgeCelebration'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { LevelBadge } from '../components/LevelBadge'
import { XPProgressBar } from '../components/XPProgressBar'
import { StreakIndicator } from '../components/StreakIndicator'
import { CoachMarks } from '../components/CoachMarks'
import type { CoachMarkStep } from '../components/CoachMarks'
import { useCoachMarks } from '../hooks/useCoachMarks'
import { WeeklyReportCard } from '../components/WeeklyReportCard'
import DeloadRecommendationCard from '../components/DeloadRecommendationCard'
import { computeDeloadRecommendation } from '../model/utils/deloadHelpers'
import { computeFatigueIndex } from '../model/utils/fatigueIndexHelpers'
import type { FatigueResult } from '../model/utils/fatigueIndexHelpers'
import { computeMuscleRecovery, getRecoveryColor } from '../model/utils/muscleRecoveryHelpers'
import { computeReadiness } from '../model/utils/workoutReadinessHelpers'
import type { ReadinessResult, ReadinessLevel } from '../model/utils/workoutReadinessHelpers'
import { computeFlashback } from '../model/utils/flashbackHelpers'
import type { FlashbackData } from '../model/utils/flashbackHelpers'
import { computeMotivation } from '../model/utils/motivationHelpers'
import { WEEK_MS } from '../model/constants'
import type { RootStackParamList } from '../navigation'
import { buildWidgetData, saveWidgetData } from '../services/widgetDataService'
import { computeAthleteClass } from '../model/utils/athleteClassHelpers'
import { computeExerciseOfWeek } from '../model/utils/exerciseOfWeekHelpers'
import { useModalState } from '../hooks/useModalState'
import { BottomSheet } from '../components/BottomSheet'
import { computeStreakHeatmap } from '../model/utils/streakHeatmapHelpers'
import { computeStreakMilestones } from '../model/utils/streakMilestonesHelpers'
import { computeWeeklyGoals } from '../model/utils/weeklyGoalsHelpers'
import { computeRestSuggestion } from '../model/utils/restDaySuggestionsHelpers'
import { computeWorkoutSummary } from '../model/utils/workoutSummaryHelpers'
import type { WorkoutSummary } from '../model/utils/workoutSummaryHelpers'
import Program from '../model/models/Program'

const DEFAULT_STATUS_BAR_HEIGHT = 44
const DAY_CHIP_MIN_HEIGHT = 84

function getHeatmapColor(intensity: 0 | 1 | 2 | 3, colors: ThemeColors): string {
  switch (intensity) {
    case 0: return colors.card
    case 1: return '#2D6A4F'
    case 2: return '#40916C'
    case 3: return '#52B788'
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>
type HomeRoute = RouteProp<RootStackParamList, 'Home'>

// ─── Célébrations ─────────────────────────────────────────────────────────────

type CelebrationItem =
  | { type: 'milestone'; data: MilestoneEvent }
  | { type: 'badge'; data: BadgeDefinition }

// ─── Sections & Tuiles ───────────────────────────────────────────────────────

interface Tile {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  route: keyof RootStackParamList
}

interface Section {
  title: string
  tiles: Tile[]
}

/** All navigable routes from the dashboard */

// ─── KPI Item ─────────────────────────────────────────────────────────────────

function KpiItem({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  const styles = useStyles(colors)
  return (
    <View style={styles.kpiItem}>
      <Text style={styles.kpiValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  )
}

// ─── Flashback Card ───────────────────────────────────────────────────────────

function FlashbackCard({
  currentSessions,
  currentVolume,
  flashback1m,
  flashback3m,
}: {
  currentSessions: number
  currentVolume: number
  flashback1m: FlashbackData | null
  flashback3m: FlashbackData | null
}) {
  const colors = useColors()
  const { t } = useLanguage()

  const cardStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  }), [colors])

  const titleStyle = useMemo(() => ({
    fontSize: fontSize.md,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  }), [colors])

  const periodLabelStyle = useMemo(() => ({
    fontSize: fontSize.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  }), [colors])

  const colHeaderStyle = useMemo(() => ({
    fontSize: fontSize.xs,
    color: colors.placeholder,
    marginBottom: spacing.xs,
  }), [colors])

  const statValueStyle = useMemo(() => ({
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500' as const,
  }), [colors])

  const renderPeriod = (flashback: FlashbackData, label: string) => {
    const sessionDelta = currentSessions - flashback.sessions
    const volumePct = flashback.volumeKg > 0
      ? Math.round(((currentVolume - flashback.volumeKg) / flashback.volumeKg) * 100)
      : null
    const sessionDeltaColor = sessionDelta >= 0 ? colors.primary : colors.danger
    const volumeDeltaColor = (volumePct ?? 0) >= 0 ? colors.primary : colors.danger

    return (
      <View key={label}>
        <Text style={periodLabelStyle}>{label}</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text style={colHeaderStyle}>{t.flashback.thisWeek}</Text>
            <Text style={statValueStyle}>{currentSessions} {t.flashback.sessions}</Text>
            <Text style={statValueStyle}>{Math.round(currentVolume)} kg</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.separator, marginHorizontal: spacing.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={colHeaderStyle}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={statValueStyle}>{flashback.sessions} {t.flashback.sessions}</Text>
              <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: sessionDeltaColor }}>
                {sessionDelta >= 0 ? '+' : ''}{sessionDelta}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={statValueStyle}>{Math.round(flashback.volumeKg)} kg</Text>
              {volumePct !== null && (
                <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: volumeDeltaColor }}>
                  {volumePct >= 0 ? '+' : ''}{volumePct}%
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>📸 {t.flashback.title}</Text>
      {flashback1m && renderPeriod(flashback1m, t.flashback.monthAgo)}
      {flashback1m && flashback3m && (
        <View style={{ height: 1, backgroundColor: colors.separator, marginVertical: spacing.sm }} />
      )}
      {flashback3m && renderPeriod(flashback3m, t.flashback.threeMonthsAgo)}
    </View>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  histories: History[]
  historiesCount: number
  sets: WorkoutSet[]
  sessions: Session[]
  userBadges: UserBadge[]
  exercises: Exercise[]
  friends: FriendSnapshot[]
}

function HomeScreenBase({ user, histories, historiesCount, sets, sessions, userBadges, exercises, friends }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const navigation = useNavigation<HomeNavigation>()
  const route = useRoute<HomeRoute>()
  const haptics = useHaptics()
  const { t, language } = useLanguage()

  // Coach marks refs
  const headerCardRef = useRef<View>(null)
  const gamificationCardRef = useRef<View>(null)
  const weeklyCardRef = useRef<View>(null)
  const trainingGridRef = useRef<View>(null)
  const settingsBtnRef = useRef<View>(null)

  const SECTIONS: Section[] = useMemo(() => [
    {
      title: t.home.sections.training,
      tiles: [
        { icon: 'library-outline', label: t.home.tiles.programs,  route: 'Programs' },
        { icon: 'barbell-outline',  label: t.home.tiles.exercises, route: 'Exercices' },
        { icon: 'calendar-outline', label: t.home.tiles.calendar,  route: 'StatsCalendar' },
        { icon: 'newspaper-outline', label: t.home.tiles.activityFeed, route: 'ActivityFeed' },
      ],
    },
    {
      title: t.home.sections.stats,
      tiles: [
        { icon: 'time-outline',    label: t.home.tiles.duration, route: 'StatsDuration' },
        { icon: 'barbell-outline', label: t.home.tiles.volume,   route: 'StatsVolume' },
        { icon: 'resize-outline',  label: t.home.tiles.measures, route: 'StatsMeasurements' },
        { icon: 'camera-outline',  label: t.home.tiles.photos,   route: 'ProgressPhotos' },
        { icon: 'git-network-outline', label: t.home.tiles.hexagon, route: 'StatsHexagon' },
      ],
    },
  ], [t])

  const celebrationQueueRef = useRef<CelebrationItem[]>([])
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationItem | null>(null)

  useEffect(() => {
    const celebrations = route.params?.celebrations
    if (!celebrations) return
    const queue: CelebrationItem[] = [
      ...(celebrations.milestones ?? []).map(m => ({ type: 'milestone' as const, data: m })),
      ...(celebrations.badges ?? []).map(b => ({ type: 'badge' as const, data: b })),
    ]
    if (queue.length === 0) return
    setCurrentCelebration(queue[0])
    celebrationQueueRef.current = queue.slice(1)
    navigation.setParams({ celebrations: undefined })
  }, [route.params?.celebrations, navigation])

  const handleCloseCelebration = useCallback(() => {
    const queue = celebrationQueueRef.current
    if (queue.length > 0) {
      setCurrentCelebration(queue[0])
      celebrationQueueRef.current = queue.slice(1)
    } else {
      setCurrentCelebration(null)
    }
  }, [])

  // Mise à jour du widget Android (non-bloquant, silencieux)
  useEffect(() => {
    if (!user) return
    buildWidgetData(database)
      .then(saveWidgetData)
      .catch(() => undefined)
  }, [user?.currentStreak, user?.level, histories?.length])

  // Coach marks
  const { shouldShow: shouldShowCoachMarks, markCompleted: markTutorialCompleted } = useCoachMarks(user)
  const showCoachMarks = shouldShowCoachMarks && currentCelebration === null

  const coachMarkSteps: CoachMarkStep[] = useMemo(() => [
    { key: 'kpis', targetRef: headerCardRef, text: t.coachMarks.steps.kpis, position: 'bottom' },
    { key: 'gamification', targetRef: gamificationCardRef, text: t.coachMarks.steps.gamification, position: 'bottom' },
    { key: 'weeklyActivity', targetRef: weeklyCardRef, text: t.coachMarks.steps.weeklyActivity, position: 'bottom' },
    { key: 'programs', targetRef: trainingGridRef, text: t.coachMarks.steps.programs, position: 'top' },
    { key: 'settings', targetRef: settingsBtnRef, text: t.coachMarks.steps.settings, position: 'bottom' },
  ], [t])

  const xpProgress = useMemo(
    () => xpToNextLevel(user?.totalXp ?? 0, user?.level ?? 1),
    [user?.totalXp, user?.level],
  )
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

  const motivationalPhrase = useMemo(
    () => computeMotivationalPhrase(histories, sets, language),
    [histories, sets, language],
  )
  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback),
    [histories, sets, sessions, t.home.dayLabels, t.statsVolume.sessionFallback],
  )

  // ── Weekly Report Card data ──
  const weeklyReportData = useMemo(() => {
    const mondayTs = getMondayOfCurrentWeek()
    const prevMondayTs = mondayTs - 7 * 24 * 60 * 60 * 1000

    const activeHistories = histories.filter(h => h.deletedAt === null && !h.isAbandoned)
    const activeHistoryIds = new Set(activeHistories.map(h => h.id))

    // Current week histories
    const currentWeekHistoryIds = new Set(
      activeHistories.filter(h => h.startTime.getTime() >= mondayTs).map(h => h.id)
    )
    // Previous week histories
    const prevWeekHistoryIds = new Set(
      activeHistories.filter(h => {
        const ts = h.startTime.getTime()
        return ts >= prevMondayTs && ts < mondayTs
      }).map(h => h.id)
    )

    // Current week sets
    const currentWeekSets = sets.filter(s => currentWeekHistoryIds.has(s.history.id))
    const prevWeekSets = sets.filter(s => prevWeekHistoryIds.has(s.history.id))

    const sessionsCount = currentWeekHistoryIds.size
    const totalVolumeKg = currentWeekSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const prsCount = currentWeekSets.filter(s => s.isPr).length

    // Compared to previous
    const prevVolume = prevWeekSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const comparedToPrevious = prevVolume > 0
      ? Math.round(((totalVolumeKg - prevVolume) / prevVolume) * 100)
      : 0

    // Top muscles from muscle repartition (use current week data)
    const muscleVolume = new Map<string, number>()
    const exerciseMuscles = new Map(exercises.map(e => [e.id, e.muscles]))
    for (const s of currentWeekSets) {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      const vol = s.weight * s.reps
      for (const muscle of muscles) {
        const trimmed = muscle.trim()
        if (trimmed) {
          muscleVolume.set(trimmed, (muscleVolume.get(trimmed) ?? 0) + vol)
        }
      }
    }
    const topMuscles = Array.from(muscleVolume.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => muscle)

    return { sessionsCount, totalVolumeKg, prsCount, comparedToPrevious, topMuscles }
  }, [histories, sets, exercises])

  // ── Deload recommendation ──
  const [dismissedDeload, setDismissedDeload] = useState(false)
  const deloadRecommendation = useMemo(() => {
    if (!histories.length) return null

    // Compute weekly volumes from sets (index 0 = most recent week)
    const now = Date.now()
    const weeklyVolumes: number[] = []
    const historyDates = new Map(
      histories
        .filter(h => h.deletedAt === null && !h.isAbandoned)
        .map(h => [h.id, h.startTime.getTime()])
    )
    const activeHistoryIds = new Set(historyDates.keys())

    for (let w = 0; w < 5; w++) {
      const weekEnd = now - w * WEEK_MS
      const weekStart = weekEnd - WEEK_MS
      let volume = 0
      for (const s of sets) {
        if (!activeHistoryIds.has(s.history.id)) continue
        const d = historyDates.get(s.history.id) ?? 0
        if (d >= weekStart && d < weekEnd) {
          volume += s.weight * s.reps
        }
      }
      weeklyVolumes.push(volume)
    }

    const historyData = histories
      .filter(h => h.deletedAt === null && !h.isAbandoned)
      .map(h => ({ startTime: h.startTime.getTime(), endTime: h.endTime?.getTime() }))

    return computeDeloadRecommendation({
      histories: historyData,
      weeklyVolumes,
      userLevel: user?.userLevel ?? 'intermediate',
      currentStreak: user?.currentStreak ?? 0,
    })
  }, [histories, sets, user?.userLevel, user?.currentStreak])

  // ── Athlete class ──
  const athleteClass = useMemo(
    () => computeAthleteClass(sets, exercises),
    [sets, exercises],
  )

  // ── Flashback data ──
  const flashback1m = useMemo(
    () => computeFlashback(histories, sets, 1),
    [histories, sets],
  )
  const flashback3m = useMemo(
    () => computeFlashback(histories, sets, 3),
    [histories, sets],
  )

  // ── Motivation contextuelle ──
  const motivationData = useMemo(
    () => computeMotivation(histories),
    [histories],
  )
  const motivationTitle = motivationData
    ? {
        returning_after_long: t.motivation.returningAfterLongTitle,
        slight_drop: t.motivation.slightDropTitle,
        keep_going: t.motivation.keepGoingTitle,
      }[motivationData.context!]
    : null
  const motivationMessage = motivationData
    ? {
        returning_after_long: t.motivation.returningAfterLongMessage,
        slight_drop: t.motivation.slightDropMessage,
        keep_going: t.motivation.keepGoingMessage,
      }[motivationData.context!]?.replace('{n}', String(motivationData.daysSinceLastWorkout))
    : null

  // ── Exercise of the Week ──
  const exerciseOfWeek = useMemo(
    () => computeExerciseOfWeek(exercises, sets),
    [exercises, sets],
  )
  const exerciseModal = useModalState()

  // ── Streak Heatmap ──
  const heatmapData = useMemo(
    () => computeStreakHeatmap(histories),
    [histories],
  )

  // ── Streak Milestones ──
  const milestonesData = useMemo(() => {
    const mapped = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeStreakMilestones(mapped, t.home.milestones.labels as unknown as Record<number, string>)
  }, [histories, t.home.milestones.labels])

  // ── Fatigue Index ──
  const fatigueResult = useMemo<FatigueResult | null>(() => {
    if (!sets.length) return null
    return computeFatigueIndex(sets, histories)
  }, [sets, histories])

  // ── Weekly Goals ──
  const weeklyGoals = useMemo(() => {
    const mappedHistories = histories.map(h => ({
      id: h.id,
      startTime: h.startTime,
      deletedAt: h.deletedAt,
      isAbandoned: h.isAbandoned,
    }))
    const mappedSets = sets.map(s => ({
      weight: s.weight,
      reps: s.reps,
      historyId: s.history.id,
    }))
    return computeWeeklyGoals(mappedHistories, mappedSets, language)
  }, [histories, sets, language])

  // ── Muscle Recovery ──
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

  // ── Workout Readiness ──
  const readinessData = useMemo<ReadinessResult | null>(() => {
    if (!sets.length) return null
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    return computeReadiness(mappedSets, mappedExercises, mappedHistories)
  }, [sets, exercises, histories])

  // ── Rest Suggestion ──
  const restSuggestion = useMemo(() => {
    if (!histories.length) return null
    const mappedHistories = histories.map(h => ({ startedAt: h.startTime, isAbandoned: h.isAbandoned }))
    const mappedSets = sets.map(s => ({ weight: s.weight, reps: s.reps, exerciseId: s.exerciseId, createdAt: s.createdAt }))
    const mappedExercises = exercises.map(e => ({ id: e.id, muscles: e.muscles }))
    return computeRestSuggestion(mappedHistories, mappedSets, mappedExercises)
  }, [histories, sets, exercises])

  // ── Last Workout Summary ──
  const [programs, setPrograms] = useState<Array<{ id: string; name: string }>>([])
  useEffect(() => {
    let cancelled = false
    database.get<Program>('programs').query().fetch().then(progs => {
      if (!cancelled) setPrograms(progs.map(p => ({ id: p.id, name: p.name })))
    })
    return () => { cancelled = true }
  }, [sessions])

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
    return computeWorkoutSummary(mappedHistories, mappedSets, mappedExercises, mappedSessions, programs, language)
  }, [histories, sets, exercises, sessions, programs, language])

  const handleTilePress = (tile: Tile) => {
    haptics.onPress()
    try {
      navigation.navigate(tile.route as never)
    } catch {
      if (__DEV__) console.warn(`[HomeScreen] Route "${tile.route}" non disponible`)
    }
  }

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ flex: 1 }}
    >
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Card ── */}
      <View ref={headerCardRef} style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              {t.home.greeting.replace('{name}', user?.name || t.stats.defaultName)}
            </Text>
            <Text style={styles.motivation}>{motivationalPhrase}</Text>
          </View>
          <TouchableOpacity
            ref={settingsBtnRef}
            style={styles.settingsBtn}
            activeOpacity={0.6}
            onPress={() => {
              haptics.onPress()
              navigation.navigate('Settings')
            }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.kpisRow}>
          <KpiItem label={t.home.tiles.sessions} value={String(historiesCount)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label={t.home.tiles.tonnage} value={formatTonnage(user?.totalTonnage ?? 0)} colors={colors} />
          <View style={styles.kpiSeparator} />
          <KpiItem label={t.home.tiles.records} value={String(user?.totalPrs ?? 0)} colors={colors} />
        </View>
      </View>

      {/* ── Card Gamification ── */}
      <View ref={gamificationCardRef} style={styles.gamificationCard}>
        <LevelBadge level={user?.level ?? 1} />
        <XPProgressBar
          currentXP={xpProgress.current}
          requiredXP={xpProgress.required}
          percentage={xpProgress.percentage}
        />
        <StreakIndicator
          currentStreak={user?.currentStreak ?? 0}
          streakTarget={user?.streakTarget ?? 3}
        />
        {athleteClass && (
          <View style={styles.athleteClassRow}>
            <Text style={styles.athleteClassLabel}>
              {t.athleteClass[athleteClass.class]}
            </Text>
          </View>
        )}
        <View style={styles.badgesSeparator} />
        <TouchableOpacity
          style={styles.badgesRow}
          activeOpacity={0.7}
          onPress={() => {
            haptics.onPress()
            navigation.navigate('Badges')
          }}
        >
          <View style={styles.badgesLabelRow}>
            <Ionicons name="medal-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.badgesLabel}>{t.home.tiles.badges}</Text>
          </View>
          <Text style={styles.badgesCount}>
            {userBadges.length}/{BADGES_LIST.length} {'\u203A'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Streak Heatmap ── */}
      {heatmapData.totalWorkouts > 0 && (
        <View style={styles.heatmapSection}>
          <View style={styles.heatmapHeader}>
            <Text style={styles.heatmapTitle}>{t.home.heatmap.title}</Text>
            <View style={styles.heatmapStats}>
              <Text style={styles.heatmapSubtitle}>
                {heatmapData.activeDays} {t.home.heatmap.activeDays}
              </Text>
              {heatmapData.currentStreak > 0 && (
                <Text style={styles.heatmapSubtitle}>
                  {t.home.heatmap.streak} {heatmapData.currentStreak}j
                </Text>
              )}
            </View>
          </View>
          <View style={styles.heatmapGrid}>
            {Array.from({ length: 13 }, (_, wi) => (
              <View key={wi} style={styles.heatmapColumn}>
                {heatmapData.days.slice(wi * 7, wi * 7 + 7).map((day, di) => (
                  <View
                    key={di}
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: getHeatmapColor(day.intensity, colors) },
                      day.isToday && styles.heatmapCellToday,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={styles.heatmapLegendText}>{t.home.heatmap.less}</Text>
            {([0, 1, 2, 3] as const).map(i => (
              <View
                key={i}
                style={[
                  styles.heatmapLegendCell,
                  { backgroundColor: getHeatmapColor(i, colors) },
                ]}
              />
            ))}
            <Text style={styles.heatmapLegendText}>{t.home.heatmap.more}</Text>
          </View>
        </View>
      )}

      {/* ── Streak Milestones ── */}
      {milestonesData.currentStreak > 0 && (
        <View style={styles.milestonesCard}>
          <View style={styles.milestonesHeader}>
            <Text style={styles.milestonesTitle}>{t.home.milestones.title}</Text>
            <Text style={styles.milestonesStreak}>
              {milestonesData.currentStreak}j {t.home.milestones.streak}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.milestonesScroll}>
            {milestonesData.milestones.map(m => (
              <View key={m.days} style={[
                styles.milestoneBadge,
                { backgroundColor: m.reached ? colors.primary : colors.background,
                  opacity: m.reached ? 1 : 0.4 },
              ]}>
                <Text style={styles.milestoneIcon}>{m.icon}</Text>
                <Text style={[styles.milestoneDays, { color: m.reached ? colors.primaryText : colors.textSecondary }]}>
                  {m.days}j
                </Text>
              </View>
            ))}
          </ScrollView>
          {milestonesData.nextMilestone && (
            <View style={styles.nextMilestoneRow}>
              <View style={styles.nextMilestoneBarTrack}>
                <View style={[styles.nextMilestoneBarFill, {
                  width: `${milestonesData.progressToNext}%`,
                }]} />
              </View>
              <Text style={styles.nextMilestoneLabel}>
                {milestonesData.daysToNext}j → {milestonesData.nextMilestone.label}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Readiness Score ── */}
      {readinessData && (() => {
        const getReadinessLevel = (v: number): ReadinessLevel => {
          if (v >= 80) return 'optimal'
          if (v >= 60) return 'good'
          if (v >= 40) return 'moderate'
          return 'low'
        }
        const getReadinessColor = (level: ReadinessLevel) => {
          switch (level) {
            case 'optimal': return colors.primary
            case 'good': return '#10B981'
            case 'moderate': return '#F59E0B'
            case 'low': return colors.danger
          }
        }
        const levelColor = getReadinessColor(readinessData.level)
        const ReadinessBar = ({ label, value }: { label: string; value: number }) => (
          <View style={styles.readinessBarRow}>
            <Text style={styles.readinessBarLabel}>{label}</Text>
            <View style={styles.readinessBarBg}>
              <View style={[styles.readinessBarFill, { width: `${value}%`, backgroundColor: getReadinessColor(getReadinessLevel(value)) }]} />
            </View>
            <Text style={styles.readinessBarValue}>{value}</Text>
          </View>
        )
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

      {/* ── Indice de fatigue ── */}
      {fatigueResult && fatigueResult.weeklyVolume > 0 && (() => {
        const fatigueColor = fatigueResult.zone === 'overreaching'
          ? colors.danger
          : fatigueResult.zone === 'reaching'
            ? '#F59E0B'
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
              {/* Marker zone optimale (50%) */}
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

      {/* ── Weekly Goals ── */}
      <View style={styles.goalsCard}>
        <View style={styles.goalsHeader}>
          <Text style={styles.goalsTitle}>{t.home.weeklyGoals.title}</Text>
          <Text style={styles.goalsWeekLabel}>
            {weeklyGoals.completed
              ? t.home.weeklyGoals.completed
              : `${weeklyGoals.daysRemaining} ${t.home.weeklyGoals.daysLeft}`}
          </Text>
        </View>
        {/* Sessions */}
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>{t.home.weeklyGoals.sessions}</Text>
          <Text style={styles.goalValue}>{weeklyGoals.sessionsCount}/{weeklyGoals.sessionsTarget}</Text>
        </View>
        <View style={styles.goalBarTrack}>
          <View style={[
            styles.goalBarFill,
            {
              width: `${weeklyGoals.sessionsPct}%`,
              backgroundColor: weeklyGoals.sessionsPct >= 100 ? '#10B981' : colors.primary,
            },
          ]} />
        </View>
        {/* Volume */}
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>{t.home.weeklyGoals.volume}</Text>
          <Text style={styles.goalValue}>
            {weeklyGoals.volumeKg >= 1000
              ? `${(weeklyGoals.volumeKg / 1000).toFixed(1)}t`
              : `${weeklyGoals.volumeKg} kg`}
            {' / '}
            {weeklyGoals.volumeTarget >= 1000
              ? `${(weeklyGoals.volumeTarget / 1000).toFixed(0)}t`
              : `${weeklyGoals.volumeTarget} kg`}
          </Text>
        </View>
        <View style={styles.goalBarTrack}>
          <View style={[
            styles.goalBarFill,
            {
              width: `${weeklyGoals.volumePct}%`,
              backgroundColor: weeklyGoals.volumePct >= 100 ? '#10B981' : colors.primary,
            },
          ]} />
        </View>
      </View>

      {/* ── Last Workout Summary ── */}
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

      {/* ── Récupération musculaire ── */}
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

      {/* ── Rest Suggestion ── */}
      {restSuggestion && restSuggestion.shouldRest && (
        <View style={[styles.restCard, {
          borderLeftColor: restSuggestion.confidence === 'high' ? colors.danger
            : restSuggestion.confidence === 'medium' ? '#F59E0B' : colors.textSecondary,
        }]}>
          <View style={styles.restHeader}>
            <Text style={styles.restTitle}>{t.home.restSuggestion.title}</Text>
            <View style={[styles.restConfidenceBadge, {
              backgroundColor: restSuggestion.confidence === 'high' ? colors.danger
                : restSuggestion.confidence === 'medium' ? '#F59E0B' : colors.textSecondary,
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

      {/* ── Quick-start ── */}
      {lastCompletedHistory && lastSessionName && (
        <TouchableOpacity
          style={styles.quickStartCard}
          activeOpacity={0.7}
          onPress={() => {
            haptics.onPress()
            // Guard: verify session still exists before navigating (could have been deleted)
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

      {/* ── Card Activité Semaine ── */}
      <View ref={weeklyCardRef} style={styles.weeklyCard}>
        <View style={styles.weeklyHeader}>
          <Text style={styles.sectionTitle}>{t.home.weeklyActivity}</Text>
          <Text style={styles.weeklySubtitle}>
            {(() => {
              const totalSessions = weeklyActivity.reduce((acc, d) => acc + d.sessions.length, 0)
              if (totalSessions === 0) return t.home.noSessions
              const totalVolume = weeklyActivity.reduce(
                (acc, d) => acc + d.sessions.reduce((a, s) => a + s.volumeKg, 0), 0
              )
              return `${totalSessions} ${totalSessions > 1 ? t.home.sessions : t.home.session} · ${Math.round(totalVolume)} ${t.statsMeasurements.weightUnit}`
            })()}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {weeklyActivity.map((day) => (
            <View
              key={day.dateKey}
              style={[
                styles.dayChip,
                day.isToday && styles.dayChipToday,
                !day.isToday && day.isPast && day.sessions.length === 0 && styles.dayChipRestPast,
              ]}
            >
              <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                {day.dayLabel}
              </Text>
              <Text style={[styles.dayNumber, day.isToday && styles.dayNumberToday]}>
                {day.dayNumber}
              </Text>
              {day.sessions.length > 0 ? (
                day.sessions.map((s, idx) => (
                  <View key={idx} style={styles.sessionTag}>
                    <Text style={styles.sessionName} numberOfLines={1}>{s.sessionName}</Text>
                    <Text style={styles.sessionMeta}>
                      {s.setCount} {t.home.series}{s.durationMin !== null ? ` · ${s.durationMin}m` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>{day.isPast ? t.home.rest : '—'}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── Motivation contextuelle ── */}
      {motivationData && motivationTitle && motivationMessage && (
        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Ionicons
              name={motivationData.context === 'returning_after_long' ? 'heart-outline' : 'flame-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.motivationTitle}>{motivationTitle}</Text>
          </View>
          <Text style={styles.motivationText}>{motivationMessage}</Text>
        </View>
      )}

      {/* ── Weekly Report Card ── */}
      <WeeklyReportCard
        sessionsCount={weeklyReportData.sessionsCount}
        totalVolumeKg={weeklyReportData.totalVolumeKg}
        prsCount={weeklyReportData.prsCount}
        comparedToPrevious={weeklyReportData.comparedToPrevious}
        topMuscles={weeklyReportData.topMuscles}
        onPress={() => {
          try {
            navigation.navigate('ReportDetail' as never)
          } catch {
            if (__DEV__) console.warn('[HomeScreen] Route "ReportDetail" non disponible')
          }
        }}
      />

      {/* ── Flashback ── */}
      {(flashback1m !== null || flashback3m !== null) && (
        <FlashbackCard
          currentSessions={weeklyReportData.sessionsCount}
          currentVolume={weeklyReportData.totalVolumeKg}
          flashback1m={flashback1m}
          flashback3m={flashback3m}
        />
      )}

      {/* ── Deload Recommendation ── */}
      {deloadRecommendation && !dismissedDeload && (
        <DeloadRecommendationCard
          recommendation={deloadRecommendation}
          onDismiss={() => setDismissedDeload(true)}
        />
      )}

      {/* ── Sections de tuiles ── */}
      {SECTIONS.map((section, sectionIndex) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View ref={sectionIndex === 0 ? trainingGridRef : undefined} style={styles.grid}>
            {section.tiles.map(tile => (
              <TouchableOpacity
                key={tile.route}
                style={styles.gridBtn}
                onPress={() => handleTilePress(tile)}
                activeOpacity={0.7}
              >
                <Ionicons name={tile.icon} size={28} color={colors.primary} />
                <Text style={styles.btnLabel}>{tile.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* ── Tuiles Outils (Leaderboard + Skill Tree) ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.home.sections.tools}</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridBtn}
            onPress={() => { haptics.onPress(); navigation.navigate('Leaderboard') }}
            activeOpacity={0.7}
          >
            <Ionicons name="trophy-outline" size={28} color={colors.primary} />
            <Text style={styles.btnLabel}>{t.leaderboard.title}</Text>
            {friends.length > 0 && (
              <Text style={[styles.btnLabel, { color: colors.textSecondary, marginTop: 0 }]}>
                {friends.length} ami{friends.length > 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridBtn}
            onPress={() => { haptics.onPress(); navigation.navigate('SkillTree') }}
            activeOpacity={0.7}
          >
            <Ionicons name="git-branch-outline" size={28} color={colors.primary} />
            <Text style={styles.btnLabel}>{t.home.tiles.skillTree}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridBtn}
            onPress={() => { haptics.onPress(); navigation.navigate('PersonalChallenges') }}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={28} color={colors.primary} />
            <Text style={styles.btnLabel}>{t.home.tiles.challenges}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Exercice de la Semaine ── */}
      {exerciseOfWeek && (
        <TouchableOpacity
          style={styles.exerciseOfWeekCard}
          onPress={() => { haptics.onPress(); exerciseModal.open() }}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseOfWeekHeader}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <Text style={styles.exerciseOfWeekTitle}>{t.exerciseOfWeek.title}</Text>
          </View>
          <Text style={styles.exerciseOfWeekName}>{exerciseOfWeek.exercise.name}</Text>
          <Text style={styles.exerciseOfWeekSub}>
            {exerciseOfWeek.isNew
              ? t.exerciseOfWeek.neverDone
              : t.exerciseOfWeek.daysAgo.replace('{n}', String(exerciseOfWeek.daysSinceLastDone))}
          </Text>
          {exerciseOfWeek.exercise.muscles.length > 0 && (
            <View style={styles.exerciseOfWeekMuscles}>
              {exerciseOfWeek.exercise.muscles.slice(0, 3).map(m => (
                <View key={m} style={styles.muscleChip}>
                  <Text style={styles.muscleChipText}>{m}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>

    {/* Modal detail exercice */}
    <BottomSheet
      visible={exerciseModal.isOpen}
      onClose={exerciseModal.close}
      title={exerciseOfWeek?.exercise.name ?? ''}
    >
      {exerciseOfWeek && (
        <View style={styles.exerciseModalContent}>
          <Text style={styles.exerciseModalMuscles}>
            {exerciseOfWeek.exercise.muscles.join(' · ')}
          </Text>
          <Text style={styles.exerciseModalHint}>
            {exerciseOfWeek.isNew
              ? t.exerciseOfWeek.tryItNever
              : t.exerciseOfWeek.tryItAgain.replace('{n}', String(exerciseOfWeek.daysSinceLastDone))}
          </Text>
        </View>
      )}
    </BottomSheet>

    <MilestoneCelebration
      visible={currentCelebration?.type === 'milestone'}
      milestone={currentCelebration?.type === 'milestone' ? currentCelebration.data : null}
      onClose={handleCloseCelebration}
    />

    <BadgeCelebration
      visible={currentCelebration?.type === 'badge'}
      badge={currentCelebration?.type === 'badge' ? currentCelebration.data : null}
      onClose={handleCloseCelebration}
    />

    <CoachMarks
      visible={showCoachMarks}
      steps={coachMarkSteps}
      onComplete={markTutorialCompleted}
    />

    </LinearGradient>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingTop: (StatusBar.currentHeight ?? DEFAULT_STATUS_BAR_HEIGHT) + spacing.sm,
      paddingBottom: spacing.xl,
    },
    // Header Card
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerTextBlock: {
      flex: 1,
      marginRight: spacing.sm,
    },
    settingsBtn: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.cardSecondary,
    },
    greeting: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: colors.text,
    },
    motivation: {
      fontSize: fontSize.sm,
      fontStyle: 'italic',
      color: colors.primary,
      marginTop: spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },
    kpisRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    kpiItem: {
      flex: 1,
      alignItems: 'center',
    },
    kpiValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    kpiLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    kpiSeparator: {
      width: 1,
      height: spacing.xl,
      backgroundColor: colors.separator,
    },
    // Gamification Card
    gamificationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    athleteClassRow: {
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    athleteClassLabel: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    badgesSeparator: {
      height: 1,
      backgroundColor: colors.separator,
    },
    badgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badgesLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    badgesLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    badgesCount: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.primary,
    },
    // Heatmap
    heatmapSection: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    heatmapHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    heatmapTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    heatmapStats: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    heatmapSubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    heatmapGrid: {
      flexDirection: 'row',
      gap: 3,
      justifyContent: 'center',
    },
    heatmapColumn: {
      gap: 3,
    },
    heatmapCell: {
      width: 18,
      height: 18,
      borderRadius: 3,
    },
    heatmapCellToday: {
      borderWidth: 1.5,
      borderColor: '#52B788',
    },
    heatmapLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    heatmapLegendCell: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    heatmapLegendText: {
      fontSize: fontSize.caption,
      color: colors.placeholder,
    },
    // Fatigue Card
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
    // Recovery Card
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
    // Rest Suggestion Card
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
    // Weekly Goals Card
    goalsCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    goalsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.ms,
    },
    goalsTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    goalsWeekLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    goalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    goalLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    goalValue: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.text,
    },
    goalBarTrack: {
      height: 6,
      backgroundColor: colors.cardSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    goalBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    // Readiness Card
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
    // Streak Milestones
    milestonesCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    milestonesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    milestonesTitle: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    milestonesStreak: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    milestonesScroll: {
      marginBottom: spacing.sm,
    },
    milestoneBadge: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    milestoneIcon: {
      fontSize: fontSize.lg,
    },
    milestoneDays: {
      fontSize: fontSize.caption,
      fontWeight: '600',
    },
    nextMilestoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    nextMilestoneBarTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xxs,
      overflow: 'hidden' as const,
    },
    nextMilestoneBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.xxs,
    },
    nextMilestoneLabel: {
      fontSize: fontSize.caption,
      color: colors.textSecondary,
    },
    // Last Workout Summary Card
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
      color: '#10B981',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    // Quick-start Card
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
    // Weekly Activity Card
    weeklyCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    weeklyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    weeklySubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    dayChip: {
      flex: 1,
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.xs,
      alignItems: 'center',
      minHeight: DAY_CHIP_MIN_HEIGHT,
    },
    dayChipToday: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    dayChipRestPast: {
      opacity: 0.45,
    },
    dayLabel: {
      fontSize: fontSize.mini,
      fontWeight: '600',
      color: colors.placeholder,
      letterSpacing: 0.3,
    },
    dayLabelToday: {
      color: colors.primary,
    },
    dayNumber: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    sessionTag: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.xs,
      paddingHorizontal: 3,
      paddingVertical: 2,
      marginTop: 2,
      width: '100%',
    },
    sessionName: {
      fontSize: fontSize.tiny,
      fontWeight: '700',
      color: colors.text,
    },
    sessionMeta: {
      fontSize: fontSize.micro,
      color: colors.textSecondary,
      marginTop: 1,
    },
    emptyDay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyDayText: {
      fontSize: fontSize.mini,
      color: colors.placeholder,
    },
    // Sections
    section: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    // Grille boutons
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridBtn: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      width: '31%',
    },
    btnLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    // Motivation contextuelle
    motivationCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    motivationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    motivationTitle: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '700',
    },
    motivationText: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    // Exercise of the Week
    exerciseOfWeekCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    exerciseOfWeekHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    exerciseOfWeekTitle: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    exerciseOfWeekName: {
      fontSize: fontSize.md,
      color: colors.text,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    exerciseOfWeekSub: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    exerciseOfWeekMuscles: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    muscleChip: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    muscleChipText: {
      fontSize: fontSize.xs,
      color: colors.primary,
      fontWeight: '600',
    },
    exerciseModalContent: {
      padding: spacing.md,
    },
    exerciseModalMuscles: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    exerciseModalHint: {
      fontSize: fontSize.sm,
      color: colors.text,
    },
  }), [colors])
}

// ─── Export pour les tests ────────────────────────────────────────────────────

export { HomeScreenBase as HomeContent }

// ─── withObservables ──────────────────────────────────────────────────────────

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

const enhance = withObservables([], () => ({
  user: observeCurrentUser(),
  histories: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    Q.where('created_at', Q.gte(Date.now() - NINETY_DAYS_MS)),
  ).observe(),
  historiesCount: database.get<History>('histories').query(
    Q.where('deleted_at', null),
    Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
  ).observeCount(),
  sets: database.get<WorkoutSet>('sets').query(
    Q.on('histories', Q.and(
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )),
    Q.where('created_at', Q.gte(Date.now() - THIRTY_DAYS_MS)),
  ).observe(),
  sessions: database.get<Session>('sessions').query().observe(),
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  friends: database.get<FriendSnapshot>('friend_snapshots').query().observe(),
}))

export default enhance(HomeScreenBase)
