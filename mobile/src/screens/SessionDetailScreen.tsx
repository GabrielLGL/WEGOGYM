import React, { useState, useEffect, useLayoutEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { database } from '../model/index'
import { Q } from '@nozbe/watermelondb'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import User from '../model/models/User'
import RestTimer from '../components/RestTimer'
import { SessionExerciseItem } from '../components/SessionExerciseItem'
import { ExerciseTargetInputs } from '../components/ExerciseTargetInputs'
import { ExercisePickerModal } from '../components/ExercisePickerModal'
import { map } from 'rxjs/operators'
import { CustomModal } from '../components/CustomModal'
import { AlertDialog } from '../components/AlertDialog'
import { useHaptics } from '../hooks/useHaptics'
import { useMultiModalSync } from '../hooks/useModalState'
import { useSessionManager } from '../hooks/useSessionManager'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { colors } from '../theme'

interface Props {
  session: Session
  sessionExercises: SessionExercise[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList>
}

const SessionDetailContent: React.FC<Props> = ({ session, sessionExercises, user, navigation }) => {
  // --- HOOKS ---
  const haptics = useHaptics()
  const {
    // Target inputs states
    targetSets,
    setTargetSets,
    targetReps,
    setTargetReps,
    targetWeight,
    setTargetWeight,
    isFormValid,
    // Selected exercise
    selectedSessionExercise,
    setSelectedSessionExercise,
    // Operations
    addExercise,
    updateTargets,
    removeExercise,
    prepareEditTargets,
    resetTargets,
  } = useSessionManager(session, haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [exercisesList, setExercisesList] = useState<Exercise[]>([])
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void | Promise<void>
  }>({ title: '', message: '', onConfirm: async () => {} })
  const [showRestTimer, setShowRestTimer] = useState(false)

  // --- SYNCHRONISATION TAB BAR ---
  useMultiModalSync([isAddModalVisible, isEditModalVisible, isAlertVisible])

  useLayoutEffect(() => { navigation.setOptions({ title: session.name, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }) }, [navigation, session.name])

  useEffect(() => {
    const loadExos = async () => {
      try {
        const list = await database.get<Exercise>('exercises')
          .query(Q.sortBy('name', Q.asc))
          .fetch()
        setExercisesList(list)
      } catch (error) {
        console.error('Failed to load exercises:', error)
        setExercisesList([]) // Fallback to empty list
      }
    }
    loadExos()
  }, [isAddModalVisible])

  // --- HANDLERS ---
  const handleAddExercise = async (exerciseId: string, sets: string, reps: string, weight: string) => {
    const exo = exercisesList.find(e => e.id === exerciseId)
    if (!exo) return

    const success = await addExercise(exerciseId, sets, reps, weight, exo)
    if (success) {
      setIsAddModalVisible(false)
      if (user?.timerEnabled) setShowRestTimer(true)
    }
  }

  const handleUpdateTargets = async () => {
    const success = await updateTargets()
    if (success) {
      setIsEditModalVisible(false)
      if (user?.timerEnabled) setShowRestTimer(true)
    }
  }

  const showRemoveAlert = (se: SessionExercise, exoName: string) => {
    setAlertConfig({
      title: `Supprimer ${exoName} ?`,
      message: "Voulez-vous vraiment retirer cet exercice de cette séance ?",
      onConfirm: async () => {
        await removeExercise(se)
      }
    })
    setIsAlertVisible(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listWrapper}>
        <FlatList
          data={sessionExercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SessionExerciseItem
              item={item}
              onEditTargets={(se: SessionExercise) => {
                haptics.onPress()
                setShowRestTimer(false)
                prepareEditTargets(se)
                setIsEditModalVisible(true)
              }}
              onRemove={(se: SessionExercise, exoName: string) => {
                haptics.onPress()
                showRemoveAlert(se, exoName)
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 10, paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Ajoutez un exercice pour commencer.</Text>}
        />
      </View>

      <View style={styles.footerContainer}>
        {showRestTimer && ( <RestTimer duration={user?.restDuration ?? 90} onClose={() => setShowRestTimer(false)} /> )}
        <TouchableOpacity
          style={[styles.launchButton, sessionExercises.length === 0 && { opacity: 0.4 }]}
          onPress={() => {
            haptics.onPress()
            navigation.navigate('Workout', { sessionId: session.id })
          }}
          disabled={sessionExercises.length === 0}
        >
          <Text style={styles.launchButtonText}>▶ LANCER L'ENTRAINEMENT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            haptics.onPress()
            setShowRestTimer(false)
            setIsAddModalVisible(true)
          }}
        >
          <Text style={styles.addButtonText}>+ AJOUTER UN EXERCICE</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODALE AJOUT EXERCICE --- */}
      <ExercisePickerModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        exercises={exercisesList}
        onAdd={handleAddExercise}
        onHapticSelect={haptics.onSelect}
      />

      {/* --- MODALE Alerte Suppression --- */}
      <AlertDialog
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={async () => {
          await alertConfig.onConfirm()
          setIsAlertVisible(false)
        }}
        onCancel={() => setIsAlertVisible(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* --- MODALE Edition (CustomModal) --- */}
      <CustomModal
        visible={isEditModalVisible}
        title="Modifier l'objectif"
        onClose={() => setIsEditModalVisible(false)}
        buttons={
            <>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.cancelBtn}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleUpdateTargets} style={[styles.confirmBtn, !isFormValid && { opacity: 0.3 }]} disabled={!isFormValid}><Text style={styles.btnText}>Enregistrer</Text></TouchableOpacity>
            </>
        }
      >
        <ExerciseTargetInputs
          sets={targetSets}
          reps={targetReps}
          weight={targetWeight}
          onSetsChange={setTargetSets}
          onRepsChange={setTargetReps}
          onWeightChange={setTargetWeight}
          autoFocus
        />
      </CustomModal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listWrapper: { flex: 1 },
  emptyText: { color: colors.placeholder, textAlign: 'center', marginTop: 50, fontSize: 16, fontStyle: 'italic' },

  footerContainer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.card },
  launchButton: { backgroundColor: colors.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  launchButtonText: { color: colors.text, fontWeight: 'bold', fontSize: 14 },
  addButton: { backgroundColor: colors.cardSecondary, padding: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  addButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },

  // Modal Edit Styles
  confirmBtn: { flex: 0.48, backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { flex: 0.48, backgroundColor: colors.secondaryButton, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: colors.text, fontWeight: 'bold' },
})

export default withObservables(['route'], ({ route }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database.get<SessionExercise>('session_exercises').query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null))
}))(SessionDetailContent)