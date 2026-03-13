import History from '../models/History'
import { DAY_MS } from '../constants'

export type MotivationContext =
  | 'returning_after_long'
  | 'slight_drop'
  | 'keep_going'
  | null

export interface MotivationData {
  context: MotivationContext
  daysSinceLastWorkout: number
  avgDaysBetweenWorkouts: number
}

/**
 * Détecte le contexte de motivation depuis l'historique des séances.
 * Retourne null si moins de 3 séances (pas assez de données).
 *
 * @param histories - Liste des séances actives (non supprimées, non abandonnées)
 * @returns MotivationData si un contexte est détecté, null sinon
 */
export function computeMotivation(histories: History[]): MotivationData | null {
  if (histories.length < 3) return null

  // Filtrer les séances avec une date valide
  const valid = histories.filter(h => h.startTime instanceof Date && !isNaN(h.startTime.getTime()))
  if (valid.length < 3) return null

  // Trier par startTime décroissant
  const sorted = [...valid].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime(),
  )

  const lastWorkoutDate = sorted[0].startTime.getTime()
  const daysSinceLastWorkout = Math.floor((Date.now() - lastWorkoutDate) / DAY_MS)

  // Calculer avgDaysBetweenWorkouts sur les 10 dernières séances
  const recent = sorted.slice(0, 10)
  const intervals: number[] = []
  for (let i = 0; i < recent.length - 1; i++) {
    const diff =
      (recent[i].startTime.getTime() - recent[i + 1].startTime.getTime()) / DAY_MS
    intervals.push(diff)
  }
  const avgDaysBetweenWorkouts =
    intervals.reduce((sum, v) => sum + v, 0) / intervals.length

  // Pas assez d'écart → pas de message
  if (daysSinceLastWorkout < avgDaysBetweenWorkouts) {
    return null
  }

  let context: MotivationContext = null

  if (daysSinceLastWorkout >= avgDaysBetweenWorkouts * 2) {
    context = 'returning_after_long'
  } else if (daysSinceLastWorkout >= avgDaysBetweenWorkouts * 1.5) {
    context = 'slight_drop'
  } else if (daysSinceLastWorkout >= avgDaysBetweenWorkouts - 0.5) {
    context = 'keep_going'
  }

  if (context === null) return null

  return { context, daysSinceLastWorkout, avgDaysBetweenWorkouts }
}
