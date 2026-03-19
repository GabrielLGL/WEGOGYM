import type Exercise from '../models/Exercise'
import type Set from '../models/Set'

export interface ExerciseMastery {
  exerciseId: string
  level: 0 | 1 | 2 | 3 | 4 | 5
  totalSets: number
  distinctRepRanges: number
  hasProgression: boolean
  score: number
}

const REP_RANGES = [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 20],
  [21, Infinity],
] as const

function classifyRepRange(reps: number): number {
  for (let i = 0; i < REP_RANGES.length; i++) {
    if (reps >= REP_RANGES[i][0] && reps <= REP_RANGES[i][1]) return i
  }
  return 0
}

function scoreToLevel(score: number): ExerciseMastery['level'] {
  if (score === 0) return 0
  if (score < 20) return 1
  if (score < 40) return 2
  if (score < 60) return 3
  if (score < 80) return 4
  return 5
}

export function computeExerciseMastery(
  exercises: Exercise[],
  sets: Set[],
): Map<string, ExerciseMastery> {
  const setsByExercise = new Map<string, Set[]>()
  for (const s of sets) {
    const list = setsByExercise.get(s.exerciseId)
    if (list) {
      list.push(s)
    } else {
      setsByExercise.set(s.exerciseId, [s])
    }
  }

  const result = new Map<string, ExerciseMastery>()

  for (const exercise of exercises) {
    const exSets = setsByExercise.get(exercise.id)
    if (!exSets || exSets.length === 0) {
      result.set(exercise.id, {
        exerciseId: exercise.id,
        level: 0,
        totalSets: 0,
        distinctRepRanges: 0,
        hasProgression: false,
        score: 0,
      })
      continue
    }

    const totalSets = exSets.length

    // Distinct rep ranges
    const repRangeSet = new globalThis.Set<number>()
    for (const s of exSets) {
      repRangeSet.add(classifyRepRange(s.reps))
    }
    const distinctRepRanges = repRangeSet.size

    // Progression: average weight of 2nd half > 1st half
    const setsWithWeight = exSets.filter(s => s.weight > 0)
    let hasProgression = false
    if (setsWithWeight.length >= 4) {
      const mid = Math.floor(setsWithWeight.length / 2)
      const firstHalf = setsWithWeight.slice(0, mid)
      const secondHalf = setsWithWeight.slice(mid)
      const avgFirst = firstHalf.reduce((sum, s) => sum + s.weight, 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((sum, s) => sum + s.weight, 0) / secondHalf.length
      hasProgression = avgSecond > avgFirst
    }

    // Score calculation
    const setsScore = Math.min(40, totalSets * 2)
    const varietyScore = Math.min(30, distinctRepRanges * 10)
    const progressionScore = hasProgression ? 30 : 0
    const score = setsScore + varietyScore + progressionScore
    const level = scoreToLevel(score)

    result.set(exercise.id, {
      exerciseId: exercise.id,
      level,
      totalSets,
      distinctRepRanges,
      hasProgression,
      score,
    })
  }

  return result
}
