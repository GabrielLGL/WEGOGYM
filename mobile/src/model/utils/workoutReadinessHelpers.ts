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
  components: {
    recovery: number
    fatigue: number
    consistency: number
    sleep: number | null
    vitals: number | null
  }
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

/** Nombre minimum de séances sur 14+ jours pour un score fiable */
const MIN_SESSIONS = 4
const MIN_HISTORY_SPAN_MS = 14 * DAY_MS

export interface HealthConnectData {
  sleepScore: number | null   // 0-100 from sleepHelpers
  vitalsScore: number | null  // 0-100 from vitalsHelpers
}

/**
 * Calcule un score composite de readiness (0-100) avec pondérations dynamiques :
 *
 * Toutes données HC : Recovery 25% + Fatigue 25% + Sommeil 20% + HRV/HR 20% + Consistency 10%
 * Sommeil seul :       Recovery 30% + Fatigue 30% + Sommeil 25% + Consistency 15%
 * Aucune donnée HC :   Recovery 40% + Fatigue 35% + Consistency 25%
 *
 * Retourne `null` si l'historique est insuffisant (< 4 séances ou < 14 jours de données).
 */
export function computeReadiness(
  sets: SetInput[],
  exercises: ExerciseInput[],
  histories: HistoryInput[],
  healthData?: HealthConnectData,
  /** Objectif séances/semaine de l'utilisateur (default 3) */
  weeklyTarget = 3,
): ReadinessResult | null {
  // ── Guard : données insuffisantes ──
  const activeHistories = histories.filter(h => !h.isAbandoned)
  if (activeHistories.length < MIN_SESSIONS) return null

  const timestamps = activeHistories.map(h => getTs(h.startedAt))
  const span = Math.max(...timestamps) - Math.min(...timestamps)
  if (span < MIN_HISTORY_SPAN_MS) return null

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
  // Si fatigue renvoie null (données insuffisantes), readiness l'est aussi (guard en amont)
  if (!fatigueResult) return null
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

  // ── 3. Consistency (personnalisé vs weeklyTarget) ──
  // Compare le rythme réel sur 14 jours vs l'objectif de l'utilisateur
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
  const expectedIn14d = weeklyTarget * 2 // objectif sur 2 semaines
  let consistencyScore: number
  if (expectedIn14d === 0) {
    consistencyScore = 50
  } else {
    const ratio = dayCount / expectedIn14d
    if (ratio >= 1.3) {
      consistencyScore = 80 // Au-dessus de l'objectif — léger retrait (surentraînement potentiel)
    } else if (ratio >= 0.9) {
      consistencyScore = 95 // Dans la cible
    } else if (ratio >= 0.7) {
      consistencyScore = 70 // Légèrement en dessous
    } else if (ratio >= 0.4) {
      consistencyScore = 45 // Nettement en dessous
    } else {
      consistencyScore = 20 // Très irrégulier
    }
  }

  // ── Score final — pondérations dynamiques ──
  const sleepScore = healthData?.sleepScore ?? null
  const vitalsScore = healthData?.vitalsScore ?? null
  const hasSleep = sleepScore != null
  const hasVitals = vitalsScore != null

  let score: number
  if (hasSleep && hasVitals) {
    // All HC data: Recovery 25% + Fatigue 25% + Sleep 20% + Vitals 20% + Consistency 10%
    score = recoveryScore * 0.25 + fatigueScore * 0.25 + sleepScore * 0.20 + vitalsScore * 0.20 + consistencyScore * 0.10
  } else if (hasSleep) {
    // Sleep only: Recovery 30% + Fatigue 30% + Sleep 25% + Consistency 15%
    score = recoveryScore * 0.30 + fatigueScore * 0.30 + sleepScore * 0.25 + consistencyScore * 0.15
  } else if (hasVitals) {
    // Vitals only: Recovery 30% + Fatigue 30% + Vitals 25% + Consistency 15%
    score = recoveryScore * 0.30 + fatigueScore * 0.30 + vitalsScore * 0.25 + consistencyScore * 0.15
  } else {
    // No HC data: original weights
    score = recoveryScore * 0.40 + fatigueScore * 0.35 + consistencyScore * 0.25
  }

  score = Math.round(score)
  const level = getLevel(score)

  return {
    score,
    level,
    components: {
      recovery: Math.round(recoveryScore),
      fatigue: Math.round(fatigueScore),
      consistency: Math.round(consistencyScore),
      sleep: sleepScore != null ? Math.round(sleepScore) : null,
      vitals: vitalsScore != null ? Math.round(vitalsScore) : null,
    },
    recommendation: `home.readiness.recommendations.${level}`,
  }
}
