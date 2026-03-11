import { useState, useEffect, useRef, useCallback } from 'react'
import SessionExercise from '../model/models/SessionExercise'
import {
  saveWorkoutSet,
  getMaxWeightForExercise,
  deleteWorkoutSet,
  getLastSetsForExercises,
} from '../model/utils/databaseHelpers'
import { validateSetInput } from '../model/utils/validationHelpers'
import type { SetInputData, ValidatedSetData } from '../types/workout'

function buildInitialInputs(
  sessionExercises: SessionExercise[],
  initialData: Record<string, Record<number, { weight: number; reps: number }>>
): Record<string, SetInputData> {
  const initial: Record<string, SetInputData> = {}
  for (const se of sessionExercises) {
    const exerciseId = se.exercise.id
    for (let i = 1; i <= (se.setsTarget ?? 0); i++) {
      const key = `${se.id}_${i}`
      const lastData = initialData[exerciseId]?.[i]
      initial[key] = {
        weight: lastData?.weight != null ? String(lastData.weight) : '',
        reps: lastData?.reps != null ? String(lastData.reps) : '',
      }
    }
  }
  return initial
}

/**
 * Gere l'etat local de la seance en direct :
 * saisies des sets, sets valides, volume total accumule.
 * Charge les derniers poids depuis l'historique au montage (pré-remplissage).
 *
 * @param sessionExercises - Exercices de la seance (depuis withObservables)
 * @param historyId - ID de la History en cours (disponible apres creation async)
 *
 * @example
 * const { setInputs, validatedSets, totalVolume, updateSetInput, validateSet, unvalidateSet }
 *   = useWorkoutState(sessionExercises, historyId)
 */
export function useWorkoutState(
  sessionExercises: SessionExercise[],
  historyId: string
) {
  const [setInputs, setSetInputs] = useState<Record<string, SetInputData>>(
    () => buildInitialInputs(sessionExercises, {})
  )
  // Ref synchronisé : permet à validateSet de lire la valeur courante même quand
  // le debounce est flushé synchroniquement juste avant l'appel (race condition).
  const setInputsRef = useRef<Record<string, SetInputData>>({})
  setInputsRef.current = setInputs

  const [validatedSets, setValidatedSets] = useState<Record<string, ValidatedSetData>>({})
  // Ref synchronisé : permet à unvalidateSet de lire la valeur courante même quand
  // plusieurs appels rapides se chevauchent (stale closure prevention).
  const validatedSetsRef = useRef<Record<string, ValidatedSetData>>({})
  validatedSetsRef.current = validatedSets
  const [totalVolume, setTotalVolume] = useState(0)
  // Guard contre double-tap rapide (validateSet/unvalidateSet)
  const pendingOpsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const exerciseIds = sessionExercises.map(se => se.exercise.id)
    if (exerciseIds.length === 0) return

    let cancelled = false

    getLastSetsForExercises(exerciseIds).then(lastWeights => {
      if (cancelled) return
      setSetInputs(buildInitialInputs(sessionExercises, lastWeights))
    }).catch(e => {
      if (__DEV__) console.warn('[useWorkoutState] getLastSetsForExercises failed:', e)
      // inputs restent vides si erreur
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Intentionnel : initialisation unique au mount. Si sessionExercises change
  // après le mount (re-render HOC), on ne réinitialise PAS les inputs pour
  // ne pas écraser les saisies en cours de l'utilisateur.
  }, [])

  const updateSetInput = useCallback((key: string, field: 'weight' | 'reps', value: string) => {
    setSetInputs(prev => {
      const next = { ...prev, [key]: { ...prev[key], [field]: value } }
      setInputsRef.current = next
      return next
    })
  }, [])

  const validateSet = useCallback(async (
    sessionExercise: SessionExercise,
    setOrder: number
  ): Promise<boolean> => {
    if (!historyId) return false

    const key = `${sessionExercise.id}_${setOrder}`
    if (pendingOpsRef.current.has(key)) return false
    pendingOpsRef.current.add(key)

    try {
      const input = setInputsRef.current[key]
      if (!input) return false

      const { valid } = validateSetInput(input.weight, input.reps)
      if (!valid) return false

      const weight = Number(input.weight)
      const reps = Number(input.reps)

      const exercise = await sessionExercise.exercise.fetch()
      if (!exercise) return false

      const maxWeight = await getMaxWeightForExercise(exercise.id, historyId)
      const isPr = weight > 0 && weight > maxWeight

      await saveWorkoutSet({
        historyId,
        exerciseId: exercise.id,
        weight,
        reps,
        setOrder,
        isPr,
      })

      setValidatedSets(prev => ({ ...prev, [key]: { weight, reps, isPr } }))
      setTotalVolume(prev => prev + weight * reps)
      return true
    } catch (error) {
      if (__DEV__) console.error('Failed to save workout set:', error)
      return false
    } finally {
      pendingOpsRef.current.delete(key)
    }
  }, [historyId])

  const unvalidateSet = useCallback(async (
    sessionExercise: SessionExercise,
    setOrder: number
  ): Promise<boolean> => {
    if (!historyId) return false

    const key = `${sessionExercise.id}_${setOrder}`
    if (pendingOpsRef.current.has(key)) return false
    pendingOpsRef.current.add(key)

    try {
      const validated = validatedSetsRef.current[key]
      if (!validated) return false

      const exercise = await sessionExercise.exercise.fetch()
      if (!exercise) return false

      await deleteWorkoutSet(historyId, exercise.id, setOrder)

      setValidatedSets(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setTotalVolume(prev => prev - validated.weight * validated.reps)
      return true
    } catch (error) {
      if (__DEV__) console.error('Failed to delete workout set:', error)
      return false
    } finally {
      pendingOpsRef.current.delete(key)
    }
  }, [historyId])

  return {
    setInputs,
    validatedSets,
    totalVolume,
    updateSetInput,
    validateSet,
    unvalidateSet,
  }
}
