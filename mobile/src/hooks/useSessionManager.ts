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

      const setsVal = Math.min(Math.max(parseIntegerInput(targetSets), 1), 10)
      const weightVal = Math.min(Math.max(parseNumericInput(targetWeight), 0), 999)
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
      if (__DEV__) console.error('[useSessionManager] updateTargets failed:', error)
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
      if (__DEV__) console.error('[useSessionManager] removeExercise failed:', error)
      return false
    }
  }

  /**
   * Met à jour les notes d'un exercice de session
   * @param sessionExercise - SessionExercise à modifier
   * @param notes - Nouveau texte de notes
   * @returns true si succès, false sinon
   */
  const updateExerciseNotes = async (
    sessionExercise: SessionExercise,
    notes: string
  ): Promise<boolean> => {
    try {
      await database.write(async () => {
        await sessionExercise.update((se) => {
          se.notes = notes
        })
      })
      return true
    } catch (error) {
      if (__DEV__) console.error('[useSessionManager] updateExerciseNotes failed:', error)
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

  /**
   * Réordonne les exercices d'une session selon l'ordre du tableau reçu
   * @param items - Tableau de SessionExercise dans le nouvel ordre
   * @returns true si succès, false sinon
   */
  const reorderExercises = async (items: SessionExercise[]): Promise<boolean> => {
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
  }

  /**
   * Groupe des exercices en superset ou circuit
   * @param items - SessionExercises à grouper (minimum 2)
   * @param type - 'superset' ou 'circuit'
   * @returns true si succès
   */
  const groupExercises = async (
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
  }

  /**
   * Dissocie un exercice de son superset/circuit
   * Si le groupe restant n'a plus qu'1 exercice, dissocie tout le groupe
   * @param sessionExercise - L'exercice à dissocier
   * @param allSessionExercises - Tous les exercices de la session (pour trouver les voisins)
   * @returns true si succès
   */
  const ungroupExercise = async (
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
    updateExerciseNotes,
    prepareEditTargets,
    resetTargets,
    reorderExercises,
    groupExercises,
    ungroupExercise,
  }
}
