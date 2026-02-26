// ─── Stats — PRs & Exercise Frequency ────────────────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { ExercisePR, ExerciseFrequency } from './statsTypes'

export function computePRsByExercise(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[]
): ExercisePR[] {
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const activeHistoryIds = new Set(
    histories.filter(h => h.deletedAt === null).map(h => h.id)
  )

  const bestByExercise = new Map<string, { weight: number; reps: number; date: number }>()
  sets
    .filter(s => s.isPr && activeHistoryIds.has(s.history.id))
    .forEach(s => {
      const exId = s.exercise.id
      const existing = bestByExercise.get(exId)
      if (!existing || s.weight > existing.weight || (s.weight === existing.weight && s.reps > existing.reps)) {
        bestByExercise.set(exId, {
          weight: s.weight,
          reps: s.reps,
          date: s.createdAt.getTime(),
        })
      }
    })

  return Array.from(bestByExercise.entries())
    .map(([exerciseId, { weight, reps, date }]) => ({
      exerciseId,
      exerciseName: exerciseNames.get(exerciseId) ?? exerciseId,
      weight,
      reps,
      date,
      orm1: Math.round(weight * (1 + reps / 30)),
    }))
    .sort((a, b) => b.date - a.date)
}

export function computeTopExercisesByFrequency(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  limit: number = 5
): ExerciseFrequency[] {
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const activeHistoryIds = new Set(
    histories.filter(h => h.deletedAt === null).map(h => h.id)
  )

  // Compter les séances uniques par exercice (1 séance = 1 historique)
  const seenPairs = new Set<string>()
  const countByExercise = new Map<string, number>()
  sets
    .filter(s => activeHistoryIds.has(s.history.id))
    .forEach(s => {
      const pair = `${s.exercise.id}:${s.history.id}`
      if (!seenPairs.has(pair)) {
        seenPairs.add(pair)
        const exId = s.exercise.id
        countByExercise.set(exId, (countByExercise.get(exId) ?? 0) + 1)
      }
    })

  return Array.from(countByExercise.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([exerciseId, count]) => ({
      exerciseId,
      exerciseName: exerciseNames.get(exerciseId) ?? exerciseId,
      count,
    }))
}
