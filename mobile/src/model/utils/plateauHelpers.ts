import { EPLEY_FORMULA_DIVISOR, DAY_MS } from '../constants'
import WorkoutSet from '../models/Set'

export type PlateauStrategySuggestion =
  | 'deload'
  | 'vary_reps'
  | 'add_volume'
  | 'rest_pause'
  | 'progressive'

export interface PlateauData {
  isPlateauing: boolean
  sessionsSinceLastPR: number
  daysSinceLastProgress: number
  currentBest1RM: number
  strategies: PlateauStrategySuggestion[]
}

const MIN_SETS_FOR_PLATEAU = 5
const PLATEAU_MIN_SESSIONS = 3
const PLATEAU_MIN_DAYS = 21
const PLATEAU_SEVERE_SESSIONS = 6

/**
 * Détecte si l'utilisateur est en plateau sur cet exercice.
 * Retourne null si moins de 5 sets au total.
 */
export function computePlateauAnalysis(sets: WorkoutSet[]): PlateauData | null {
  if (sets.length < MIN_SETS_FOR_PLATEAU) return null

  const sorted = [...sets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Calculer 1RM Epley pour chaque set
  const setsWithOrm = sorted.map(s => ({
    orm: s.weight * (1 + s.reps / EPLEY_FORMULA_DIVISOR),
    date: new Date(s.createdAt),
  }))

  const currentBest1RM = Math.max(...setsWithOrm.map(s => s.orm))

  // Trouver la date du meilleur 1RM
  const bestSet = setsWithOrm.find(s => s.orm === currentBest1RM)
  if (!bestSet) return null

  const lastPRDate = bestSet.date
  const daysSinceLastProgress = Math.floor((Date.now() - lastPRDate.getTime()) / DAY_MS)

  // Compter les dates uniques de séances APRÈS le dernier PR
  const uniqueDatesAfterPR = new Set(
    setsWithOrm
      .filter(s => s.date.getTime() > lastPRDate.getTime())
      .map(s => s.date.toDateString()),
  )
  const sessionsSinceLastPR = uniqueDatesAfterPR.size

  const isPlateauing = sessionsSinceLastPR >= PLATEAU_MIN_SESSIONS && daysSinceLastProgress >= PLATEAU_MIN_DAYS

  let strategies: PlateauStrategySuggestion[] = []
  if (sessionsSinceLastPR >= PLATEAU_SEVERE_SESSIONS) {
    strategies = ['deload', 'vary_reps']
  } else if (sessionsSinceLastPR >= PLATEAU_MIN_SESSIONS) {
    strategies = ['progressive', 'vary_reps']
  }

  return {
    isPlateauing,
    sessionsSinceLastPR,
    daysSinceLastProgress,
    currentBest1RM,
    strategies,
  }
}
