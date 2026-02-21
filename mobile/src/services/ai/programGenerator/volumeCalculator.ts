import type { UserProfile, MuscleGroup } from './types'
import {
  WEEKLY_VOLUME_TABLE,
  MUSCLES_BY_PATTERN,
  MAX_SETS_PER_MUSCLE_PER_SESSION,
  MAX_TOTAL_SETS_PER_SESSION,
} from './tables'

/**
 * Calcule le volume hebdomadaire optimal (séries) pour chaque muscle.
 *
 * Ajustements :
 * - minutesPerSession < 45 → supprime les muscles d'isolation (core, calves, traps)
 * - posturalIssues = true → boost ×1.3 sur back + glutes + core (chaîne postérieure)
 */
export function calcWeeklyVolumeByMuscle(profile: UserProfile): Record<MuscleGroup, number> {
  const { goal, level, minutesPerSession, posturalIssues } = profile
  const volumeSpec = WEEKLY_VOLUME_TABLE[goal][level]
  const baseVolume = volumeSpec.optimal

  const isolationMuscles: MuscleGroup[] = ['core', 'calves', 'traps']
  const posteriorChain: MuscleGroup[] = ['back', 'glutes', 'core']

  const allMuscles: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'calves', 'core', 'traps',
  ]

  const result = {} as Record<MuscleGroup, number>

  for (const muscle of allMuscles) {
    // Muscles d'isolation supprimés si séance courte
    if (minutesPerSession < 45 && isolationMuscles.includes(muscle)) {
      result[muscle] = 0
      continue
    }

    let volume: number = baseVolume

    // Boost chaîne postérieure
    if (posturalIssues && posteriorChain.includes(muscle)) {
      volume = Math.round(volume * 1.3)
    }

    // Les petits groupes musculaires (biceps, triceps, calves) reçoivent moins
    const smallMuscles: MuscleGroup[] = ['biceps', 'triceps', 'calves', 'traps']
    if (smallMuscles.includes(muscle)) {
      volume = Math.max(Math.round(volume * 0.7), 4)
    }

    result[muscle] = volume
  }

  return result
}

/**
 * Distribue le volume hebdomadaire sur les séances selon le planning.
 * Respecte MAX_SETS_PER_MUSCLE_PER_SESSION et MAX_TOTAL_SETS_PER_SESSION.
 *
 * Retourne un tableau (une entrée par séance) de Record<MuscleGroup, number>
 * indiquant le nombre de séries à faire pour chaque muscle dans cette séance.
 */
export function distributeVolumeToSessions(
  weeklyVolume: Record<MuscleGroup, number>,
  schedule: MuscleGroup[][],
): Record<MuscleGroup, number>[] {
  // Compte le nombre de fois que chaque muscle apparaît dans le schedule
  const muscleFrequency: Partial<Record<MuscleGroup, number>> = {}
  for (const dayMuscles of schedule) {
    for (const muscle of dayMuscles) {
      muscleFrequency[muscle] = (muscleFrequency[muscle] ?? 0) + 1
    }
  }

  return schedule.map((dayMuscles) => {
    const dayVolume = {} as Record<MuscleGroup, number>
    let totalSets = 0

    // On traite les muscles dans l'ordre : compound groups first
    const priorityOrder: MuscleGroup[] = [
      'chest', 'back', 'quads', 'hamstrings', 'glutes',
      'shoulders', 'biceps', 'triceps', 'calves', 'core', 'traps',
    ]

    const orderedMuscles = priorityOrder.filter((m) => dayMuscles.includes(m))

    for (const muscle of orderedMuscles) {
      if (totalSets >= MAX_TOTAL_SETS_PER_SESSION) {
        dayVolume[muscle] = 0
        continue
      }

      const freq = muscleFrequency[muscle] ?? 1
      const weekly = weeklyVolume[muscle] ?? 0
      // Divise le volume hebdo équitablement entre les séances où ce muscle est travaillé
      let setsForSession = Math.round(weekly / freq)
      // Respecte le plafond par muscle par séance
      setsForSession = Math.min(setsForSession, MAX_SETS_PER_MUSCLE_PER_SESSION)
      // Respecte le plafond total de la séance
      setsForSession = Math.min(setsForSession, MAX_TOTAL_SETS_PER_SESSION - totalSets)

      dayVolume[muscle] = setsForSession
      totalSets += setsForSession
    }

    return dayVolume
  })
}
