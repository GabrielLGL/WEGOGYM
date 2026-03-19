/**
 * workoutReadinessHelpers — Score de readiness composite (récupération + fatigue + régularité)
 *
 * Éphémère — aucune persistance DB, calculé à la volée.
 */

import { computeMuscleRecovery } from './muscleRecoveryHelpers'
import { computeFatigueIndex } from './fatigueIndexHelpers'

export type ReadinessLevel = 'optimal' | 'good' | 'moderate' | 'low'

export interface ReadinessResult {
  /** 0-100 */
  score: number
  level: ReadinessLevel
  components: { recovery: number; fatigue: number; consistency: number }
  recommendation: string
}

interface SetInput {
  weight: number
  reps: number
  exerciseId: string
  createdAt: Date | number
}

interface ExerciseInput {
  id: string
  muscles: string[]
}

interface HistoryInput {
  startedAt: Date | number
  isAbandoned: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function getTs(d: Date | number): number {
  return d instanceof Date ? d.getTime() : d
}

function getLevel(score: number): ReadinessLevel {
  if (score >= 80) return 'optimal'
  if (score >= 60) return 'good'
  if (score >= 40) return 'moderate'
  return 'low'
}

/**
 * Calcule un score composite de readiness (0-100) à partir de :
 * - Récupération musculaire (40%)
 * - Indice de fatigue ACWR (35%)
 * - Régularité d'entraînement (25%)
 */
export function computeReadiness(
  sets: SetInput[],
  exercises: ExerciseInput[],
  histories: HistoryInput[],
): ReadinessResult {
  // ── 1. Recovery (40%) ──
  const recoveryEntries = computeMuscleRecovery(sets, exercises)
  let recoveryScore: number
  if (recoveryEntries.length === 0) {
    recoveryScore = 100
  } else {
    const sum = recoveryEntries.reduce((acc, e) => acc + e.recoveryPercent, 0)
    recoveryScore = sum / recoveryEntries.length
  }

  // ── 2. Fatigue (35%) — ACWR ratio mapping ──
  const fatigueHistories = histories.map(h => ({
    createdAt: h.startedAt,
    deletedAt: null as Date | null,
    isAbandoned: h.isAbandoned,
  }))
  const fatigueSets = sets.map(s => ({
    weight: s.weight,
    reps: s.reps,
    createdAt: s.createdAt,
  }))
  const fatigueResult = computeFatigueIndex(fatigueSets, fatigueHistories)
  const ratio = fatigueResult.ratio
  let fatigueScore: number
  if (ratio < 0.8) {
    fatigueScore = 90
  } else if (ratio <= 1.3) {
    fatigueScore = 70
  } else if (ratio <= 1.5) {
    fatigueScore = 40
  } else {
    fatigueScore = 15
  }

  // ── 3. Consistency (25%) — jours d'entraînement sur 14 derniers jours ──
  const now = Date.now()
  const fourteenDaysAgo = now - 14 * DAY_MS
  const recentDays = new Set<number>()
  for (const h of histories) {
    if (h.isAbandoned) continue
    const ts = getTs(h.startedAt)
    if (ts >= fourteenDaysAgo) {
      recentDays.add(Math.floor(ts / DAY_MS))
    }
  }
  const dayCount = recentDays.size
  let consistencyScore: number
  if (dayCount === 0) {
    consistencyScore = 20
  } else if (dayCount <= 2) {
    consistencyScore = 40
  } else if (dayCount <= 4) {
    consistencyScore = 70
  } else if (dayCount <= 6) {
    consistencyScore = 90
  } else {
    consistencyScore = 80
  }

  // ── Score final ──
  const score = Math.round(
    recoveryScore * 0.40 + fatigueScore * 0.35 + consistencyScore * 0.25,
  )
  const level = getLevel(score)

  return {
    score,
    level,
    components: {
      recovery: Math.round(recoveryScore),
      fatigue: Math.round(fatigueScore),
      consistency: Math.round(consistencyScore),
    },
    recommendation: `home.readiness.recommendations.${level}`,
  }
}
