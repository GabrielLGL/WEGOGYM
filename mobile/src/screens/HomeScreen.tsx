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
import FriendSnapshot from '../model/models/FriendSnapshot'
import Program from '../model/models/Program'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../model/utils/badgeConstants'
import { MilestoneCelebration } from '../components/MilestoneCelebration'
import { BadgeCelebration } from '../components/BadgeCelebration'
import { spacing } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { CoachMarks } from '../components/CoachMarks'
import type { CoachMarkStep } from '../components/CoachMarks'
import { useCoachMarks } from '../hooks/useCoachMarks'
import { buildWidgetData, saveWidgetData } from '../services/widgetDataService'
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
  friends: FriendSnapshot[]
  programs: Program[]
}

function HomeScreenBase({ user, histories, historiesCount, sets, sessions, userBadges, exercises, friends, programs }: Props) {
  const colors = useColors()
  const styles = useStyles()
  const navigation = useNavigation<HomeNavigation>()
  const route = useRoute<HomeRoute>()
  const { t } = useLanguage()

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
      style={{ flex: 1 }}
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
      />

      <HomeHeroAction
        histories={histories}
        sets={sets}
        exercises={exercises}
        sessions={sessions}
        programs={programs}
      />

      <HomeStatusStrip
        user={user}
        histories={histories}
        sets={sets}
        exercises={exercises}
      />

      <HomeWeeklyActivityCard
        histories={histories}
        sets={sets}
        sessions={sessions}
        weeklyCardRef={weeklyCardRef}
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
      />

      <HomeStreakSection histories={histories} />

      {/* ── ZONE C — Navigation ── */}

      <HomeNavigationGrid
        friends={friends}
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
      paddingTop: 44 + spacing.sm,
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
  friends: database.get<FriendSnapshot>('friend_snapshots').query().observe(),
  programs: database.get<Program>('programs').query().observe(),
}))

const Enhanced = enhance(HomeScreenBase)

/**
 * Deferred wrapper — mounts the withObservables component only after the
 * wrapper itself has mounted, preventing the "setState before mount" warning
 * caused by WatermelonDB's synchronous first emission on React 18 + Fabric.
 */
function HomeScreen(props: any) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])
  if (!ready) return null
  return <Enhanced {...props} />
}

export default HomeScreen
