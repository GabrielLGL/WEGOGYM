import { useState } from 'react'
import SessionExercise from '../model/models/SessionExercise'
import { saveWorkoutSet, getMaxWeightForExercise, deleteWorkoutSet } from '../model/utils/databaseHelpers'
import { validateSetInput } from '../model/utils/validationHelpers'
import type { SetInputData, ValidatedSetData } from '../types/workout'

function buildInitialInputs(sessionExercises: SessionExercise[]): Record<string, SetInputData> {
  const initial: Record<string, SetInputData> = {}
  for (const se of sessionExercises) {
    for (let i = 1; i <= (se.setsTarget ?? 0); i++) {
      const key = `${se.id}_${i}`
      initial[key] = {
        weight: se.weightTarget?.toString() ?? '',
        reps: se.repsTarget ?? '',
      }
    }
  }
  return initial
}

/**
 * Gere l'etat local de la seance en direct :
 * saisies des sets, sets valides, volume total accumule.
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
    () => buildInitialInputs(sessionExercises)
  )
  const [validatedSets, setValidatedSets] = useState<Record<string, ValidatedSetData>>({})
  const [totalVolume, setTotalVolume] = useState(0)

  const updateSetInput = (key: string, field: 'weight' | 'reps', value: string) => {
    setSetInputs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const validateSet = async (
    sessionExercise: SessionExercise,
    setOrder: number
  ): Promise<boolean> => {
    if (!historyId) return false

    const key = `${sessionExercise.id}_${setOrder}`
    const input = setInputs[key]
    if (!input) return false

    const { valid } = validateSetInput(input.weight, input.reps)
    if (!valid) return false

    const weight = Number(input.weight)
    const reps = Number(input.reps)

    try {
      const exercise = await sessionExercise.exercise.fetch()
      if (!exercise) return false

      const maxWeight = await getMaxWeightForExercise(exercise.id, historyId)
      const isPr = maxWeight > 0 && weight > maxWeight

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
      console.error('Failed to save workout set:', error)
      return false
    }
  }

  const unvalidateSet = async (
    sessionExercise: SessionExercise,
    setOrder: number
  ): Promise<boolean> => {
    if (!historyId) return false

    const key = `${sessionExercise.id}_${setOrder}`
    const validated = validatedSets[key]
    if (!validated) return false

    try {
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
      console.error('Failed to delete workout set:', error)
      return false
    }
  }

  return {
    setInputs,
    validatedSets,
    totalVolume,
    updateSetInput,
    validateSet,
    unvalidateSet,
  }
}
