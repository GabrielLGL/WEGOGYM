import { EPLEY_FORMULA_DIVISOR } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StrengthLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite'

export interface StrengthBenchmark {
  exerciseName: string
  exercisePatterns: string[]
  /** Multiplier du poids corporel par niveau (homme, approximatif) */
  standards: Record<StrengthLevel, number>
}

export interface StrengthResult {
  exerciseName: string
  matchedExerciseId: string | null
  estimated1RM: number | null
  bodyweightRatio: number | null
  level: StrengthLevel | null
  nextLevelThreshold: number | null
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

export const STRENGTH_BENCHMARKS: StrengthBenchmark[] = [
  {
    exerciseName: 'Développé couché',
    exercisePatterns: ['développé couché', 'bench press', 'dev couché', 'dc barre'],
    standards: { beginner: 0.5, novice: 0.75, intermediate: 1.0, advanced: 1.25, elite: 1.5 },
  },
  {
    exerciseName: 'Squat',
    exercisePatterns: ['squat', 'squat barre', 'back squat'],
    standards: { beginner: 0.75, novice: 1.0, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
  },
  {
    exerciseName: 'Soulevé de terre',
    exercisePatterns: ['soulevé de terre', 'deadlift', 'sdt'],
    standards: { beginner: 1.0, novice: 1.25, intermediate: 1.5, advanced: 2.0, elite: 2.75 },
  },
  {
    exerciseName: 'Développé militaire',
    exercisePatterns: ['développé militaire', 'overhead press', 'ohp', 'dev militaire'],
    standards: { beginner: 0.35, novice: 0.5, intermediate: 0.65, advanced: 0.85, elite: 1.1 },
  },
  {
    exerciseName: 'Rowing barre',
    exercisePatterns: ['rowing barre', 'barbell row', 'rowing'],
    standards: { beginner: 0.5, novice: 0.65, intermediate: 0.85, advanced: 1.1, elite: 1.4 },
  },
]

export const LEVEL_ORDER: StrengthLevel[] = ['beginner', 'novice', 'intermediate', 'advanced', 'elite']

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trouve l'exercice correspondant au benchmark via pattern matching case-insensitive.
 * @returns exerciseId ou null si pas de match
 */
export function matchExercise(
  benchmark: StrengthBenchmark,
  exercises: Array<{ id: string; name: string }>,
): string | null {
  for (const pattern of benchmark.exercisePatterns) {
    const match = exercises.find(ex => ex.name.toLowerCase().includes(pattern))
    if (match) return match.id
  }
  return null
}

/**
 * Calcule les standards de force pour chaque benchmark.
 * Utilise la formule Epley pour estimer le 1RM depuis les séries historiques.
 */
export function computeStrengthStandards(
  exercises: Array<{ id: string; name: string }>,
  sets: Array<{ weight: number; reps: number; exerciseId: string }>,
  bodyweight: number | null,
): StrengthResult[] {
  return STRENGTH_BENCHMARKS.map(benchmark => {
    const exerciseId = matchExercise(benchmark, exercises)

    if (!exerciseId) {
      return {
        exerciseName: benchmark.exerciseName,
        matchedExerciseId: null,
        estimated1RM: null,
        bodyweightRatio: null,
        level: null,
        nextLevelThreshold: null,
      }
    }

    // Calculer le 1RM max via formule Epley pour tous les sets de cet exercice
    const exerciseSets = sets.filter(s => s.exerciseId === exerciseId)
    let max1RM: number | null = null

    for (const set of exerciseSets) {
      if (set.weight > 0 && set.reps > 0) {
        const orm = set.weight * (1 + set.reps / EPLEY_FORMULA_DIVISOR)
        if (max1RM === null || orm > max1RM) {
          max1RM = orm
        }
      }
    }

    if (max1RM === null) {
      return {
        exerciseName: benchmark.exerciseName,
        matchedExerciseId: exerciseId,
        estimated1RM: null,
        bodyweightRatio: null,
        level: null,
        nextLevelThreshold: null,
      }
    }

    // Si pas de poids corporel, on retourne juste le 1RM sans niveau
    if (!bodyweight || bodyweight <= 0) {
      return {
        exerciseName: benchmark.exerciseName,
        matchedExerciseId: exerciseId,
        estimated1RM: Math.round(max1RM * 10) / 10,
        bodyweightRatio: null,
        level: null,
        nextLevelThreshold: null,
      }
    }

    const ratio = max1RM / bodyweight

    // Déterminer le niveau atteint
    let level: StrengthLevel = 'beginner'
    for (const lvl of LEVEL_ORDER) {
      if (ratio >= benchmark.standards[lvl]) {
        level = lvl
      }
    }

    // Prochain niveau
    const currentIdx = LEVEL_ORDER.indexOf(level)
    const nextLevel = currentIdx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentIdx + 1] : null
    const nextLevelThreshold = nextLevel
      ? Math.round(bodyweight * benchmark.standards[nextLevel] * 10) / 10
      : null

    return {
      exerciseName: benchmark.exerciseName,
      matchedExerciseId: exerciseId,
      estimated1RM: Math.round(max1RM * 10) / 10,
      bodyweightRatio: Math.round(ratio * 100) / 100,
      level,
      nextLevelThreshold,
    }
  })
}
