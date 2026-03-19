import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'

// ─── Types ───────────────────────────────────────────────────────────────────

export type RestRecommendation = 'short' | 'optimal' | 'long'

export interface RestTimeEntry {
  exerciseId: string
  exerciseName: string
  averageRest: number
  minRest: number
  maxRest: number
  sampleCount: number
  recommendation: RestRecommendation
}

export interface RestTimeResult {
  entries: RestTimeEntry[]
  globalAverage: number
  totalSamples: number
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const MIN_REST_SECONDS = 10
const MAX_REST_SECONDS = 600

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRecommendation(avgSeconds: number): RestRecommendation {
  if (avgSeconds < 60) return 'short'
  if (avgSeconds <= 180) return 'optimal'
  return 'long'
}

export function formatRestTime(seconds: number): string {
  const rounded = Math.round(seconds)
  if (rounded >= 60) {
    const m = Math.floor(rounded / 60)
    const s = rounded % 60
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  return `${rounded}s`
}

// ─── Calcul principal ────────────────────────────────────────────────────────

export function computeRestTimeAnalysis(
  sets: WorkoutSet[],
  exercises: Exercise[],
): RestTimeResult | null {
  // Index exercices par id
  const exerciseMap = new Map<string, string>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.name)
  }

  // Grouper les sets par historyId
  const byHistory = new Map<string, WorkoutSet[]>()
  for (const s of sets) {
    const group = byHistory.get(s.historyId)
    if (group) {
      group.push(s)
    } else {
      byHistory.set(s.historyId, [s])
    }
  }

  // Calculer les deltas par exercice
  const deltasByExercise = new Map<string, number[]>()

  for (const group of byHistory.values()) {
    // Trier par createdAt
    const sorted = group.slice().sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]

      // Seulement les sets du même exercice dans la même séance
      if (prev.exerciseId !== curr.exerciseId) continue

      const deltaSec = (curr.createdAt.getTime() - prev.createdAt.getTime()) / 1000

      // Filtrer les aberrations
      if (deltaSec < MIN_REST_SECONDS || deltaSec > MAX_REST_SECONDS) continue

      const deltas = deltasByExercise.get(curr.exerciseId)
      if (deltas) {
        deltas.push(deltaSec)
      } else {
        deltasByExercise.set(curr.exerciseId, [deltaSec])
      }
    }
  }

  if (deltasByExercise.size === 0) return null

  // Construire les entries
  const entries: RestTimeEntry[] = []
  let totalSum = 0
  let totalCount = 0

  for (const [exerciseId, deltas] of deltasByExercise) {
    const sum = deltas.reduce((a, b) => a + b, 0)
    const avg = sum / deltas.length
    const min = Math.min(...deltas)
    const max = Math.max(...deltas)

    totalSum += sum
    totalCount += deltas.length

    entries.push({
      exerciseId,
      exerciseName: exerciseMap.get(exerciseId) ?? exerciseId,
      averageRest: avg,
      minRest: min,
      maxRest: max,
      sampleCount: deltas.length,
      recommendation: getRecommendation(avg),
    })
  }

  // Trier par sampleCount décroissant
  entries.sort((a, b) => b.sampleCount - a.sampleCount)

  return {
    entries,
    globalAverage: totalSum / totalCount,
    totalSamples: totalCount,
  }
}
