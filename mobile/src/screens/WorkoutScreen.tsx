import React, { useEffect, useRef, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  BackHandler,
  Animated,
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
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { useWorkoutState } from '../hooks/useWorkoutState'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { WorkoutHeader } from '../components/WorkoutHeader'
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard'
import { WorkoutSummarySheet } from '../components/WorkoutSummarySheet'
import { AlertDialog } from '../components/AlertDialog'
import RestTimer from '../components/RestTimer'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import type { RecapExerciseData, RecapComparisonData } from '../types/workout'
import {
  setupNotificationChannel,
  requestNotificationPermission,
} from '../services/notificationService'

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
  const startTimestampRef = useRef<number>(Date.now())
  const historyRef = useRef<History | null>(null)
  const notificationPermissionRef = useRef<boolean>(false)
  const summaryWasOpenRef = useRef(false)

  const [historyId, setHistoryId] = useState<string>('')
  const [showRestTimer, setShowRestTimer] = useState(false)
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

  const haptics = useHaptics()
  const footerSlide = useKeyboardAnimation(120)
  const { formattedTime } = useWorkoutTimer(startTimestampRef.current)
  const { setInputs, validatedSets, totalVolume, updateSetInput, validateSet, unvalidateSet } =
    useWorkoutState(sessionExercises, historyId)

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

  const completedSets = Object.keys(validatedSets).length
  const totalSetsTarget = sessionExercises.reduce((sum, se) => sum + (se.setsTarget ?? 0), 0)
  const totalPrs = Object.values(validatedSets).filter(s => s.isPr).length

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session.name,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    })
  }, [navigation, session.name, colors])

  useEffect(() => {
    createWorkoutHistory(session.id, startTimestampRef.current)
      .then(history => {
        historyRef.current = history
        setHistoryId(history.id)
      })
      .catch(e => {
        if (__DEV__) console.error('[WorkoutScreen] createWorkoutHistory:', e)
        setStartErrorVisible(true)
      })
  }, [])

  useEffect(() => {
    setupNotificationChannel()
      .then(() => requestNotificationPermission())
      .then(granted => {
        notificationPermissionRef.current = granted
      })
      .catch(e => { if (__DEV__) console.error('[WorkoutScreen] setupNotificationChannel:', e) })
  }, [])

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
  }, [summaryVisible])

  // --- Handlers ---

  const handleClose = () => {
    haptics.onPress()
    setSummaryVisible(false)
    // La navigation vers Home (avec célébrations) est gérée par le useEffect ci-dessus
  }

  const handleConfirmEnd = async () => {
    const now = Date.now()
    setDurationSeconds(Math.floor((now - startTimestampRef.current) / 1000))
    if (historyId) {
      await completeWorkoutHistory(historyId, now).catch(e => { if (__DEV__) console.error('[WorkoutScreen] completeWorkoutHistory (end):', e) })
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
        const weekHistories = await database
          .get<History>('histories')
          .query(
            Q.where('deleted_at', null),
            Q.where('start_time', Q.gte(weekStart)),
          )
          .fetch()
        // +1 pour inclure la seance en cours
        const weekSessionCount = weekHistories.length

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

        const allSetsRaw = await database.get<UserBadge>('sets').query().fetch() as unknown as Array<{ _raw: { exercise_id: string } }>
        const distinctExerciseCount = new Set(allSetsRaw.map(s => s._raw.exercise_id)).size

        const existingBadgeRecords = await database.get<UserBadge>('user_badges').query().fetch()
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
  }

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

  const handleConfirmAbandon = async () => {
    if (historyId) {
      await completeWorkoutHistory(historyId, Date.now()).catch(e => { if (__DEV__) console.error('[WorkoutScreen] completeWorkoutHistory (abandon):', e) })
    }
    setAbandonVisible(false)
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
  }

  const handleValidateSet = async (
    sessionExercise: SessionExercise,
    setOrder: number
  ) => {
    const success = await validateSet(sessionExercise, setOrder)
    if (success) {
      if (user?.timerEnabled) {
        setShowRestTimer(true)
      }
    } else {
      haptics.onError()
    }
  }

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
          data={sessionExercises}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <WorkoutExerciseCard
              sessionExercise={item}
              historyId={historyId}
              setInputs={setInputs}
              validatedSets={validatedSets}
              onUpdateInput={updateSetInput}
              onValidateSet={handleValidateSet}
              onUnvalidateSet={unvalidateSet}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun exercice dans cette séance.</Text>
          }
        />
      ) : (
        <View style={styles.listContent}>
          <Text style={styles.emptyText}>Chargement...</Text>
        </View>
      )}

      {showRestTimer && (
        <View style={styles.timerContainer}>
          <RestTimer
            duration={user?.restDuration ?? 90}
            onClose={() => setShowRestTimer(false)}
            notificationEnabled={notificationPermissionRef.current}
            vibrationEnabled={user?.vibrationEnabled ?? true}
            soundEnabled={user?.timerSoundEnabled ?? true}
          />
        </View>
      )}

      {/* Footer fixe - passe sous le clavier quand il est ouvert */}
      <Animated.View style={[styles.footer, { transform: [{ translateY: footerSlide }] }]}>
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => {
            haptics.onPress()
            setConfirmEndVisible(true)
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.endButtonText}>Terminer la séance</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* AlertDialog — confirmation fin de seance */}
      <AlertDialog
        visible={confirmEndVisible}
        title="Terminer la séance ?"
        message="Les séries non validées ne seront pas enregistrées."
        confirmText="Terminer"
        cancelText="Continuer"
        confirmColor={colors.primary}
        onConfirm={handleConfirmEnd}
        onCancel={() => setConfirmEndVisible(false)}
      />

      {/* AlertDialog — abandon seance (back Android) */}
      <AlertDialog
        visible={abandonVisible}
        title="Abandonner la séance ?"
        message="Les séries déjà validées seront conservées."
        confirmText="Abandonner"
        cancelText="Continuer"
        confirmColor={colors.danger}
        onConfirm={handleConfirmAbandon}
        onCancel={() => setAbandonVisible(false)}
      />

      {/* AlertDialog — erreur démarrage séance */}
      <AlertDialog
        visible={startErrorVisible}
        title="Erreur"
        message="Impossible de démarrer la séance. Veuillez réessayer."
        confirmText="OK"
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
    endButton: {
      backgroundColor: colors.success,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    endButtonText: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: fontSize.md,
    },
  })
}

export default withObservables(['route'], ({ route }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database
    .get<SessionExercise>('session_exercises')
    .query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc))
    .observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(WorkoutContent)
