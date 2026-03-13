import type Exercise from '../models/Exercise'
import type WorkoutSet from '../models/Set'
import { WEEK_MS } from '../constants'

export interface ExerciseOfWeekResult {
  exercise: Exercise
  lastDoneMs: number | null
  daysSinceLastDone: number | null
  isNew: boolean
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Sélectionne l'exercice de la semaine de façon déterministe.
 * Priorité : exercices jamais faits > non faits depuis 30j > le moins récent.
 * Change chaque semaine (basé sur weekIndex), reste fixe pendant la semaine.
 * Retourne null si < 5 exercices disponibles.
 */
export function computeExerciseOfWeek(
  exercises: Exercise[],
  sets: WorkoutSet[],
): ExerciseOfWeekResult | null {
  if (exercises.length < 5) return null

  // 1. Construire map exerciseId → dernière date
  const lastUsed = new Map<string, number>()
  for (const set of sets) {
    const exId = set.exerciseId
    if (!exId) continue
    const t = set.createdAt?.getTime() ?? 0
    const current = lastUsed.get(exId) ?? 0
    if (t > current) lastUsed.set(exId, t)
  }

  const now = Date.now()

  // 2. Catégoriser
  const newExercises = exercises.filter(e => !lastUsed.has(e.id))
  const staleExercises = exercises.filter(e => {
    const last = lastUsed.get(e.id)
    return last !== undefined && (now - last) > THIRTY_DAYS_MS
  })

  const candidates = newExercises.length > 0
    ? newExercises
    : staleExercises.length > 0
    ? staleExercises
    : [...exercises].sort((a, b) => (lastUsed.get(a.id) ?? 0) - (lastUsed.get(b.id) ?? 0))

  // 3. Sélection déterministe par semaine
  const weekIndex = Math.floor(now / WEEK_MS)
  const chosen = candidates[weekIndex % candidates.length]
  const lastMs = lastUsed.get(chosen.id) ?? null
  const daysSince = lastMs !== null ? Math.floor((now - lastMs) / DAY_MS) : null

  return {
    exercise: chosen,
    lastDoneMs: lastMs,
    daysSinceLastDone: daysSince,
    isNew: !lastUsed.has(chosen.id),
  }
}
