import { useState } from 'react'
import { database } from '../model/index'
import Exercise from '../model/models/Exercise'
import { validateExerciseInput } from '../model/utils/validationHelpers'

/**
 * useExerciseManager - Hook pour gérer les opérations CRUD sur les exercices
 *
 * Encapsule la logique de création, modification et suppression d'exercices.
 * Utilisé dans: ExercisesScreen, SettingsScreen
 *
 * @param onSuccess - Callback optionnel pour feedback haptique de succès
 * @param onDelete - Callback optionnel pour feedback haptique de suppression
 * @returns États et fonctions pour gérer les exercices
 *
 * @example
 * const {
 *   selectedExercise,
 *   newExerciseData,
 *   editExerciseData,
 *   setSelectedExercise,
 *   updateNewExerciseName,
 *   updateNewExerciseMuscles,
 *   updateNewExerciseEquipment,
 *   updateEditExerciseName,
 *   updateEditExerciseMuscles,
 *   updateEditExerciseEquipment,
 *   createExercise,
 *   updateExercise,
 *   deleteExercise,
 *   resetNewExercise,
 *   loadExerciseForEdit
 * } = useExerciseManager(haptics.onSuccess, haptics.onDelete)
 */
export function useExerciseManager(
  onSuccess?: () => void,
  onDelete?: () => void
) {
  // État de l'exercice sélectionné
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  // Données pour la création
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newExerciseMuscles, setNewExerciseMuscles] = useState<string[]>([])
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('Poids libre')

  // Données pour l'édition
  const [editExerciseName, setEditExerciseName] = useState('')
  const [editExerciseMuscles, setEditExerciseMuscles] = useState<string[]>([])
  const [editExerciseEquipment, setEditExerciseEquipment] = useState('Poids libre')

  /**
   * Crée un nouvel exercice
   * @returns true si créé avec succès, false sinon
   */
  const createExercise = async (): Promise<boolean> => {
    const validation = validateExerciseInput(
      newExerciseName,
      newExerciseMuscles,
      newExerciseEquipment
    )

    if (!validation.valid) return false

    await database.write(async () => {
      await database.get<Exercise>('exercises').create(e => {
        e.name = newExerciseName.trim()
        e.muscles = newExerciseMuscles
        e.equipment = newExerciseEquipment
        e.isCustom = true
      })
    })

    if (onSuccess) onSuccess()
    resetNewExercise()
    return true
  }

  /**
   * Met à jour un exercice existant
   * @returns true si mis à jour avec succès, false sinon
   */
  const updateExercise = async (): Promise<boolean> => {
    if (!selectedExercise) return false

    const validation = validateExerciseInput(
      editExerciseName,
      editExerciseMuscles,
      editExerciseEquipment
    )

    if (!validation.valid) return false

    await database.write(async () => {
      await selectedExercise.update(e => {
        e.name = editExerciseName.trim()
        e.muscles = editExerciseMuscles
        e.equipment = editExerciseEquipment
      })
    })

    if (onSuccess) onSuccess()
    setSelectedExercise(null)
    return true
  }

  /**
   * Supprime un exercice et toutes ses données associées
   * @returns true si supprimé avec succès, false sinon
   */
  const deleteExercise = async (): Promise<boolean> => {
    if (!selectedExercise) return false

    if (onDelete) onDelete()
    await selectedExercise.deleteAllAssociatedData()
    setSelectedExercise(null)
    return true
  }

  /**
   * Réinitialise les données du nouvel exercice
   */
  const resetNewExercise = () => {
    setNewExerciseName('')
    setNewExerciseMuscles([])
    setNewExerciseEquipment('Poids libre')
  }

  /**
   * Charge un exercice pour l'édition
   * @param exercise - Exercice à éditer
   */
  const loadExerciseForEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setEditExerciseName(exercise.name)
    setEditExerciseMuscles(exercise.muscles)
    setEditExerciseEquipment(exercise.equipment)
  }

  return {
    // États
    selectedExercise,
    setSelectedExercise,

    // Données nouvel exercice
    newExerciseData: {
      name: newExerciseName,
      muscles: newExerciseMuscles,
      equipment: newExerciseEquipment,
    },

    // Setters nouvel exercice
    updateNewExerciseName: setNewExerciseName,
    updateNewExerciseMuscles: setNewExerciseMuscles,
    updateNewExerciseEquipment: setNewExerciseEquipment,

    // Données édition exercice
    editExerciseData: {
      name: editExerciseName,
      muscles: editExerciseMuscles,
      equipment: editExerciseEquipment,
    },

    // Setters édition exercice
    updateEditExerciseName: setEditExerciseName,
    updateEditExerciseMuscles: setEditExerciseMuscles,
    updateEditExerciseEquipment: setEditExerciseEquipment,

    // Opérations
    createExercise,
    updateExercise,
    deleteExercise,
    resetNewExercise,
    loadExerciseForEdit,
  }
}
