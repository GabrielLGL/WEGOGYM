import React, { useEffect, useRef, useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  BackHandler,
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
} from '../model/utils/databaseHelpers'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { useWorkoutState } from '../hooks/useWorkoutState'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { WorkoutHeader } from '../components/WorkoutHeader'
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard'
import { WorkoutSummarySheet } from '../components/WorkoutSummarySheet'
import { AlertDialog } from '../components/AlertDialog'
import RestTimer from '../components/RestTimer'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { colors, spacing, fontSize, borderRadius } from '../theme'
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

const WorkoutContent: React.FC<WorkoutContentProps> = ({
  session,
  sessionExercises,
  user,
  navigation,
}) => {
  const startTimestampRef = useRef<number>(Date.now())
  const historyRef = useRef<History | null>(null)
  const notificationPermissionRef = useRef<boolean>(false)
  const summaryWasOpenRef = useRef(false)

  const [historyId, setHistoryId] = useState<string>('')
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [confirmEndVisible, setConfirmEndVisible] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [abandonVisible, setAbandonVisible] = useState(false)
  const [durationSeconds, setDurationSeconds] = useState(0)

  const haptics = useHaptics()
  const { formattedTime } = useWorkoutTimer(startTimestampRef.current)
  const { setInputs, validatedSets, totalVolume, updateSetInput, validateSet } =
    useWorkoutState(sessionExercises, historyId)

  useMultiModalSync([confirmEndVisible, summaryVisible, abandonVisible])

  // Navigue vers Home quand le résumé se ferme (quelle que soit la source : bouton, retour, overlay)
  useEffect(() => {
    if (summaryVisible) {
      summaryWasOpenRef.current = true
    } else if (summaryWasOpenRef.current) {
      summaryWasOpenRef.current = false
      navigation.navigate('MainTabs', { screen: 'Home' })
    }
  }, [summaryVisible, navigation])

  const totalSets = Object.keys(validatedSets).length
  const totalPrs = Object.values(validatedSets).filter(s => s.isPr).length

  useLayoutEffect(() => {
    navigation.setOptions({
      title: session.name,
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    })
  }, [navigation, session.name])

  useEffect(() => {
    createWorkoutHistory(session.id, startTimestampRef.current)
      .then(history => {
        historyRef.current = history
        setHistoryId(history.id)
      })
      .catch(e => { if (__DEV__) console.error('[WorkoutScreen] createWorkoutHistory:', e) })
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
    // La navigation vers Home est gérée par le useEffect ci-dessus
  }

  const handleConfirmEnd = async () => {
    const now = Date.now()
    setDurationSeconds(Math.floor((now - startTimestampRef.current) / 1000))
    if (historyId) {
      await completeWorkoutHistory(historyId, now).catch(console.error)
    }
    setConfirmEndVisible(false)
    setSummaryVisible(true)
    haptics.onMajorSuccess()
  }

  const handleConfirmAbandon = async () => {
    if (historyId) {
      await completeWorkoutHistory(historyId, Date.now()).catch(console.error)
    }
    setAbandonVisible(false)
    navigation.navigate('MainTabs', { screen: 'Home' })
  }

  const handleValidateSet = async (
    sessionExercise: SessionExercise,
    setOrder: number
  ) => {
    const success = await validateSet(sessionExercise, setOrder)
    if (success && user?.timerEnabled) {
      setShowRestTimer(true)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <WorkoutHeader formattedTime={formattedTime} totalVolume={totalVolume} />

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
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun exercice dans cette séance.</Text>
        }
      />

      {showRestTimer && (
        <View style={styles.timerContainer}>
          <RestTimer
            duration={user?.restDuration ?? 90}
            onClose={() => setShowRestTimer(false)}
            notificationEnabled={notificationPermissionRef.current}
          />
        </View>
      )}

      {/* Footer fixe - toujours visible */}
      <View style={styles.footer}>
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
      </View>

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

      {/* Resume de fin de seance */}
      <WorkoutSummarySheet
        visible={summaryVisible}
        onClose={handleClose}
        durationSeconds={durationSeconds}
        totalVolume={totalVolume}
        totalSets={totalSets}
        totalPrs={totalPrs}
        historyId={historyId}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  emptyText: {
    color: colors.placeholder,
    textAlign: 'center',
    marginTop: 50,
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
    padding: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  endButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
})

export default withObservables(['route'], ({ route }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database
    .get<SessionExercise>('session_exercises')
    .query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc))
    .observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null)),
}))(WorkoutContent)
