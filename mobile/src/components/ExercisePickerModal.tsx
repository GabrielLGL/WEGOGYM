import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Portal } from '@gorhom/portal'
import Exercise from '../model/models/Exercise'
import { MUSCLES_LIST, EQUIPMENT_LIST } from '../model/constants'
import { ChipSelector } from './ChipSelector'
import { ExerciseTargetInputs } from './ExerciseTargetInputs'
import { ExerciseInfoSheet } from './ExerciseInfoSheet'
import { useHaptics } from '../hooks/useHaptics'
import { filterExercises, parseIntegerInput, parseNumericInput } from '../model/utils/databaseHelpers'
import { validateWorkoutInput } from '../model/utils/validationHelpers'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

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
  const colors = useColors()
  const styles = useStyles(colors)
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null)
  const [filterEquipment, setFilterEquipment] = useState<string | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [targetSets, setTargetSets] = useState(initialSets)
  const [targetReps, setTargetReps] = useState(initialReps)
  const [targetWeight, setTargetWeight] = useState(initialWeight)
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null)
  const haptics = useHaptics()

  // Réinitialiser les états quand la modale se ferme
  useEffect(() => {
    if (!visible) {
      setFilterMuscle(null)
      setFilterEquipment(null)
      setSelectedExerciseId(null)
      setTargetSets(initialSets)
      setTargetReps(initialReps)
      setTargetWeight(initialWeight)
      setInfoExercise(null)
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
    const clampedSets = targetSets !== '' ? String(Math.min(Math.max(parseIntegerInput(targetSets), 1), 10)) : ''
    const clampedWeight = targetWeight !== '' ? String(Math.min(Math.max(parseNumericInput(targetWeight), 0), 999)) : ''
    try {
      await onAdd(selectedExerciseId, clampedSets, targetReps, clampedWeight)
    } catch (e) {
      if (__DEV__) console.error('handleAdd error:', e)
    }
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
              style={[styles.filterRow, { marginTop: spacing.sm }]}
            />
          </View>

          {/* Liste d'exercices */}
          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map(exo => (
              <View
                key={exo.id}
                style={[styles.exoChip, selectedExerciseId === exo.id && styles.exoChipSelected]}
              >
                <TouchableOpacity
                  style={styles.exoNameArea}
                  onPress={() => handleExerciseSelect(exo.id)}
                >
                  <Text style={[styles.exoText, selectedExerciseId === exo.id && styles.exoTextSelected]}>
                    {exo.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    haptics.onPress()
                    setInfoExercise(exo)
                  }}
                  style={styles.exoInfoBtn}
                >
                  <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {infoExercise && (
            <ExerciseInfoSheet
              exercise={infoExercise}
              visible={!!infoExercise}
              onClose={() => setInfoExercise(null)}
            />
          )}

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

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      elevation: 20,
    },
    modalTitle: {
      color: colors.text,
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    filterSection: {
      marginBottom: spacing.md,
    },
    filterRow: {
      flexDirection: 'row',
    },
    exerciseList: {
      height: 200,
      marginBottom: spacing.md,
    },
    exoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.ms,
      paddingLeft: spacing.ms,
      paddingRight: spacing.xs,
      backgroundColor: colors.cardSecondary,
      marginBottom: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    exoNameArea: {
      flex: 1,
    },
    exoInfoBtn: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
    },
    exoChipSelected: {
      backgroundColor: colors.primary,
    },
    exoText: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
    },
    exoTextSelected: {
      color: colors.text,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    cancelBtn: {
      flex: 0.48,
      backgroundColor: colors.secondaryButton,
      padding: spacing.ms,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    confirmBtn: {
      flex: 0.48,
      backgroundColor: colors.primary,
      padding: spacing.ms,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    btnText: {
      color: colors.text,
      fontWeight: 'bold',
    },
  })
}
