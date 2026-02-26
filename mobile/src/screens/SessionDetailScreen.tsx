import React, { useState, useLayoutEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
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
import { useSessionManager } from '../hooks/useSessionManager'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'
import { colors, fontSize, spacing, borderRadius } from '../theme'

interface Props {
  session: Session
  sessionExercises: SessionExercise[]
  exercises: Exercise[]
  user: User | null
  navigation: NativeStackNavigationProp<RootStackParamList>
}

export const SessionDetailContent: React.FC<Props> = ({ session, sessionExercises, exercises, user, navigation }) => {
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
    reorderExercises,
  } = useSessionManager(session, haptics.onSuccess)

  // --- ÉTATS LOCAUX ---
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void | Promise<void>
  }>({ title: '', message: '', onConfirm: async () => {} })
  const [showRestTimer, setShowRestTimer] = useState(false)

  useLayoutEffect(() => { navigation.setOptions({ title: session.name, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }) }, [navigation, session.name])

  // --- HANDLERS ---
  const handleAddExercise = async (exerciseId: string, sets: string, reps: string, weight: string) => {
    const exo = exercises.find(e => e.id === exerciseId)
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
        <DraggableFlatList
          data={sessionExercises}
          keyExtractor={item => item.id}
          renderItem={({ item, drag, isActive }: RenderItemParams<SessionExercise>) => (
            <SessionExerciseItem
              item={item}
              drag={drag}
              dragActive={isActive}
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
          onDragEnd={({ data }) => reorderExercises(data)}
          contentContainerStyle={{ paddingHorizontal: 0, paddingTop: FOOTER_PADDING_TOP, paddingBottom: LIST_PADDING_BOTTOM }}
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
        exercises={exercises}
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

const SCREEN_PADDING_H = 20
const FOOTER_PADDING_BOTTOM = 30
const FOOTER_PADDING_TOP = 10
const BTN_PADDING = 18
const BTN_MARGIN_BOTTOM = 10
const LIST_PADDING_BOTTOM = 20

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listWrapper: { flex: 1 },
  emptyText: { color: colors.placeholder, textAlign: 'center', marginTop: 50, fontSize: fontSize.md, fontStyle: 'italic' },

  footerContainer: { paddingHorizontal: SCREEN_PADDING_H, paddingBottom: FOOTER_PADDING_BOTTOM, paddingTop: FOOTER_PADDING_TOP, borderTopWidth: 1, borderTopColor: colors.card },
  launchButton: { backgroundColor: colors.primary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center', marginBottom: BTN_MARGIN_BOTTOM },
  launchButtonText: { color: colors.text, fontWeight: 'bold', fontSize: fontSize.sm },
  addButton: { backgroundColor: colors.cardSecondary, padding: BTN_PADDING, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  addButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: fontSize.sm },

  // Modal Edit Styles
  confirmBtn: { flex: 0.48, backgroundColor: colors.primary, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
  cancelBtn: { flex: 0.48, backgroundColor: colors.secondaryButton, padding: spacing.ms, borderRadius: borderRadius.sm, alignItems: 'center' },
  btnText: { color: colors.text, fontWeight: 'bold' },
})

export default withObservables(['route'], ({ route }) => ({
  session: database.get<Session>('sessions').findAndObserve(route.params.sessionId),
  sessionExercises: database.get<SessionExercise>('session_exercises').query(Q.where('session_id', route.params.sessionId), Q.sortBy('position', Q.asc)).observe(),
  exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe(),
  user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null))
}))(SessionDetailContent)