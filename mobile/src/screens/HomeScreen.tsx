/**
 * HomeScreen — Action-First Dashboard
 *
 * Layout:
 * ZONE A (above fold): Header + Hero CTA + Status Strip + Weekly Activity
 * ZONE B (first scroll): Insights Carousel + Body Status (collapsible) + Streak (collapsible)
 * ZONE C (navigation): Unified navigation grid
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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
import Program from '../model/models/Program'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../model/utils/badgeConstants'
import { MilestoneCelebration } from '../components/MilestoneCelebration'
import { BadgeCelebration } from '../components/BadgeCelebration'
import { spacing } from '../theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { CoachMarks } from '../components/CoachMarks'
import type { CoachMarkStep } from '../components/CoachMarks'
import { useCoachMarks } from '../hooks/useCoachMarks'
import { buildWidgetData, saveWidgetData } from '../services/widgetDataService'
import { performWearableSync } from '../services/wearableSyncService'
import SleepRecordModel from '../model/models/SleepRecord'
import DailyVitalsModel from '../model/models/DailyVitals'
import { computeSleepScore } from '../model/utils/sleepHelpers'
import { computeVitalsScore } from '../model/utils/vitalsHelpers'
import { useHomeDerivedData } from '../hooks/useHomeDerivedData'
import type { RootStackParamList } from '../navigation'

import {
  HomeHeaderCard,
  HomeHeroAction,
  HomeStatusStrip,
  HomeWeeklyActivityCard,
  HomeInsightsCarousel,
  HomeBodyStatusSection,
  HomeStreakSection,
  HomeNavigationGrid,
} from '../components/home'

// ─── Navigation ───────────────────────────────────────────────────────────────

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>
type HomeRoute = RouteProp<RootStackParamList, 'Home'>

// ─── Célébrations ─────────────────────────────────────────────────────────────

type CelebrationItem =
  | { type: 'milestone'; data: MilestoneEvent }
  | { type: 'badge'; data: BadgeDefinition }

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  user: User | null
  histories: History[]
  historiesCount: number
  sets: WorkoutSet[]
  sessions: Session[]
  userBadges: UserBadge[]
  exercises: Exercise[]
  programs: Program[]
  sleepRecords: SleepRecordModel[]
  dailyVitals: DailyVitalsModel[]
}

function HomeScreenBase({ user, histories, historiesCount, sets, sessions, userBadges, exercises, programs, sleepRecords, dailyVitals }: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const styles = useStyles()
  const navigation = useNavigation<HomeNavigation>()
  const route = useRoute<HomeRoute>()
  const { t, language } = useLanguage()

  // Pre-compute derived metrics once (shared across children)
  const derived = useHomeDerivedData({
    users: user ? [user] : [],
    histories,
    sets,
    sessions,
    language,
    dayLabels: t.home.dayLabels,
    sessionFallback: t.statsVolume.sessionFallback,
  })

  // Coach marks refs
  const headerCardRef = useRef<View>(null)
  const weeklyCardRef = useRef<View>(null)
  const navigationGridRef = useRef<View>(null)
  const settingsBtnRef = useRef<View>(null)

  // ── Celebrations ──
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

  // Widget update (non-blocking)
  useEffect(() => {
    if (!user) return
    buildWidgetData(database)
      .then(saveWidgetData)
      .catch(() => undefined)
  }, [user?.currentStreak, user?.level, histories?.length])

  // Wearable auto-sync (non-blocking, after Home is displayed)
  useEffect(() => {
    if (!user?.wearableProvider) return
    performWearableSync(user).catch(() => undefined)
  }, [user?.wearableProvider])

  // Health Connect scores (computed once, shared between StatusStrip and BodyStatus)
  const healthConnectData = useMemo(() => {
    const sleepScore = sleepRecords.length > 0
      ? computeSleepScore(sleepRecords.map(r => ({
          date: r.date, durationMinutes: r.durationMinutes,
          deepMinutes: r.deepMinutes, lightMinutes: r.lightMinutes,
          remMinutes: r.remMinutes, awakeMinutes: r.awakeMinutes,
        })))?.score ?? null
      : null
    const vitalsScore = dailyVitals.length > 0
      ? computeVitalsScore(dailyVitals.map(v => ({
          date: v.date, restingHr: v.restingHr, hrvRmssd: v.hrvRmssd,
        })))?.score ?? null
      : null
    return { sleepScore, vitalsScore }
  }, [sleepRecords, dailyVitals])

  // Coach marks
  const { shouldShow: shouldShowCoachMarks, markCompleted: markTutorialCompleted } = useCoachMarks(user)
  const showCoachMarks = shouldShowCoachMarks && currentCelebration === null

  const coachMarkSteps: CoachMarkStep[] = useMemo(() => [
    { key: 'kpis', targetRef: headerCardRef, text: t.coachMarks.steps.kpis, position: 'bottom' },
    { key: 'weeklyActivity', targetRef: weeklyCardRef, text: t.coachMarks.steps.weeklyActivity, position: 'bottom' },
    { key: 'programs', targetRef: navigationGridRef, text: t.coachMarks.steps.programs, position: 'top' },
    { key: 'settings', targetRef: settingsBtnRef, text: t.coachMarks.steps.settings, position: 'bottom' },
  ], [t])

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ flex: 1, paddingTop: insets.top }}
    >
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── ZONE A — Au-dessus du fold ── */}

      <HomeHeaderCard
        user={user}
        histories={histories}
        sets={sets}
        headerCardRef={headerCardRef}
        settingsBtnRef={settingsBtnRef}
        motivationalPhrase={derived.motivationalPhrase}
      />

      <HomeHeroAction
        histories={histories}
        sets={sets}
        exercises={exercises}
        sessions={sessions}
        programs={programs}
        healthData={healthConnectData}
        weeklyTarget={user?.streakTarget ?? 3}
      />

      <HomeStatusStrip
        user={user}
        histories={histories}
        sets={sets}
        exercises={exercises}
        healthData={healthConnectData}
      />

      <HomeWeeklyActivityCard
        histories={histories}
        sets={sets}
        sessions={sessions}
        weeklyCardRef={weeklyCardRef}
        precomputedWeeklyActivity={derived.weeklyActivity}
      />

      {/* ── ZONE B — Premier scroll ── */}

      <HomeInsightsCarousel
        histories={histories}
        sets={sets}
        exercises={exercises}
        user={user}
      />

      <HomeBodyStatusSection
        sets={sets}
        exercises={exercises}
        histories={histories}
        sleepRecords={sleepRecords.map(r => ({
          date: r.date,
          durationMinutes: r.durationMinutes,
          deepMinutes: r.deepMinutes,
          lightMinutes: r.lightMinutes,
          remMinutes: r.remMinutes,
          awakeMinutes: r.awakeMinutes,
        }))}
        vitalsRecords={dailyVitals.map(v => ({
          date: v.date,
          restingHr: v.restingHr,
          hrvRmssd: v.hrvRmssd,
        }))}
        weeklyTarget={user?.streakTarget ?? 3}
      />

      <HomeStreakSection histories={histories} />

      {/* ── ZONE C — Navigation ── */}

      <HomeNavigationGrid
        navigationGridRef={navigationGridRef}
      />

    </ScrollView>

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

function useStyles() {
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
  }), [])
}

// ─── Export pour les tests ────────────────────────────────────────────────────

export { HomeScreenBase as HomeContent }

// ─── withObservables ──────────────────────────────────────────────────────────

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
    Q.where('created_at', Q.gte(Date.now() - NINETY_DAYS_MS)),
  ).observe(),
  sessions: database.get<Session>('sessions').query().observe(),
  userBadges: database.get<UserBadge>('user_badges').query().observe(),
  exercises: database.get<Exercise>('exercises').query().observe(),
  programs: database.get<Program>('programs').query().observe(),
  sleepRecords: database.get<SleepRecordModel>('sleep_records').query(
    Q.where('date', Q.gte(Date.now() - NINETY_DAYS_MS)),
    Q.sortBy('date', Q.desc),
  ).observe(),
  dailyVitals: database.get<DailyVitalsModel>('daily_vitals').query(
    Q.where('date', Q.gte(Date.now() - NINETY_DAYS_MS)),
    Q.sortBy('date', Q.desc),
  ).observe(),
}))

const Enhanced = enhance(HomeScreenBase)

/**
 * Deferred wrapper — mounts the withObservables component only after the
 * wrapper itself has mounted, preventing the "setState before mount" warning
 * caused by WatermelonDB's synchronous first emission on React 18 + Fabric.
 */
function HomeScreen(props: Record<string, unknown>) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])
  if (!ready) return null
  return <Enhanced {...props} />
}

export default HomeScreen
