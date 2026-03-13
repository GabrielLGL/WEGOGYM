import WorkoutSet from '../models/Set'
import Exercise from '../models/Exercise'

export type AthleteClass = 'powerlifter' | 'bodybuilder' | 'complete' | 'polyvalent'

export interface AthleteClassResult {
  class: AthleteClass
  pushPct: number
  pullPct: number
  legsPct: number
  corePct: number
  pushPullRatio: number
  upperLowerRatio: number
}

const PUSH_MUSCLES  = ['Pecs', 'Epaules', 'Triceps']
const PULL_MUSCLES  = ['Dos', 'Biceps', 'Trapèzes']
const LEGS_MUSCLES  = ['Quadriceps', 'Ischios', 'Mollets']
const CORE_MUSCLES  = ['Abdos']

/**
 * Calcule la classe athlète depuis les sets et exercises.
 * Retourne null si moins de 20 sets au total.
 */
export function computeAthleteClass(
  sets: WorkoutSet[],
  exercises: Exercise[],
): AthleteClassResult | null {
  if (sets.length < 20) return null

  const exerciseMuscles = new Map<string, string[]>()
  for (const e of exercises) {
    exerciseMuscles.set(e.id, e.muscles)
  }

  let pushVol = 0
  let pullVol = 0
  let legsVol = 0
  let coreVol = 0

  for (const s of sets) {
    const muscles = exerciseMuscles.get(s.exercise.id) ?? []
    if (muscles.length === 0) continue
    const vol = (s.weight * s.reps) / muscles.length

    for (const muscle of muscles) {
      const m = muscle.trim()
      if (PUSH_MUSCLES.includes(m)) pushVol += vol
      else if (PULL_MUSCLES.includes(m)) pullVol += vol
      else if (LEGS_MUSCLES.includes(m)) legsVol += vol
      else if (CORE_MUSCLES.includes(m)) coreVol += vol
    }
  }

  const total = pushVol + pullVol + legsVol + coreVol
  if (total === 0) return null

  const pushPct = Math.round((pushVol / total) * 100)
  const pullPct = Math.round((pullVol / total) * 100)
  const legsPct = Math.round((legsVol / total) * 100)
  const corePct = Math.round((coreVol / total) * 100)
  const pushPullRatio = pullVol > 0 ? Math.round((pushVol / pullVol) * 10) / 10 : 1.0
  const upperLowerRatio = legsVol > 0 ? Math.round(((pushVol + pullVol) / legsVol) * 10) / 10 : 1.0

  let athleteClass: AthleteClass
  if (legsPct > 30 && Math.abs(pushPct - pullPct) < 20) {
    athleteClass = 'powerlifter'
  } else if (pushPct + pullPct > 65 && pushPct > 30) {
    athleteClass = 'bodybuilder'
  } else if (legsPct > 25 && pushPct > 20 && pullPct > 20) {
    athleteClass = 'complete'
  } else {
    athleteClass = 'polyvalent'
  }

  return { class: athleteClass, pushPct, pullPct, legsPct, corePct, pushPullRatio, upperLowerRatio }
}
