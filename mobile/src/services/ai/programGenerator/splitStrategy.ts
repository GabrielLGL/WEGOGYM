import type { UserProfile, SplitType, MuscleGroup } from './types'
import { SPLIT_BY_FREQUENCY, MUSCLES_BY_PATTERN } from './tables'

/**
 * Détermine le split optimal selon fréquence, objectif et niveau.
 *
 * Règles (priorité décroissante) :
 * 1. Débutant + daysPerWeek ≤ 4 → toujours 'full_body'
 * 2. Strength + advanced + daysPerWeek ≥ 4 → 'split'
 * 3. Strength + (intermediate|advanced) + daysPerWeek ≥ 5 → 'push_pull_legs'
 * 4. daysPerWeek = 4 + (intermediate|advanced) → 'half_body'
 * 5. Par défaut → SPLIT_BY_FREQUENCY[daysPerWeek]
 */
export function determineSplit(profile: UserProfile): SplitType {
  const { goal, level, daysPerWeek } = profile

  if (level === 'beginner' && daysPerWeek <= 4) return 'full_body'

  if (goal === 'strength' && level === 'advanced' && daysPerWeek >= 4) return 'split'

  if (goal === 'strength' && level !== 'beginner' && daysPerWeek >= 5) return 'push_pull_legs'

  if (daysPerWeek === 4 && level !== 'beginner') return 'half_body'

  return SPLIT_BY_FREQUENCY[daysPerWeek] ?? 'full_body'
}

/**
 * Retourne la liste des muscles cibles pour chaque séance de la semaine.
 *
 * Ex : PPL 6j → [[chest,shoulders,triceps], [back,biceps,traps], [quads,hamstrings,glutes,calves], ...]
 * Ex : full_body 3j → [[chest,back,shoulders,biceps,triceps,quads,hamstrings,glutes,calves,core], ...]
 * Ex : half_body 4j → [[chest,shoulders,triceps,core], [back,biceps,traps,quads,hamstrings,glutes,calves], ...]
 * Ex : split 4j → jour1: push, jour2: pull, jour3: legs, jour4: push (rotation)
 */
export function buildWeeklySchedule(split: SplitType, daysPerWeek: number): MuscleGroup[][] {
  const push = MUSCLES_BY_PATTERN.push
  const pull = MUSCLES_BY_PATTERN.pull
  const legs = MUSCLES_BY_PATTERN.legs
  const core = MUSCLES_BY_PATTERN.core
  const upper: MuscleGroup[] = [...push, ...pull]
  const lower: MuscleGroup[] = [...legs, ...core]
  const allMuscles: MuscleGroup[] = [...upper, ...lower]

  switch (split) {
    case 'full_body':
      return Array.from({ length: daysPerWeek }, () => allMuscles)

    case 'half_body': {
      const pattern: MuscleGroup[][] = [
        [...push, ...core],
        [...pull, ...legs],
      ]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 2])
    }

    case 'push_pull': {
      const pattern: MuscleGroup[][] = [push, pull]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 2])
    }

    case 'push_pull_legs': {
      const pattern: MuscleGroup[][] = [push, pull, legs]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 3])
    }

    case 'split': {
      // Jour 1: chest+triceps, Jour 2: back+biceps, Jour 3: legs, Jour 4: shoulders+traps
      const pattern: MuscleGroup[][] = [
        ['chest', 'triceps', 'core'],
        ['back', 'biceps', 'traps'],
        ['quads', 'hamstrings', 'glutes', 'calves'],
        ['shoulders', 'traps', 'core'],
      ]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % pattern.length])
    }

    default:
      return Array.from({ length: daysPerWeek }, () => allMuscles)
  }
}
