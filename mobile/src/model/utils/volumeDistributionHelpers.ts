import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'

export interface VolumeDistributionEntry {
  muscle: string
  volume: number
  percentage: number
}

export interface VolumeDistributionResult {
  entries: VolumeDistributionEntry[]
  totalVolume: number
  balanceScore: number
  dominantMuscle: string | null
  weakestMuscle: string | null
}

export function computeVolumeDistribution(
  sets: WorkoutSet[],
  exercises: Exercise[],
  periodDays: number | null,
): VolumeDistributionResult {
  const exerciseMap = new Map<string, string[]>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.muscles)
  }

  const cutoff = periodDays !== null
    ? Date.now() - periodDays * 24 * 60 * 60 * 1000
    : 0

  const volumeByMuscle = new Map<string, number>()
  let totalVolume = 0

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
    totalVolume += volume
  }

  if (totalVolume === 0) {
    return { entries: [], totalVolume: 0, balanceScore: 0, dominantMuscle: null, weakestMuscle: null }
  }

  const entries: VolumeDistributionEntry[] = []
  for (const [muscle, volume] of volumeByMuscle) {
    entries.push({ muscle, volume, percentage: Math.round((volume / totalVolume) * 100) })
  }
  entries.sort((a, b) => b.volume - a.volume)

  // Balance score: 100 - stddev(percentages) * 5, clamped [0, 100]
  const percentages = entries.map(e => e.percentage)
  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  const variance = percentages.reduce((sum, p) => sum + (p - mean) ** 2, 0) / percentages.length
  const stddev = Math.sqrt(variance)
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - stddev * 5)))

  return {
    entries,
    totalVolume,
    balanceScore,
    dominantMuscle: entries[0]?.muscle ?? null,
    weakestMuscle: entries[entries.length - 1]?.muscle ?? null,
  }
}
