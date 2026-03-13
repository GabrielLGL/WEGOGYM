import type WorkoutSet from '../models/Set'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PRDataPoint {
  dateMs: number
  weight: number
  reps: number
  orm: number
}

export interface PRPrediction {
  currentBest1RM: number
  predicted1RM: number
  targetWeight: number
  weeksToTarget: number
  weeklyGainRate: number
  dataPoints: number
  confidence: 'low' | 'medium' | 'high'
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

/**
 * Régression linéaire simple sur les 1RM historiques des PRs.
 * Retourne null si moins de 2 PRs disponibles.
 */
export function computePRPrediction(sets: WorkoutSet[]): PRPrediction | null {
  // 1. Filtrer les sets PR
  const prSets = sets.filter(s => s.isPr)
  if (prSets.length < 2) return null

  // 2. Calculer les data points avec 1RM Epley
  const dataPoints: PRDataPoint[] = prSets.map(s => ({
    dateMs: s.createdAt.getTime(),
    weight: s.weight,
    reps: s.reps,
    orm: s.weight * (1 + s.reps / 30),
  }))

  // 3. Régression linéaire sur (dateMs, orm)
  const n = dataPoints.length
  const xMean = dataPoints.reduce((sum, p) => sum + p.dateMs, 0) / n
  const yMean = dataPoints.reduce((sum, p) => sum + p.orm, 0) / n

  const numerator = dataPoints.reduce((sum, p) => sum + (p.dateMs - xMean) * (p.orm - yMean), 0)
  const denominator = dataPoints.reduce((sum, p) => sum + (p.dateMs - xMean) ** 2, 0)

  // slope en kg/ms
  const slopePerMs = denominator === 0 ? 0 : numerator / denominator

  // 4. Convertir en kg/semaine
  let weeklyGainRate = slopePerMs * MS_PER_WEEK

  // 5. Fallback si pente nulle ou négative
  if (weeklyGainRate <= 0) {
    weeklyGainRate = 0.5
  }

  // 6. currentBest1RM = max orm
  const currentBest1RM = Math.max(...dataPoints.map(p => p.orm))

  // 7. targetWeight = prochain palier à +2.5% arrondi à 2.5 kg
  const targetWeight = Math.ceil((currentBest1RM * 1.025) / 2.5) * 2.5

  // 8. weeksToTarget
  const weeksToTarget = Math.round(
    (targetWeight - currentBest1RM) / Math.max(0.1, weeklyGainRate),
  )

  // 9. predicted1RM dans weeksToTarget semaines
  const nowMs = Date.now()
  const predicted1RM = yMean + slopePerMs * (nowMs + weeksToTarget * MS_PER_WEEK - xMean)

  // 10. Confidence
  const confidence: PRPrediction['confidence'] =
    n < 3 ? 'low' : n <= 5 ? 'medium' : 'high'

  return {
    currentBest1RM,
    predicted1RM,
    targetWeight,
    weeksToTarget,
    weeklyGainRate,
    dataPoints: n,
    confidence,
  }
}
