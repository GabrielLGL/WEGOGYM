/**
 * WorkoutScreen — Écran de séance d'entraînement en direct
 *
 * Flux principal :
 * 1. Création d'un History au mount (createWorkoutHistory)
 * 2. Timer global + timer de repos entre séries
 * 3. Validation de chaque série → saveWorkoutSet + détection PR
 * 4. Gestion des supersets/circuits (WorkoutSupersetBlock)
 * 5. Fin de séance → useWorkoutCompletion (XP, badges, streak, récap)
 * 6. Affichage du récapitulatif (WorkoutSummarySheet)
 *
 * State management :
 * - useWorkoutState : état local des séries (poids, reps, validation)
 * - useWorkoutTimer : chrono global et timer de repos
 * - useWorkoutCompletion : orchestration fin de séance + gamification
 *
 * Données : Session + SessionExercises via withObservables, User pour la gamification
 */

import React, { useEffect, useRef, useLayoutEffect, useState, useMemo, useCallback } from 'react'
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler'
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
import { observeCurrentUser } from '../model/utils/databaseHelpers'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import User from '../model/models/User'
import History from '../model/models/History'
import {
  createWorkoutHistory,
  abandonWorkoutHistory,
} from '../model/utils/databaseHelpers'
import { computeTrainingDensity, type DensityResult } from '../model/utils/trainingDensityHelpers'
import { getLastSessionDensity } from '../model/utils/workoutSessionUtils'
import { type MilestoneEvent } from '../model/utils/gamificationHelpers'
import { type BadgeDefinition } from '../model/utils/badgeConstants'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { useWorkoutState } from '../hooks/useWorkoutState'
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { useWorkoutCompletion } from '../hooks/useWorkoutCompletion'
import { useDeferredMount } from '../hooks/useDeferredMount'
import { WorkoutHeader } from '../components/WorkoutHeader'
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard'
import { WorkoutSupersetBlock } from '../components/WorkoutSupersetBlock'
import { WorkoutSummarySheet } from '../components/WorkoutSummarySheet'
import { WarmupChecklistSheet } from '../components/WarmupChecklistSheet'
import { AlertDialog } from '../components/AlertDialog'
import { Button } from '../components/Button'
import RestTimer from '../components/RestTimer'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, fontSize, borderRadius } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import type { RecapExerciseData, RecapComparisonData } from '../types/workout'
import {
  setupNotificationChannel,
  requestNotificationPermission,
} from '../services/notificationService'

const KEYBOARD_OFFSET = 120
const FOOTER_BOTTOM_PADDING = 120
const TIMER_BOTTOM_OFFSET = 80

type WorkoutListItem =
  | { type: 'exercise'; data: SessionExercise }
  | { type: 'supersetBlock'; supersetId: string; supersetType: string; exercises: SessionExercise[] }

function buildWorkoutList(sessionExercises: SessionExercise[]): WorkoutListItem[] {
  const result: WorkoutListItem[] = []
  const seenGroups = new Set<string>()

  for (const se of sessionExercises) {
    const groupId = se.supersetId
    if (groupId) {
      if (!seenGroups.has(groupId)) {
        seenGroups.add(groupId)
        const groupMembers = sessionExercises.filter(s => s.supersetId === groupId)
        result.push({
          type: 'supersetBlock',
          supersetId: groupId,
          supersetType: se.supersetType ?? 'superset',
          exercises: groupMembers,
        })
      }
      // Skip individual exercises that are part of a group — they're in the block
    } else {
      result.push({ type: 'exercise', data: se })
    }
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
  const warmupModal = useModalState()
  const warmupOpenRef = useRef(warmupModal.open)
  warmupOpenRef.current = warmupModal.open
  const restTimerModal = useModalState()
  const [currentRestDuration, setCurrentRestDuration] = useState(user?.restDuration ?? 90)
  const confirmEndModal = useModalState()
  const summaryModal = useModalState()
  const abandonModal = useModalState()
  const startErrorModal = useModalState()
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
  const footerSlide = useKeyboardAnimation(KEYBOARD_OFFSET)
  const { formattedTime } = useWorkoutTimer(startTimestampRef.current)
  const { setInputs, validatedSets, totalVolume, suggestedExerciseIds, updateSetInput, validateSet, unvalidateSet } =
    useWorkoutState(sessionExercises, historyId)

  const completedSets = useMemo(() => Object.keys(validatedSets).length, [validatedSets])
  const totalSetsTarget = useMemo(() => sessionExercises.reduce((sum, se) => sum + (se.setsTarget ?? 0), 0), [sessionExercises])
  const totalPrs = useMemo(() => Object.values(validatedSets).filter(s => s.isPr).length, [validatedSets])

  // --- Training density ---
  const [prevDensityData, setPrevDensityData] = useState<{
    sets: Array<{ weight: number; reps: number }>
    durationMinutes: number
  } | null>(null)

  useEffect(() => {
    if (!historyId || !session.id) return
    let cancelled = false
    getLastSessionDensity(session.id, historyId).then(data => {
      if (!cancelled && data) {
        setPrevDensityData({ sets: data.sets, durationMinutes: data.durationMinutes })
      }
    })
    return () => { cancelled = true }
  }, [historyId, session.id])

  const densityData = useMemo<DensityResult | null>(() => {
    const sets = Object.values(validatedSets).map(s => ({ weight: s.weight, reps: s.reps }))
    if (sets.length === 0) return null
    return computeTrainingDensity(
      sets,
      startTimestampRef.current,
      prevDensityData?.sets,
      prevDensityData?.durationMinutes,
    )
  }, [validatedSets, prevDensityData])

  const { completeWorkout } = useWorkoutCompletion({
    historyId,
    historyRef,
    startTimestamp: startTimestampRef.current,
    user,
    completedSets,
    totalSetsTarget,
    totalPrs,
    validatedSets,
    sessionExercises,
    sessionId: session.id,
    totalVolume,
    isMountedRef,
  })

  const [sessionMuscles, setSessionMuscles] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const fetchMuscles = async () => {
      const allMuscles = new Set<string>()
      for (const se of sessionExercises) {
        try {
          const exercise = await se.exercise.fetch()
          if (exercise) {
            exercise.muscles.forEach((m: string) => allMuscles.add(m))
          }
        } catch {
          // Skip if exercise can't be fetched
        }
      }
      if (!cancelled) setSessionMuscles(Array.from(allMuscles))
    }
    fetchMuscles()
    return () => { cancelled = true }
  }, [sessionExercises])

  const workoutList = useMemo(() => buildWorkoutList(sessionExercises), [sessionExercises])

  // Quand le résumé se ferme : naviguer vers Home avec les célébrations en params
  useEffect(() => {
    if (summaryModal.isOpen) {
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
  }, [summaryModal.isOpen, navigation, milestones, newBadges])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session.name,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerRight: () => (
        <GHTouchableOpacity
          style={{ marginRight: spacing.sm }}
          onPress={() => { haptics.onPress(); warmupOpenRef.current() }}
        >
          <Ionicons name="body-outline" size={22} color={colors.primary} />
        </GHTouchableOpacity>
      ),
    })
  }, [navigation, session.name, colors, haptics])

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
        startErrorModal.open()
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
    summaryModal.close()
    // La navigation vers Home (avec célébrations) est gérée par le useEffect ci-dessus
  }, [haptics, summaryModal])

  // Back handler Android : prioritaire sur le GlobalBackHandler (LIFO)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (summaryModal.isOpen) {
        handleClose()
        return true
      }
      abandonModal.open()
      return true
    })
    return () => backHandler.remove()
  }, [summaryModal.isOpen, handleClose])

  const handleConfirmEnd = useCallback(async () => {
    try {
      const result = await completeWorkout()
      if (!result) return

      setDurationSeconds(result.durationSeconds)
      setSessionXPGained(result.sessionXPGained)
      setNewLevelResult(result.newLevel)
      setNewStreakResult(result.newStreak)
      setRecapExercises(result.recapExercises)
      setRecapComparison(result.recapComparison)
      if (result.milestones.length > 0) setMilestones(result.milestones)
      if (result.newBadges.length > 0) setNewBadges(result.newBadges)

      confirmEndModal.close()
      summaryModal.open()
      haptics.onMajorSuccess()
    } catch (e) {
      if (__DEV__) console.error('[WorkoutScreen] handleConfirmEnd failed:', e)
      confirmEndModal.close()
    }
  }, [completeWorkout, haptics])

  const handleConfirmAbandon = useCallback(async () => {
    const activeHistoryId = historyRef.current?.id || historyId
    if (activeHistoryId) {
      await abandonWorkoutHistory(activeHistoryId, Date.now()).catch(e => { if (__DEV__) console.error('[WorkoutScreen] abandonWorkoutHistory:', e) })
    }
    abandonModal.close()
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
          restTimerModal.open()
        }
      } else {
        // Not in a superset: normal rest timer behavior
        if (user?.timerEnabled) {
          setCurrentRestDuration(sessionExercise.restTime ?? user?.restDuration ?? 90)
          restTimerModal.open()
        }
      }
    } else {
      haptics.onError()
    }
  }, [validateSet, sessionExercises, validatedSets, user?.timerEnabled, user?.restDuration, haptics])

  const renderWorkoutItem = useCallback(({ item: listItem }: { item: WorkoutListItem }) => {
    if (listItem.type === 'supersetBlock') {
      return (
        <WorkoutSupersetBlock
          sessionExercises={listItem.exercises}
          supersetType={listItem.supersetType}
          historyId={historyId}
          setInputs={setInputs}
          validatedSets={validatedSets}
          onUpdateInput={updateSetInput}
          onValidateSet={handleValidateSet}
          onUnvalidateSet={unvalidateSet}
          suggestedExerciseIds={suggestedExerciseIds}
        />
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
        isProgressionApplied={suggestedExerciseIds.has(listItem.data.exercise.id)}
      />
    )
  }, [historyId, setInputs, validatedSets, updateSetInput, handleValidateSet, unvalidateSet, suggestedExerciseIds])

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutHeader
        formattedTime={formattedTime}
        totalVolume={totalVolume}
        completedSets={completedSets}
        totalSetsTarget={totalSetsTarget}
      />

      {densityData && densityData.totalVolume > 0 && (
        <View style={styles.densityBadge}>
          <Text style={styles.densityValue}>{densityData.pace}</Text>
          {densityData.comparison && (
            <Text style={[styles.densityComparison, {
              color: densityData.comparison === 'faster' ? colors.success
                : densityData.comparison === 'slower' ? colors.danger
                : colors.textSecondary
            }]}>
              {densityData.comparison === 'faster' ? '↑' : densityData.comparison === 'slower' ? '↓' : '→'}
            </Text>
          )}
        </View>
      )}

      {historyId ? (
        <FlatList
          data={workoutList}
          keyExtractor={(item) =>
            item.type === 'supersetBlock'
              ? `block_${item.supersetId}`
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

      {restTimerModal.isOpen && (
        <View style={styles.timerContainer}>
          <RestTimer
            duration={currentRestDuration}
            onClose={restTimerModal.close}
            notificationEnabled={notificationPermissionRef.current}
            vibrationEnabled={user?.vibrationEnabled ?? true}
            soundEnabled={user?.timerSoundEnabled ?? true}
          />
        </View>
      )}

      {/* Footer fixe - passe sous le clavier quand il est ouvert */}
      <Animated.View style={[styles.footer, { transform: [{ translateY: footerSlide }] }]}>
        <Button variant="primary" onPress={() => confirmEndModal.open()}>
          {t.workout.finishButton}
        </Button>
      </Animated.View>

      {/* AlertDialog — confirmation fin de seance */}
      <AlertDialog
        visible={confirmEndModal.isOpen}
        title={t.workout.finishTitle}
        message={t.workout.finishMessage}
        confirmText={t.workout.finishConfirm}
        cancelText={t.workout.continueLabel}
        confirmColor={colors.primary}
        onConfirm={handleConfirmEnd}
        onCancel={confirmEndModal.close}
      />

      {/* AlertDialog — abandon seance (back Android) */}
      <AlertDialog
        visible={abandonModal.isOpen}
        title={t.workout.abandonTitle}
        message={t.workout.abandonMessage}
        confirmText={t.workout.abandonConfirm}
        cancelText={t.workout.continueLabel}
        confirmColor={colors.danger}
        onConfirm={handleConfirmAbandon}
        onCancel={abandonModal.close}
      />

      {/* AlertDialog — erreur démarrage séance */}
      <AlertDialog
        visible={startErrorModal.isOpen}
        title={t.workout.errorTitle}
        message={t.workout.errorMessage}
        confirmText={t.common.ok}
        confirmColor={colors.primary}
        onConfirm={() => { startErrorModal.close(); navigation.goBack() }}
        onCancel={() => { startErrorModal.close(); navigation.goBack() }}
        hideCancel
      />

      {/* Checklist échauffement */}
      <WarmupChecklistSheet
        visible={warmupModal.isOpen}
        onClose={warmupModal.close}
        muscles={sessionMuscles}
      />

      {/* Resume de fin de seance */}
      <WorkoutSummarySheet
        visible={summaryModal.isOpen}
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
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: FOOTER_BOTTOM_PADDING, // extra space for floating footer + timer
    },
    emptyText: {
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: spacing.xxl,
      fontSize: fontSize.md,
      fontStyle: 'italic',
    },
    densityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      alignSelf: 'center',
      marginBottom: spacing.xs,
    },
    densityValue: {
      fontSize: fontSize.caption,
      fontWeight: '600',
      color: colors.text,
    },
    densityComparison: {
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    timerContainer: {
      position: 'absolute',
      bottom: TIMER_BOTTOM_OFFSET,
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
  }), [colors])
}

const ObservableWorkoutContent = withObservables(['route'], ({ route }: { route: RouteProp<RootStackParamList, 'Workout'> }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database
    .get<SessionExercise>('session_exercises')
    .query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc))
    .observe(),
  user: observeCurrentUser(),
}))(WorkoutContent)

const WorkoutScreen = ({ route, navigation }: {
  route: RouteProp<RootStackParamList, 'Workout'>
  navigation: NativeStackNavigationProp<RootStackParamList>
}) => {
  const colors = useColors()
  const mounted = useDeferredMount()
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {mounted && <ObservableWorkoutContent route={route} navigation={navigation} />}
    </View>
  )
}

export default WorkoutScreen
