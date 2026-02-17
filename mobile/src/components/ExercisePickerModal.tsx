import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { Portal } from '@gorhom/portal'
import Exercise from '../model/models/Exercise'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { ChipSelector } from './ChipSelector'
import { ExerciseTargetInputs } from './ExerciseTargetInputs'
import { filterExercises } from '../model/utils/databaseHelpers'
import { validateWorkoutInput } from '../model/utils/validationHelpers'
import { colors } from '../theme'

interface ExercisePickerModalProps {
  visible: boolean
  onClose: () => void
  exercises: Exercise[]
  onAdd: (exerciseId: string, sets: string, reps: string, weight: string) => Promise<void>
  onHapticSelect?: () => void
  initialSets?: string
  initialReps?: string
  initialWeight?: string
}

/**
 * ExercisePickerModal - Modale de sélection d'exercice avec filtres et objectifs
 *
 * Grande modale Portal qui permet:
 * - Filtrer les exercices par muscle/équipement
 * - Sélectionner un exercice
 * - Définir les objectifs (séries/reps/poids)
 * - Validation automatique
 *
 * @param visible - Contrôle la visibilité de la modale
 * @param onClose - Callback appelé quand l'utilisateur ferme la modale
 * @param exercises - Liste des exercices disponibles
 * @param onAdd - Callback appelé quand l'utilisateur ajoute un exercice (exerciseId, sets, reps, weight)
 * @param onHapticSelect - Callback optionnel pour feedback haptique lors de la sélection
 * @param initialSets - Valeur initiale pour les séries (optionnel)
 * @param initialReps - Valeur initiale pour les reps (optionnel)
 * @param initialWeight - Valeur initiale pour le poids (optionnel)
 *
 * @example
 * <ExercisePickerModal
 *   visible={isAddModalVisible}
 *   onClose={() => setIsAddModalVisible(false)}
 *   exercises={exercisesList}
 *   onAdd={handleAddExercise}
 *   onHapticSelect={haptics.onSelect}
 * />
 */
export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  visible,
  onClose,
  exercises,
  onAdd,
  onHapticSelect,
  initialSets = '',
  initialReps = '',
  initialWeight = '',
}) => {
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<string | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [targetSets, setTargetSets] = useState(initialSets)
  const [targetReps, setTargetReps] = useState(initialReps)
  const [targetWeight, setTargetWeight] = useState(initialWeight)

  // Réinitialiser les états quand la modale se ferme
  useEffect(() => {
    if (!visible) {
      setFilterMuscle(null)
      setFilterEquipment(null)
      setSelectedExerciseId(null)
      setTargetSets(initialSets)
      setTargetReps(initialReps)
      setTargetWeight(initialWeight)
    }
  }, [visible, initialSets, initialReps, initialWeight])

  const filteredExercises = useMemo(() => {
    return filterExercises(exercises, filterMuscle, filterEquipment)
  }, [exercises, filterMuscle, filterEquipment])

  const isFormValid = useMemo(() => {
    return validateWorkoutInput(targetSets, targetReps, targetWeight).valid
  }, [targetSets, targetReps, targetWeight])

  const isAddValid = useMemo(() => {
    return selectedExerciseId && isFormValid
  }, [selectedExerciseId, isFormValid])

  const handleAdd = async () => {
    if (!isAddValid || !selectedExerciseId) return
    await onAdd(selectedExerciseId, targetSets, targetReps, targetWeight)
  }

  const handleExerciseSelect = (exoId: string) => {
    if (onHapticSelect) onHapticSelect()
    setSelectedExerciseId(exoId)
  }

  if (!visible) return null

  return (
    <Portal>
      <View style={styles.fullscreenPortal}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.absoluteOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.customModalContent}>
          <Text style={styles.modalTitle}>Bibliothèque</Text>

          {/* Filtres */}
          <View style={styles.filterSection}>
            <ChipSelector
              items={MUSCLES_LIST}
              selectedValue={filterMuscle}
              onChange={setFilterMuscle}
              noneLabel="Tous muscles"
              style={styles.filterRow}
            />
            <ChipSelector
              items={EQUIPMENT_LIST}
              selectedValue={filterEquipment}
              onChange={setFilterEquipment}
              noneLabel="Tout équipement"
              style={[styles.filterRow, { marginTop: 8 }]}
            />
          </View>

          {/* Liste d'exercices */}
          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map(exo => (
              <TouchableOpacity
                key={exo.id}
                style={[styles.exoChip, selectedExerciseId === exo.id && styles.exoChipSelected]}
                onPress={() => handleExerciseSelect(exo.id)}
              >
                <Text style={[styles.exoText, selectedExerciseId === exo.id && styles.exoTextSelected]}>
                  {exo.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Inputs objectifs */}
          <ExerciseTargetInputs
            sets={targetSets}
            reps={targetReps}
            weight={targetWeight}
            onSetsChange={setTargetSets}
            onRepsChange={setTargetReps}
            onWeightChange={setTargetWeight}
          />

          {/* Boutons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.confirmBtn, !isAddValid && { opacity: 0.3 }]}
              disabled={!isAddValid}
            >
              <Text style={styles.btnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Portal>
  )
}

const styles = StyleSheet.create({
  fullscreenPortal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  absoluteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  customModalContent: {
    width: '90%',
    backgroundColor: colors.card,
    padding: 25,
    borderRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
  },
  exerciseList: {
    height: 200,
    marginBottom: 15,
  },
  exoChip: {
    padding: 12,
    backgroundColor: colors.cardSecondary,
    marginBottom: 5,
    borderRadius: 8,
  },
  exoChipSelected: {
    backgroundColor: colors.primary,
  },
  exoText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  exoTextSelected: {
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 0.48,
    backgroundColor: colors.secondaryButton,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 0.48,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: colors.text,
    fontWeight: 'bold',
  },
})
