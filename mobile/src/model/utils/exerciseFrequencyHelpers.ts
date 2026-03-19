import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type History from '../models/History'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrequencyTrend = 'increasing' | 'decreasing' | 'stable'

export interface ExerciseFrequencyEntry {
  exerciseId: string
  exerciseName: string
  muscles: string[]
  count: number
  lastPerformed: Date | null
  daysSinceLastPerformed: number | null
  trend: FrequencyTrend
}

export interface ExerciseFrequencyResult {
  entries: ExerciseFrequencyEntry[]
  totalExercisesUsed: number
  mostFrequent: ExerciseFrequencyEntry | null
  leastFrequent: ExerciseFrequencyEntry | null
  neglected: ExerciseFrequencyEntry[]
}

// ─── Compute ──────────────────────────────────────────────────────────────────

const NEGLECTED_DAYS = 30
const MS_PER_DAY = 86_400_000

/**
 * Calcule la fréquence d'utilisation de chaque exercice sur une période donnée.
 * @param sets       Toutes les séries (déjà filtrées sur histories valides)
 * @param exercises  Tous les exercices
 * @param histories  Toutes les histories (déjà filtrées non-supprimées/non-abandonnées)
 * @param periodDays Nombre de jours (0 = tout)
 */
export function computeExerciseFrequency(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  periodDays: number,
): ExerciseFrequencyResult | null {
  if (sets.length === 0 || exercises.length === 0 || histories.length === 0) {
    return null
  }

  const now = Date.now()
  const cutoff = periodDays > 0 ? now - periodDays * MS_PER_DAY : 0

  // Build history lookup: id → startTime
  const historyMap = new Map<string, number>()
  for (const h of histories) {
    const ts = h.startTime?.getTime?.() ?? 0
    if (ts > 0 && (cutoff === 0 || ts >= cutoff)) {
      historyMap.set(h.id, ts)
    }
  }

  // Midpoint for trend calculation
  const midpoint = periodDays > 0
    ? now - (periodDays / 2) * MS_PER_DAY
    : 0

  // Per-exercise aggregation
  interface Agg {
    historyIds: Set<string>
    lastTs: number
    firstHalfCount: number
    secondHalfCount: number
  }
  const aggMap = new Map<string, Agg>()

  for (const s of sets) {
    const hTs = historyMap.get(s.historyId)
    if (hTs === undefined) continue

    let agg = aggMap.get(s.exerciseId)
    if (!agg) {
      agg = { historyIds: new Set(), lastTs: 0, firstHalfCount: 0, secondHalfCount: 0 }
      aggMap.set(s.exerciseId, agg)
    }

    // Count unique sessions (history IDs) per exercise
    if (!agg.historyIds.has(s.historyId)) {
      agg.historyIds.add(s.historyId)
      if (midpoint > 0) {
        if (hTs < midpoint) agg.firstHalfCount++
        else agg.secondHalfCount++
      }
    }

    if (hTs > agg.lastTs) agg.lastTs = hTs
  }

  if (aggMap.size === 0) return null

  // Exercise lookup
  const exerciseMap = new Map<string, Exercise>()
  for (const e of exercises) exerciseMap.set(e.id, e)

  // Build entries
  const entries: ExerciseFrequencyEntry[] = []

  for (const [exId, agg] of aggMap) {
    const exercise = exerciseMap.get(exId)
    if (!exercise) continue

    const count = agg.historyIds.size
    const lastPerformed = agg.lastTs > 0 ? new Date(agg.lastTs) : null
    const daysSince = agg.lastTs > 0 ? Math.floor((now - agg.lastTs) / MS_PER_DAY) : null

    let trend: FrequencyTrend = 'stable'
    if (midpoint > 0 && count >= 2) {
      if (agg.secondHalfCount > agg.firstHalfCount) trend = 'increasing'
      else if (agg.secondHalfCount < agg.firstHalfCount) trend = 'decreasing'
    }

    entries.push({
      exerciseId: exId,
      exerciseName: exercise.name,
      muscles: exercise.muscles,
      count,
      lastPerformed,
      daysSinceLastPerformed: daysSince,
      trend,
    })
  }

  // Sort by count descending
  entries.sort((a, b) => b.count - a.count)

  const neglected = entries.filter(
    e => e.daysSinceLastPerformed === null || e.daysSinceLastPerformed > NEGLECTED_DAYS,
  )

  return {
    entries,
    totalExercisesUsed: entries.length,
    mostFrequent: entries[0] ?? null,
    leastFrequent: entries[entries.length - 1] ?? null,
    neglected,
  }
}
