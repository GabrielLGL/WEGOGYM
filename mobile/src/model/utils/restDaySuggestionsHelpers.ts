/**
 * restDaySuggestionsHelpers — Suggestions intelligentes de jours de repos
 *
 * Analyse le pattern d'entraînement, la fatigue accumulée et les muscles
 * sollicités pour recommander quand prendre un jour de repos.
 *
 * Éphémère — aucune persistance DB, calculé à la volée.
 */

import { computeFatigueIndex } from './fatigueIndexHelpers'
import { computeMuscleRecovery } from './muscleRecoveryHelpers'

export interface RestSuggestion {
  shouldRest: boolean
  confidence: 'high' | 'medium' | 'low'
  reason: string
  consecutiveDays: number
  musclesTired: string[]
  fatigueLevel: 'low' | 'moderate' | 'high' | 'critical'
  suggestion: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function getTs(d: Date | number): number {
  return d instanceof Date ? d.getTime() : d
}

/**
 * Compte le nombre de jours d'entraînement consécutifs (sans repos)
 * en remontant depuis aujourd'hui.
 */
function countConsecutiveTrainingDays(
  histories: Array<{ startedAt: Date | number; isAbandoned: boolean }>,
): number {
  const active = histories.filter(h => !h.isAbandoned)
  if (active.length === 0) return 0

  // Collecter les dates uniques de séances (YYYY-MM-DD)
  const trainingDays = new Set<string>()
  for (const h of active) {
    const d = new Date(getTs(h.startedAt))
    trainingDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
  }

  // Remonter jour par jour depuis hier (aujourd'hui n'est pas encore fini)
  const now = new Date()
  let consecutive = 0

  // Si entraînement aujourd'hui, compter aujourd'hui
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const startFromToday = trainingDays.has(todayKey)

  for (let i = startFromToday ? 0 : 1; i < 30; i++) {
    const d = new Date(now.getTime() - i * DAY_MS)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (trainingDays.has(key)) {
      consecutive++
    } else {
      break
    }
  }

  return consecutive
}

function getFatigueLevel(ratio: number): RestSuggestion['fatigueLevel'] {
  if (ratio > 1.5) return 'critical'
  if (ratio > 1.3) return 'high'
  if (ratio > 1.0) return 'moderate'
  return 'low'
}

/**
 * Détermine si un jour de repos est recommandé.
 *
 * Algorithme :
 * 1. Compter les jours d'entraînement consécutifs (sans repos)
 * 2. Calculer la fatigue via computeFatigueIndex (ACWR)
 * 3. Lister les muscles sous 50% de récupération via computeMuscleRecovery
 * 4. Décision basée sur les seuils combinés
 * 5. Suggestion spécifique selon la confiance
 */
export function computeRestSuggestion(
  histories: Array<{ startedAt: Date | number; isAbandoned: boolean }>,
  sets: Array<{ weight: number; reps: number; exerciseId: string; createdAt: Date | number }>,
  exercises: Array<{ id: string; muscles: string[] }>,
): RestSuggestion {
  const consecutiveDays = countConsecutiveTrainingDays(histories)

  // Adapter les données pour computeFatigueIndex (il attend createdAt + deletedAt)
  const fatigueHistories = histories.map(h => ({
    createdAt: h.startedAt,
    deletedAt: null,
    isAbandoned: h.isAbandoned,
  }))
  const fatigueSets = sets.map(s => ({
    weight: s.weight,
    reps: s.reps,
    createdAt: s.createdAt,
  }))
  const fatigueResult = computeFatigueIndex(fatigueSets, fatigueHistories)
  const acwr = fatigueResult.ratio

  // Muscles sous 50% de récupération
  const recoveryEntries = computeMuscleRecovery(sets, exercises)
  const musclesTired = recoveryEntries
    .filter(e => e.recoveryPercent < 50)
    .map(e => e.muscle)

  const fatigueLevel = getFatigueLevel(acwr)

  // ── Décision ──
  // Priorité décroissante
  if (consecutiveDays >= 5) {
    return {
      shouldRest: true,
      confidence: 'high',
      reason: 'tooManyDays',
      consecutiveDays,
      musclesTired,
      fatigueLevel,
      suggestion: 'takeFullRest',
    }
  }

  if (acwr > 1.5) {
    return {
      shouldRest: true,
      confidence: 'high',
      reason: 'highFatigue',
      consecutiveDays,
      musclesTired,
      fatigueLevel,
      suggestion: 'takeFullRest',
    }
  }

  if (acwr > 1.3 && consecutiveDays >= 3) {
    return {
      shouldRest: true,
      confidence: 'medium',
      reason: 'accumulatedFatigue',
      consecutiveDays,
      musclesTired,
      fatigueLevel,
      suggestion: 'lightActivity',
    }
  }

  if (musclesTired.length > 3) {
    return {
      shouldRest: true,
      confidence: 'medium',
      reason: 'muscleRecovery',
      consecutiveDays,
      musclesTired,
      fatigueLevel,
      suggestion: 'lightActivity',
    }
  }

  if (consecutiveDays >= 3 && musclesTired.length > 1) {
    return {
      shouldRest: true,
      confidence: 'low',
      reason: 'mildFatigue',
      consecutiveDays,
      musclesTired,
      fatigueLevel,
      suggestion: 'optionalRest',
    }
  }

  // Pas de repos nécessaire
  return {
    shouldRest: false,
    confidence: 'low',
    reason: 'readyToTrain',
    consecutiveDays,
    musclesTired,
    fatigueLevel,
    suggestion: 'readyToTrain',
  }
}
