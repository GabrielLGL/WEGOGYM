import React, { useEffect, useRef, useLayoutEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  BackHandler,
  Animated,
  Platform,
} from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import { map } from 'rxjs/operators'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import User from '../model/models/User'
import History from '../model/models/History'
import {
  createWorkoutHistory,
  completeWorkoutHistory,
  buildRecapExercises,
  getLastSessionVolume,
} from '../model/utils/databaseHelpers'
import {
  calculateSessionXP,
  calculateSessionTonnage,
  calculateLevel,
  updateStreak,
  getCurrentISOWeek,
  detectMilestones,
  type MilestoneEvent,
} from '../model/utils/gamificationHelpers'
import { checkBadges, type CheckBadgesParams } from '../model/utils/badgeHelpers'
import { type BadgeDefinition } from '../model/utils/badgeConstants'
import UserBadge from '../model/models/UserBadge'
import SetModel from '../model/models/Set'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { useWorkoutState } from '../hooks/useWorkoutState'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { WorkoutHeader } from '../components/WorkoutHeader'
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard'
import { WorkoutSummarySheet } from '../components/WorkoutSummarySheet'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import RestTimer from '../components/RestTimer'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { RecapExerciseData, RecapComparisonData } from '../types/workout'
import {
  setupNotificationChannel,
  requestNotificationPermission,
} from '../services/notificationService'

type WorkoutListItem =
  | { type: 'exercise'; data: SessionExercise; supersetId: string | null }
  | { type: 'supersetHeader'; supersetId: string; supersetType: string; count: number }

function buildWorkoutList(sessionExercises: SessionExercise[]): WorkoutListItem[] {
  const result: WorkoutListItem[] = []
  const seenGroups = new Set<string>()

  for (const se of sessionExercises) {
    const groupId = se.supersetId
    if (groupId && !seenGroups.has(groupId)) {
      seenGroups.add(groupId)
      const groupMembers = sessionExercises.filter(s => s.supersetId === groupId)
      result.push({
        type: 'supersetHeader',
        supersetId: groupId,
        supersetType: se.supersetType ?? 'superset',
        count: groupMembers.length,
      })
    }
    result.push({ type: 'exercise', data: se, supersetId: groupId ?? null })
  }
  return result
}

interface WorkoutContentProps {
  session: Session
  sessionExercises: SessionExercise[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList>
}

export const WorkoutContent: React.FC<WorkoutContentProps> = ({
  session,
  sessionExercises,
  user,
  navigation,
}) => {
  const colors = useColors()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const startTimestampRef = useRef<number>(Date.now())
  const historyRef = useRef<History | null>(null)
  const notificationPermissionRef = useRef<boolean>(false)
  const summaryWasOpenRef = useRef(false)

  const [historyId, setHistoryId] = useState<string>('')
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [currentRestDuration, setCurrentRestDuration] = useState(user?.restDuration ?? 90)
  const [confirmEndVisible, setConfirmEndVisible] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [abandonVisible, setAbandonVisible] = useState(false)
  const [startErrorVisible, setStartErrorVisible] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [milestones, setMilestones] = useState<MilestoneEvent[]>([])
  const [newBadges, setNewBadges] = useState<BadgeDefinition[]>([])
  const [sessionXPGained, setSessionXPGained] = useState(0)
  const [newLevelResult, setNewLevelResult] = useState(1)
  const [newStreakResult, setNewStreakResult] = useState(0)
  const [recapExercises, setRecapExercises] = useState<RecapExerciseData[]>([])
  const [recapComparison, setRecapComparison] = useState<RecapComparisonData>({
    prevVolume: null,
    currVolume: 0,
    volumeGain: 0,
  })

  const isMountedRef = useRef(true)
  useEffect(() => () => { isMountedRef.current = false }, [])

  const haptics = useHaptics()
  const footerSlide = useKeyboardAnimation(120)
  const { formattedTime } = useWorkoutTimer(startTimestampRef.current)
  const { setInputs, validatedSets, totalVolume, updateSetInput, validateSet, unvalidateSet } =
    useWorkoutState(sessionExercises, historyId)

  const workoutList = useMemo(() => buildWorkoutList(sessionExercises), [sessionExercises])

  // Quand le résumé se ferme : naviguer vers Home avec les célébrations en params
  useEffect(() => {
    if (summaryVisible) {
      summaryWasOpenRef.current = true
    } else if (summaryWasOpenRef.current) {
      summaryWasOpenRef.current = false
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Home',
          params: { celebrations: milestones.length > 0 || newBadges.length > 0
            ? { milestones, badges: newBadges }
            : undefined
          },
        }],
      })
    }
  }, [summaryVisible, navigation, milestones, newBadges])

  const completedSets = useMemo(() => Object.keys(validatedSets).length, [validatedSets])
  const totalSetsTarget = useMemo(() => sessionExercises.reduce((sum, se) => sum + (se.setsTarget ?? 0), 0), [sessionExercises])
  const totalPrs = useMemo(() => Object.values(validatedSets).filter(s => s.isPr).length, [validatedSets])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session.name,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    })
  }, [navigation, session.name, colors])

  useEffect(() => {
    let cancelled = false
    createWorkoutHistory(session.id, startTimestampRef.current)
      .then(history => {
        if (cancelled) return
        historyRef.current = history
        setHistoryId(history.id)
      })
      .catch(e => {
        if (cancelled) return
        if (__DEV__) console.error('[WorkoutScreen] createWorkoutHistory:', e)
        setStartErrorVisible(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setupNotificationChannel()
      .then(() => requestNotificationPermission())
      .then(granted => {
        notificationPermissionRef.current = granted
      })
      .catch(e => { if (__DEV__) console.error('[WorkoutScreen] setupNotificationChannel:', e) })
  }, [])

  // --- Handlers ---

  const handleClose = useCallback(() => {
    haptics.onPress()
    setSummaryVisible(false)
    // La navigation vers Home (avec célébrations) est gérée par le useEffect ci-dessus
  }, [haptics])

  // Back handler Android : prioritaire sur le GlobalBackHandler (LIFO)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (summaryVisible) {
        handleClose()
        return true
      }
      setAbandonVisible(true)
      return true
    })
    return () => backHandler.remove()
  }, [summaryVisible, handleClose])

  const handleConfirmEnd = useCallback(async () => {
    const now = Date.now()
    setDurationSeconds(Math.floor((now - startTimestampRef.current) / 1000))
    const activeHistoryId = historyRef.current?.id || historyId
    if (activeHistoryId) {
      await completeWorkoutHistory(activeHistoryId, now).catch(e => { if (__DEV__) console.error('[WorkoutScreen] completeWorkoutHistory (end):', e) })
    }

    // ── Gamification ──
    if (user && completedSets > 0) {
      try {
        const setsArray = Object.values(validatedSets).map(s => ({
          weight: s.weight,
          reps: s.reps,
        }))
        const sessionTonnage = calculateSessionTonnage(setsArray)
        const isComplete = completedSets >= totalSetsTarget
        const sessionXP = calculateSessionXP(totalPrs, isComplete)
        const newTotalXp = (user.totalXp || 0) + sessionXP
        const newLevel = calculateLevel(newTotalXp)
        const newTotalTonnage = (user.totalTonnage || 0) + sessionTonnage

        // Streak : compter les seances de la semaine courante
        const currentWeek = getCurrentISOWeek()
        const weekStart = getWeekStartTimestamp(currentWeek)
        const weekSessionCount = await database
          .get<History>('histories')
          .query(
            Q.where('deleted_at', null),
            Q.where('start_time', Q.gte(weekStart)),
          )
          .fetchCount()
        if (!isMountedRef.current) return

        const streakResult = updateStreak(
          user.lastWorkoutWeek,
          user.currentStreak || 0,
          user.bestStreak || 0,
          user.streakTarget || 3,
          weekSessionCount,
          currentWeek,
        )

        // Capture before state pour milestones
        const totalSessionCount = await getTotalSessionCount()
        const before = {
          totalSessions: totalSessionCount - 1, // -1 car la seance courante est deja comptee
          totalTonnage: user.totalTonnage || 0,
          level: user.level || 1,
        }

        // Badges — données complémentaires
        const newTotalPrs = (user.totalPrs || 0) + totalPrs
        const newBestStreak = Math.max(streakResult.bestStreak, streakResult.currentStreak)

        const distinctResult = await database.get<SetModel>('sets')
          .query(Q.unsafeSqlQuery('SELECT COUNT(DISTINCT exercise_id) as count FROM sets'))
          .unsafeFetchRaw()
        const distinctExerciseCount = (distinctResult[0] as Record<string, number>)?.count ?? 0

        const existingBadgeRecords = await database.get<UserBadge>('user_badges').query().fetch()
        if (!isMountedRef.current) return
        const existingBadgeIds = existingBadgeRecords.map(b => b.badgeId)

        const badgeParams: CheckBadgesParams = {
          user: {
            totalTonnage: newTotalTonnage,
            bestStreak: newBestStreak,
            level: newLevel,
            totalPrs: newTotalPrs,
          },
          existingBadgeIds,
          sessionCount: totalSessionCount,
          sessionVolume: sessionTonnage,
          distinctExerciseCount,
        }
        const detectedBadges = checkBadges(badgeParams)

        await database.write(async () => {
          await user.update(u => {
            u.totalXp = newTotalXp
            u.level = newLevel
            u.totalTonnage = newTotalTonnage
            u.currentStreak = streakResult.currentStreak
            u.bestStreak = streakResult.bestStreak
            u.lastWorkoutWeek = streakResult.lastWorkoutWeek
            u.totalPrs = newTotalPrs
          })
          for (const badge of detectedBadges) {
            await database.get<UserBadge>('user_badges').create(record => {
              record.badgeId = badge.id
              record.unlockedAt = new Date()
            })
          }
        })
        if (!isMountedRef.current) return

        setSessionXPGained(sessionXP)
        setNewLevelResult(newLevel)
        setNewStreakResult(streakResult.currentStreak)

        const after = {
          totalSessions: before.totalSessions + 1,
          totalTonnage: newTotalTonnage,
          level: newLevel,
        }
        const detected = detectMilestones(before, after)
        if (detected.length > 0) {
          setMilestones(detected)
        }
        if (detectedBadges.length > 0) {
          setNewBadges(detectedBadges)
        }
      } catch (e) {
        if (__DEV__) console.error('[WorkoutScreen] gamification update:', e)
      }
    }

    // ── Récap enrichi ──
    try {
      const recap = await buildRecapExercises(sessionExercises, validatedSets, historyId)
      const prevVol = await getLastSessionVolume(session.id, historyId)
      if (!isMountedRef.current) return
      setRecapExercises(recap)
      setRecapComparison({
        prevVolume: prevVol,
        currVolume: totalVolume,
        volumeGain: prevVol !== null ? totalVolume - prevVol : 0,
      })
    } catch (e) {
      if (__DEV__) console.error('[WorkoutScreen] buildRecapExercises:', e)
    }

    setConfirmEndVisible(false)
    setSummaryVisible(true)
    haptics.onMajorSuccess()
  }, [historyId, user, completedSets, totalSetsTarget, totalPrs, validatedSets, sessionExercises, session.id, totalVolume, haptics])

  /** Nombre total de seances (histories non supprimees). */
  async function getTotalSessionCount(): Promise<number> {
    const count = await database
      .get<History>('histories')
      .query(Q.where('deleted_at', null))
      .fetchCount()
    return count
  }

  /** Timestamp du debut de la semaine ISO. */
  function getWeekStartTimestamp(isoWeek: string): number {
    const [yearStr, weekStr] = isoWeek.split('-W')
    const year = parseInt(yearStr, 10)
    const week = parseInt(weekStr, 10)
    // 4 janvier est toujours dans la semaine ISO 1
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const dayOfWeek = jan4.getUTCDay() || 7
    // Lundi de la semaine 1
    const mondayWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000)
    // Lundi de la semaine demandee
    const target = new Date(mondayWeek1.getTime() + (week - 1) * 7 * 86400000)
    return target.getTime()
  }

  const handleConfirmAbandon = useCallback(async () => {
    const activeHistoryId = historyRef.current?.id || historyId
    if (activeHistoryId) {
      await completeWorkoutHistory(activeHistoryId, Date.now()).catch(e => { if (__DEV__) console.error('[WorkoutScreen] completeWorkoutHistory (abandon):', e) })
    }
    setAbandonVisible(false)
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
  }, [historyId, navigation])

  const handleValidateSet = useCallback(async (
    sessionExercise: SessionExercise,
    setOrder: number
  ) => {
    const success = await validateSet(sessionExercise, setOrder)
    if (success) {
      const currentSupersetId = sessionExercise.supersetId
      if (currentSupersetId) {
        // In a superset: check if all OTHER exercises in the group already have this set validated
        // (the current one was just validated but setState is async, so it's not in validatedSets yet)
        const groupMembers = sessionExercises.filter(se => se.supersetId === currentSupersetId)
        const allGroupSetsDone = groupMembers.every(
          se => se.id === sessionExercise.id || validatedSets[`${se.id}_${setOrder}`]
        )
        // Show rest timer only after completing a full round of the superset
        if (user?.timerEnabled && allGroupSetsDone) {
          setCurrentRestDuration(sessionExercise.restTime ?? user?.restDuration ?? 90)
          setShowRestTimer(true)
        }
      } else {
        // Not in a superset: normal rest timer behavior
        if (user?.timerEnabled) {
          setCurrentRestDuration(sessionExercise.restTime ?? user?.restDuration ?? 90)
          setShowRestTimer(true)
        }
      }
    } else {
      haptics.onError()
    }
  }, [validateSet, sessionExercises, validatedSets, user?.timerEnabled, user?.restDuration, haptics])

  const renderWorkoutItem = useCallback(({ item: listItem }: { item: WorkoutListItem }) => {
    if (listItem.type === 'supersetHeader') {
      const label = listItem.supersetType === 'circuit'
        ? t.workout.circuitRound
        : t.workout.supersetRound
      const color = listItem.supersetType === 'circuit'
        ? colors.warning
        : colors.primary
      return (
        <View style={styles.supersetHeader}>
          <View style={[styles.supersetHeaderLine, { backgroundColor: color }]} />
          <Text style={[styles.supersetHeaderText, { color }]}>
            {label} ({listItem.count})
          </Text>
          <View style={[styles.supersetHeaderLine, { backgroundColor: color }]} />
        </View>
      )
    }
    return (
      <WorkoutExerciseCard
        sessionExercise={listItem.data}
        historyId={historyId}
        setInputs={setInputs}
        validatedSets={validatedSets}
        onUpdateInput={updateSetInput}
        onValidateSet={handleValidateSet}
        onUnvalidateSet={unvalidateSet}
      />
    )
  }, [t, colors, styles, historyId, setInputs, validatedSets, updateSetInput, handleValidateSet, unvalidateSet])

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutHeader
        formattedTime={formattedTime}
        totalVolume={totalVolume}
        completedSets={completedSets}
        totalSetsTarget={totalSetsTarget}
      />

      {historyId ? (
        <FlatList
          data={workoutList}
          keyExtractor={(item, index) =>
            item.type === 'supersetHeader'
              ? `header_${item.supersetId}`
              : `exercise_${item.data.id}`
          }
          keyboardShouldPersistTaps="handled"
          renderItem={renderWorkoutItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t.workout.noExercises}</Text>
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      ) : (
        <View style={styles.listContent}>
          <Text style={styles.emptyText}>{t.workout.loading}</Text>
        </View>
      )}

      {showRestTimer && (
        <View style={styles.timerContainer}>
          <RestTimer
            duration={currentRestDuration}
            onClose={() => setShowRestTimer(false)}
            notificationEnabled={notificationPermissionRef.current}
            vibrationEnabled={user?.vibrationEnabled ?? true}
            soundEnabled={user?.timerSoundEnabled ?? true}
          />
        </View>
      )}

      {/* Footer fixe - passe sous le clavier quand il est ouvert */}
      <Animated.View style={[styles.footer, { transform: [{ translateY: footerSlide }] }]}>
        <Button variant="primary" onPress={() => setConfirmEndVisible(true)}>
          {t.workout.finishButton}
        </Button>
      </Animated.View>

      {/* AlertDialog — confirmation fin de seance */}
      <AlertDialog
        visible={confirmEndVisible}
        title={t.workout.finishTitle}
        message={t.workout.finishMessage}
        confirmText={t.workout.finishConfirm}
        cancelText={t.workout.continueLabel}
        confirmColor={colors.primary}
        onConfirm={handleConfirmEnd}
        onCancel={() => setConfirmEndVisible(false)}
      />

      {/* AlertDialog — abandon seance (back Android) */}
      <AlertDialog
        visible={abandonVisible}
        title={t.workout.abandonTitle}
        message={t.workout.abandonMessage}
        confirmText={t.workout.abandonConfirm}
        cancelText={t.workout.continueLabel}
        confirmColor={colors.danger}
        onConfirm={handleConfirmAbandon}
        onCancel={() => setAbandonVisible(false)}
      />

      {/* AlertDialog — erreur démarrage séance */}
      <AlertDialog
        visible={startErrorVisible}
        title={t.workout.errorTitle}
        message={t.workout.errorMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => { setStartErrorVisible(false); navigation.goBack() }}
        onCancel={() => { setStartErrorVisible(false); navigation.goBack() }}
        hideCancel
      />

      {/* Resume de fin de seance */}
      <WorkoutSummarySheet
        visible={summaryVisible}
        onClose={handleClose}
        durationSeconds={durationSeconds}
        totalVolume={totalVolume}
        totalSets={completedSets}
        totalPrs={totalPrs}
        historyId={historyId}
        xpGained={sessionXPGained}
        level={newLevelResult}
        currentStreak={newStreakResult}
        recapExercises={recapExercises}
        recapComparison={recapComparison}
      />

    </SafeAreaView>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 120, // extra space for floating footer + timer
    },
    emptyText: {
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: spacing.xxl,
      fontSize: fontSize.md,
      fontStyle: 'italic',
    },
    timerContainer: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
    },
    footer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.card,
      backgroundColor: colors.background,
    },
    supersetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    supersetHeaderLine: {
      flex: 1,
      height: 1,
    },
    supersetHeaderText: {
      fontSize: fontSize.xs,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  })
}

const ObservableWorkoutContent = withObservables(['route'], ({ route }: { route: RouteProp<RootStackParamList, 'Workout'> }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database
    .get<SessionExercise>('session_exercises')
    .query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc))
    .observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(WorkoutContent)

const WorkoutScreen = ({ route, navigation }: {
  route: RouteProp<RootStackParamList, 'Workout'>
  navigation: NativeStackNavigationProp<RootStackParamList>
}) => {
  const colors = useColors()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableWorkoutContent route={route} navigation={navigation} />}
    </View>
  )
}

export default WorkoutScreen
