import { useState, useMemo, useCallback } from 'react'
import { Platform, ToastAndroid } from 'react-native'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import Session from '../model/models/Session'
import SessionExercise from '../model/models/SessionExercise'
import Exercise from '../model/models/Exercise'
import PerformanceLog from '../model/models/PerformanceLog'
import { validateWorkoutInput } from '../model/utils/validationHelpers'
import { parseNumericInput, parseIntegerInput, getNextPosition } from '../model/utils/databaseHelpers'
import { useLanguage } from '../contexts/LanguageContext'

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
  const { t } = useLanguage()

  // --- TARGET INPUTS STATES ---
  const [targetSets, setTargetSets] = useState('')
  const [targetReps, setTargetReps] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [targetRestTime, setTargetRestTime] = useState('')

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
  const addExercise = useCallback(async (
    exerciseId: string,
    sets: string,
    reps: string,
    weight: string,
    exercise: Exercise
  ): Promise<boolean> => {
    const validation = validateWorkoutInput(sets, reps, weight)
    if (!validation.valid) return false
    if (!exercise) return false

    try {
      const position = await getNextPosition(
        'session_exercises',
        Q.where('session_id', session.id)
      )
      await database.write(async () => {
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
      if (__DEV__) console.error('[useSessionManager] addExercise failed:', error)
      return false
    }
  }, [session.id, onSuccess])

  const updateTargets = useCallback(async (): Promise<boolean> => {
    if (!selectedSessionExercise || !isFormValid) return false

    try {
      const exo = await selectedSessionExercise.exercise.fetch()
      if (!exo) return false

      const setsVal = Math.min(Math.max(parseIntegerInput(targetSets), 1), 10)
      const weightVal = Math.min(Math.max(parseNumericInput(targetWeight), 0), 999)
      const repsVal = parseIntegerInput(targetReps)

      const restTimeParsed = targetRestTime.trim() === '' ? null : parseInt(targetRestTime, 10)
      const restTimeVal = restTimeParsed !== null && !isNaN(restTimeParsed)
        ? Math.min(Math.max(restTimeParsed, 10), 600)
        : null

      await database.write(async () => {
        await selectedSessionExercise.update((se) => {
          se.setsTarget = setsVal
          se.repsTarget = targetReps
          se.weightTarget = weightVal
          se.restTime = restTimeVal
        })

        await database.get<PerformanceLog>('performance_logs').create((log) => {
          log.exercise.set(exo)
          log.sets = setsVal
          log.weight = weightVal
          log.reps = repsVal
        })
      })

      if (onSuccess) onSuccess()
      setTargetSets('')
      setTargetReps('')
      setTargetWeight('')
      setTargetRestTime('')
      setSelectedSessionExercise(null)
      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] updateTargets failed:', error)
      return false
    }
  }, [selectedSessionExercise, isFormValid, targetSets, targetReps, targetWeight, targetRestTime, onSuccess])

  const removeExercise = useCallback(async (sessionExercise: SessionExercise): Promise<boolean> => {
    try {
      await database.write(async () => {
        await sessionExercise.destroyPermanently()
      })

      if (Platform.OS === 'android') {
        ToastAndroid.show(t.common.removed, ToastAndroid.SHORT)
      }

      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] removeExercise failed:', error)
      return false
    }
  }, [t.common.removed])

  const prepareEditTargets = useCallback((sessionExercise: SessionExercise) => {
    setSelectedSessionExercise(sessionExercise)
    setTargetSets(sessionExercise.setsTarget?.toString() || '')
    setTargetReps(sessionExercise.repsTarget || '')
    setTargetWeight(sessionExercise.weightTarget?.toString() || '')
    setTargetRestTime(sessionExercise.restTime?.toString() || '')
  }, [])

  const resetTargets = useCallback(() => {
    setTargetSets('')
    setTargetReps('')
    setTargetWeight('')
    setTargetRestTime('')
  }, [])

  const reorderExercises = useCallback(async (items: SessionExercise[]): Promise<boolean> => {
    try {
      await database.write(async () => {
        await database.batch(
          ...items.map((item, index) =>
            item.prepareUpdate((se) => {
              se.position = index
            })
          )
        )
      })
      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] reorderExercises failed:', error)
      return false
    }
  }, [])

  const groupExercises = useCallback(async (
    items: SessionExercise[],
    type: 'superset' | 'circuit'
  ): Promise<boolean> => {
    if (items.length < 2) return false

    try {
      const supersetId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      await database.write(async () => {
        await database.batch(
          ...items.map((item, index) =>
            item.prepareUpdate((se) => {
              se.supersetId = supersetId
              se.supersetType = type
              se.supersetPosition = index
            })
          )
        )
      })

      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] groupExercises failed:', error)
      return false
    }
  }, [onSuccess])

  const ungroupExercise = useCallback(async (
    sessionExercise: SessionExercise,
    allSessionExercises: SessionExercise[]
  ): Promise<boolean> => {
    if (!sessionExercise.supersetId) return false

    try {
      const groupId = sessionExercise.supersetId
      const groupMembers = allSessionExercises.filter(se => se.supersetId === groupId)

      await database.write(async () => {
        if (groupMembers.length <= 2) {
          // Dissocier tout le groupe (il ne resterait qu'1 exercice)
          await database.batch(
            ...groupMembers.map(item =>
              item.prepareUpdate((se) => {
                se.supersetId = null
                se.supersetType = null
                se.supersetPosition = null
              })
            )
          )
        } else {
          // Retirer seulement cet exercice du groupe
          await sessionExercise.update((se) => {
            se.supersetId = null
            se.supersetType = null
            se.supersetPosition = null
          })
          // Recalculer les positions des restants
          const remaining = groupMembers
            .filter(se => se.id !== sessionExercise.id)
            .sort((a, b) => (a.supersetPosition ?? 0) - (b.supersetPosition ?? 0))
          await database.batch(
            ...remaining.map((item, index) =>
              item.prepareUpdate((se) => {
                se.supersetPosition = index
              })
            )
          )
        }
      })

      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] ungroupExercise failed:', error)
      return false
    }
  }, [onSuccess])

  return {
    // Target inputs states
    targetSets,
    setTargetSets,
    targetReps,
    setTargetReps,
    targetWeight,
    setTargetWeight,
    targetRestTime,
    setTargetRestTime,
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
    groupExercises,
    ungroupExercise,
  }
}
