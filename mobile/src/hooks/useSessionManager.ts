import { useState, useMemo } from 'react'
import { Platform, ToastAndroid } from 'react-native'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import PerformanceLog from '../model/models/PerformanceLog'
import { validateWorkoutInput } from '../model/utils/validationHelpers'
import { parseNumericInput, parseIntegerInput, getNextPosition } from '../model/utils/databaseHelpers'

/**
 * useSessionManager - Hook pour gérer les opérations sur les exercices d'une session
 *
 * Encapsule la logique d'ajout, modification et suppression d'exercices dans une session.
 * Utilisé dans: SessionDetailScreen
 *
 * @param session - Session active
 * @param onSuccess - Callback optionnel pour feedback haptique de succès
 * @returns États et fonctions pour gérer les exercices de session
 *
 * @example
 * const {
 *   // Target inputs states
 *   targetSets,
 *   setTargetSets,
 *   targetReps,
 *   setTargetReps,
 *   targetWeight,
 *   setTargetWeight,
 *   isFormValid,
 *   // Selected exercise
 *   selectedSessionExercise,
 *   setSelectedSessionExercise,
 *   // Operations
 *   addExercise,
 *   updateTargets,
 *   removeExercise,
 *   prepareEditTargets,
 *   resetTargets,
 * } = useSessionManager(session, haptics.onSuccess)
 */
export function useSessionManager(
  session: Session,
  onSuccess?: () => void
) {
  // --- TARGET INPUTS STATES ---
  const [targetSets, setTargetSets] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  // --- SELECTED EXERCISE ---
  const [selectedSessionExercise, setSelectedSessionExercise] = useState<SessionExercise | null>(null)

  /**
   * Validation du formulaire (sets, reps, weight)
   */
  const isFormValid = useMemo(() => {
    return validateWorkoutInput(targetSets, targetReps, targetWeight).valid
  }, [targetSets, targetReps, targetWeight])

  /**
   * Ajoute un exercice à la session
   * @param exerciseId - ID de l'exercice à ajouter
   * @param sets - Nombre de séries
   * @param reps - Nombre de répétitions
   * @param weight - Poids (optionnel)
   * @param exercise - Instance Exercise (pour éviter refetch)
   * @returns true si succès, false sinon
   */
  const addExercise = async (
    exerciseId: string,
    sets: string,
    reps: string,
    weight: string,
    exercise: Exercise
  ): Promise<boolean> => {
    const validation = validateWorkoutInput(sets, reps, weight)
    if (!validation.valid) return false

    try {
      await database.write(async () => {
        const position = await getNextPosition(
          'session_exercises',
          Q.where('session_id', session.id)
        )

        await database.get<SessionExercise>('session_exercises').create((se) => {
          se.session.set(session)
          se.exercise.set(exercise)
          se.position = position
          se.setsTarget = parseIntegerInput(sets)
          se.repsTarget = reps
          se.weightTarget = parseNumericInput(weight)
        })

        await database.get<PerformanceLog>('performance_logs').create((log) => {
          log.exercise.set(exercise)
          log.sets = parseIntegerInput(sets)
          log.weight = parseNumericInput(weight)
          log.reps = parseIntegerInput(reps)
        })
      })

      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      console.error('Failed to add exercise:', error)
      return false
    }
  }

  /**
   * Met à jour les targets d'un exercice de session
   * @returns true si succès, false sinon
   */
  const updateTargets = async (): Promise<boolean> => {
    if (!selectedSessionExercise || !isFormValid) return false

    try {
      const exo = await selectedSessionExercise.exercise.fetch()
      if (!exo) return false

      const setsVal = parseIntegerInput(targetSets)
      const weightVal = parseNumericInput(targetWeight)
      const repsVal = parseIntegerInput(targetReps)

      await database.write(async () => {
        await selectedSessionExercise.update((se) => {
          se.setsTarget = setsVal
          se.repsTarget = targetReps
          se.weightTarget = weightVal
        })

        await database.get<PerformanceLog>('performance_logs').create((log) => {
          log.exercise.set(exo)
          log.sets = setsVal
          log.weight = weightVal
          log.reps = repsVal
        })
      })

      if (onSuccess) onSuccess()
      resetTargets()
      setSelectedSessionExercise(null)
      return true
    } catch (error) {
      console.error('Failed to update targets:', error)
      return false
    }
  }

  /**
   * Supprime un exercice de la session
   * @param sessionExercise - SessionExercise à supprimer
   * @returns true si succès, false sinon
   */
  const removeExercise = async (sessionExercise: SessionExercise): Promise<boolean> => {
    try {
      await database.write(async () => {
        await sessionExercise.destroyPermanently()
      })

      if (Platform.OS === 'android') {
        ToastAndroid.show('Retiré', ToastAndroid.SHORT)
      }

      return true
    } catch (error) {
      console.error('Failed to remove exercise:', error)
      return false
    }
  }

  /**
   * Prépare le formulaire pour éditer les targets d'un exercice
   * @param sessionExercise - SessionExercise à éditer
   */
  const prepareEditTargets = (sessionExercise: SessionExercise) => {
    setSelectedSessionExercise(sessionExercise)
    setTargetSets(sessionExercise.setsTarget?.toString() || '')
    setTargetReps(sessionExercise.repsTarget || '')
    setTargetWeight(sessionExercise.weightTarget?.toString() || '')
  }

  /**
   * Réinitialise les inputs de target
   */
  const resetTargets = () => {
    setTargetSets('')
    setTargetReps('')
    setTargetWeight('')
  }

  return {
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
  }
}
