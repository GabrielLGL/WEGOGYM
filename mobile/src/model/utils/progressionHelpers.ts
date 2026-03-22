/**
 * Helpers pour la suggestion de progression adaptative.
 *
 * Double progression :
 *   - Range ("6-8") : d'abord +1 rep jusqu'au max, puis +2.5kg et reset au min
 *   - Fixe ("5") : uniquement +2.5kg
 *   - Null/vide : pas de suggestion
 */

import type { UnitMode } from './unitHelpers'
import { getWeightUnit, convertWeight } from './unitHelpers'

const WEIGHT_INCREMENT = 2.5

export interface ProgressionSuggestion {
  suggestedWeight: number
  suggestedReps: number
  label: string
}

type ParsedRepsTarget =
  | { type: 'range'; min: number; max: number }
  | { type: 'fixed'; value: number }

/**
 * Parse un repsTarget string en structure typee.
 *
 * @param repsTarget - "6-8", "5", null, undefined
 * @returns Structure parsee ou null si invalide
 */
export function parseRepsTarget(
  repsTarget: string | undefined | null
): ParsedRepsTarget | null {
  if (!repsTarget || !repsTarget.trim()) return null

  const trimmed = repsTarget.trim()

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-')
    if (parts.length !== 2) return null
    const min = parseInt(parts[0], 10)
    const max = parseInt(parts[1], 10)
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min >= max) return null
    return { type: 'range', min, max }
  }

  const value = parseInt(trimmed, 10)
  if (isNaN(value) || value <= 0) return null
  return { type: 'fixed', value }
}

/**
 * Calcule la suggestion de progression basée sur la dernière performance.
 *
 * @param lastWeight - Poids moyen de la dernière séance (kg)
 * @param lastReps - Reps moyennes de la dernière séance
 * @param repsTarget - Cible de reps ("6-8", "5", null)
 * @returns Suggestion ou null si pas applicable
 */
export function suggestProgression(
  lastWeight: number,
  lastReps: number,
  repsTarget: string | undefined | null,
  unitMode: UnitMode = 'metric',
): ProgressionSuggestion | null {
  if (lastWeight <= 0 || lastReps <= 0) return null

  const parsed = parseRepsTarget(repsTarget)
  if (!parsed) return null

  const wu = getWeightUnit(unitMode)
  const displayIncrement = convertWeight(WEIGHT_INCREMENT, unitMode)

  if (parsed.type === 'range') {
    if (lastReps >= parsed.max) {
      // Max du range atteint → +poids, reset reps au min
      return {
        suggestedWeight: lastWeight + WEIGHT_INCREMENT,
        suggestedReps: parsed.min,
        label: `+${displayIncrement} ${wu}`,
      }
    }
    // Range pas atteint → meme poids, +1 rep
    return {
      suggestedWeight: lastWeight,
      suggestedReps: Math.round(lastReps) + 1,
      label: '+1 rep',
    }
  }

  // Fixed → uniquement +poids
  return {
    suggestedWeight: lastWeight + WEIGHT_INCREMENT,
    suggestedReps: parsed.value,
    label: `+${displayIncrement} ${wu}`,
  }
}
