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
import Program from '../model/models/Program'
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../model/utils/badgeConstants'
import { MilestoneCelebration } from '../components/MilestoneCelebration'
import { BadgeCelebration } from '../components/BadgeCelebration'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'
import { CoachMarks } from '../components/CoachMarks'
import type { CoachMarkStep } from '../components/CoachMarks'
import { useCoachMarks } from '../hooks/useCoachMarks'
import { computeExerciseOfWeek } from '../model/utils/exerciseOfWeekHelpers'
import { useModalState } from '../hooks/useModalState'
import { BottomSheet } from '../components/BottomSheet'
import { buildWidgetData, saveWidgetData } from '../services/widgetDataService'
import type { RootStackParamList } from '../navigation'

import {
  HomeHeaderCard,
  HomeGamificationCard,
  HomeStreakSection,
  HomeBodyStatusSection,
  HomeWeeklyGoalsCard,
  HomeWorkoutSection,
  HomeWeeklyActivityCard,
  HomeInsightsSection,
} from '../components/home'

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
  const styles = useStyles(colors)
  const navigation = useNavigation<HomeNavigation>()
  const route = useRoute<HomeRoute>()
  const haptics = useHaptics()
  const { t } = useLanguage()

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
    { key: 'gamification', targetRef: gamificationCardRef, text: t.coachMarks.steps.gamification, position: 'bottom' },
    { key: 'weeklyActivity', targetRef: weeklyCardRef, text: t.coachMarks.steps.weeklyActivity, position: 'bottom' },
    { key: 'programs', targetRef: trainingGridRef, text: t.coachMarks.steps.programs, position: 'top' },
    { key: 'settings', targetRef: settingsBtnRef, text: t.coachMarks.steps.settings, position: 'bottom' },
  ], [t])

  // Exercise of the Week
  const exerciseOfWeek = useMemo(
    () => computeExerciseOfWeek(exercises, sets),
    [exercises, sets],
  )
  const exerciseModal = useModalState()

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
      <HomeHeaderCard
        user={user}
        historiesCount={historiesCount}
        histories={histories}
        sets={sets}
        headerCardRef={headerCardRef}
        settingsBtnRef={settingsBtnRef}
      />

      <HomeGamificationCard
        user={user}
        userBadges={userBadges}
        sets={sets}
        exercises={exercises}
        gamificationCardRef={gamificationCardRef}
      />

      <HomeStreakSection histories={histories} />

      <HomeBodyStatusSection
        sets={sets}
        exercises={exercises}
        histories={histories}
      />

      <HomeWeeklyGoalsCard histories={histories} sets={sets} />

      <HomeWorkoutSection
        histories={histories}
        sets={sets}
        exercises={exercises}
        sessions={sessions}
        programs={programs}
      />

      <HomeWeeklyActivityCard
        histories={histories}
        sets={sets}
        sessions={sessions}
        weeklyCardRef={weeklyCardRef}
      />

      <HomeInsightsSection
        histories={histories}
        sets={sets}
        exercises={exercises}
        user={user}
      />

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

      {/* ── Tuiles Outils ── */}
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
      paddingTop: 44 + spacing.sm,
      paddingBottom: spacing.xl,
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
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

export default enhance(HomeScreenBase)
