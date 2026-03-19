import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'

export interface MusclePair {
  nameKey: string
  left: string[]
  right: string[]
  leftVolume: number
  rightVolume: number
  ratio: number
  status: 'balanced' | 'slight' | 'imbalanced'
}

export interface MuscleBalanceResult {
  pairs: MusclePair[]
  overallBalance: number
}

const PAIR_DEFINITIONS: { nameKey: string; left: string[]; right: string[] }[] = [
  { nameKey: 'pushPull', left: ['Pecs', 'Epaules', 'Triceps'], right: ['Dos', 'Trapèzes', 'Biceps'] },
  { nameKey: 'quadsHams', left: ['Quadriceps'], right: ['Ischios'] },
  { nameKey: 'bicepsTriceps', left: ['Biceps'], right: ['Triceps'] },
  { nameKey: 'upperLower', left: ['Pecs', 'Dos', 'Epaules', 'Trapèzes', 'Biceps', 'Triceps'], right: ['Quadriceps', 'Ischios', 'Mollets', 'Abdos'] },
]

function getStatus(ratio: number): 'balanced' | 'slight' | 'imbalanced' {
  if (ratio >= 0.8 && ratio <= 1.2) return 'balanced'
  if (ratio >= 0.6 && ratio <= 1.5) return 'slight'
  return 'imbalanced'
}

export function computeMuscleBalance(
  sets: WorkoutSet[],
  exercises: Exercise[],
  periodDays: number | null,
): MuscleBalanceResult {
  const exerciseMap = new Map<string, string[]>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.muscles)
  }

  const cutoff = periodDays !== null
    ? Date.now() - periodDays * 24 * 60 * 60 * 1000
    : 0

  const volumeByMuscle = new Map<string, number>()

  for (const s of sets) {
    if (periodDays !== null && s.createdAt.getTime() < cutoff) continue

    const muscles = exerciseMap.get(s.exerciseId)
    if (!muscles || muscles.length === 0) continue

    const volume = s.weight * s.reps
    if (volume <= 0) continue

    const share = volume / muscles.length
    for (const m of muscles) {
      volumeByMuscle.set(m, (volumeByMuscle.get(m) ?? 0) + share)
    }
  }

  const pairs: MusclePair[] = PAIR_DEFINITIONS.map(def => {
    let leftVolume = 0
    let rightVolume = 0
    for (const m of def.left) leftVolume += volumeByMuscle.get(m) ?? 0
    for (const m of def.right) rightVolume += volumeByMuscle.get(m) ?? 0

    const ratio = rightVolume > 0 ? leftVolume / rightVolume : leftVolume > 0 ? 2 : 1
    return {
      nameKey: def.nameKey,
      left: def.left,
      right: def.right,
      leftVolume,
      rightVolume,
      ratio: Math.round(ratio * 100) / 100,
      status: getStatus(ratio),
    }
  })

  // overallBalance: average of normalized ratios (closer to 1.0 = better), scaled 0-100
  const ratioScores = pairs.map(p => {
    const deviation = Math.abs(p.ratio - 1)
    return Math.max(0, 1 - deviation)
  })
  const overallBalance = ratioScores.length > 0
    ? Math.round((ratioScores.reduce((sum, s) => sum + s, 0) / ratioScores.length) * 100)
    : 0

  return { pairs, overallBalance }
}
