/**
 * trainingDensityHelpers.ts — Calcul de la densité d'entraînement (volume/minute)
 */

interface SetData {
  weight: number
  reps: number
}

export interface DensityResult {
  currentDensity: number
  elapsedMinutes: number
  totalVolume: number
  previousDensity: number | null
  comparison: 'faster' | 'slower' | 'similar' | null
  pace: string
}

/**
 * Calcule la densité d'entraînement en temps réel.
 *
 * @param currentSets - Séries validées de la séance en cours
 * @param startTime - Timestamp de début (ms)
 * @param previousSets - Séries de la séance précédente (optionnel)
 * @param previousDuration - Durée de la séance précédente en minutes (optionnel)
 */
export function computeTrainingDensity(
  currentSets: SetData[],
  startTime: number,
  previousSets?: SetData[],
  previousDuration?: number,
): DensityResult {
  const totalVolume = currentSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
  const elapsedMinutes = Math.max(1, (Date.now() - startTime) / 60000)
  const currentDensity = totalVolume / elapsedMinutes

  let previousDensity: number | null = null
  let comparison: DensityResult['comparison'] = null

  if (previousSets && previousSets.length > 0 && previousDuration && previousDuration > 0) {
    const prevVolume = previousSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    previousDensity = prevVolume / previousDuration

    if (previousDensity > 0) {
      const diff = (currentDensity - previousDensity) / previousDensity
      if (diff > 0.1) {
        comparison = 'faster'
      } else if (diff < -0.1) {
        comparison = 'slower'
      } else {
        comparison = 'similar'
      }
    }
  }

  return {
    currentDensity,
    elapsedMinutes,
    totalVolume,
    previousDensity,
    comparison,
    pace: formatDensity(currentDensity),
  }
}

/**
 * Formate une densité en chaîne lisible.
 */
export function formatDensity(density: number): string {
  return `${Math.round(density)} kg/min`
}
