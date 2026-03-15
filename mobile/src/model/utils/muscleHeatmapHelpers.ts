import { MUSCLES_LIST } from '../constants'

export interface MuscleHeatmapEntry {
  muscle: string
  totalVolume: number    // kg (weight × reps)
  sessionCount: number   // nombre de jours distincts où le muscle a été travaillé
  intensity: number      // 0-1 normalisé (relatif au muscle le plus travaillé)
}

export type HeatmapPeriod = 7 | 14 | 30

/**
 * Calcule le volume par groupe musculaire sur une période donnée.
 * Les muscles non travaillés sont inclus en fin de liste avec intensity = 0.
 */
export function computeMuscleHeatmap(
  sets: Array<{ weight: number; reps: number; exerciseId: string; createdAt: Date | number }>,
  exercises: Array<{ id: string; muscles: string[] }>,
  periodDays: HeatmapPeriod,
): MuscleHeatmapEntry[] {
  const now = Date.now()
  const cutoff = now - periodDays * 24 * 60 * 60 * 1000

  // Map exerciseId → muscles
  const exerciseMap = new Map<string, string[]>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.muscles)
  }

  // Volume et jours distincts par muscle
  const volumeByMuscle = new Map<string, number>()
  const daysByMuscle = new Map<string, Set<string>>()

  for (const set of sets) {
    const ts = set.createdAt instanceof Date ? set.createdAt.getTime() : set.createdAt
    if (ts < cutoff) continue

    const muscles = exerciseMap.get(set.exerciseId)
    if (!muscles || muscles.length === 0) continue

    const dayKey = new Date(ts).toISOString().slice(0, 10)
    const volume = set.weight * set.reps

    for (const muscle of muscles) {
      volumeByMuscle.set(muscle, (volumeByMuscle.get(muscle) ?? 0) + volume)
      if (!daysByMuscle.has(muscle)) daysByMuscle.set(muscle, new Set())
      daysByMuscle.get(muscle)!.add(dayKey)
    }
  }

  // Volume max pour normalisation
  let maxVolume = 0
  for (const vol of volumeByMuscle.values()) {
    if (vol > maxVolume) maxVolume = vol
  }

  // Construire les entrées pour tous les muscles de MUSCLES_LIST
  const entries: MuscleHeatmapEntry[] = MUSCLES_LIST.map(muscle => {
    const totalVolume = volumeByMuscle.get(muscle) ?? 0
    const sessionCount = daysByMuscle.get(muscle)?.size ?? 0
    const intensity = maxVolume > 0 ? totalVolume / maxVolume : 0
    return { muscle, totalVolume, sessionCount, intensity }
  })

  // Trier : muscles travaillés d'abord (volume décroissant), puis non travaillés
  entries.sort((a, b) => {
    if (a.totalVolume === 0 && b.totalVolume === 0) return 0
    if (a.totalVolume === 0) return 1
    if (b.totalVolume === 0) return -1
    return b.totalVolume - a.totalVolume
  })

  return entries
}
