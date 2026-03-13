import User from '../models/User'

export interface TitleDefinition {
  id: string
  icon: string
  unlocked: boolean
}

const TITLE_IDS = [
  'first_steps',
  'regular',
  'iron_will',
  'veteran',
  'centurion',
  'pr_hunter',
  'record_breaker',
  'tonnage_lifter',
  'tonnage_master',
  'explorer',
  'exercise_master',
  'level_10',
  'level_25',
  'level_50',
  'elite',
] as const

type TitleId = (typeof TITLE_IDS)[number]

const TITLE_ICONS: Record<TitleId, string> = {
  first_steps:      'footsteps-outline',
  regular:          'calendar-outline',
  iron_will:        'flame-outline',
  veteran:          'shield-outline',
  centurion:        'shield-checkmark-outline',
  pr_hunter:        'search-outline',
  record_breaker:   'trending-up-outline',
  tonnage_lifter:   'barbell-outline',
  tonnage_master:   'trophy-outline',
  explorer:         'compass-outline',
  exercise_master:  'star-outline',
  level_10:         'ribbon-outline',
  level_25:         'medal-outline',
  level_50:         'diamond-outline',
  elite:            'flash-outline',
}

/**
 * Calcule la liste des titres débloqués/verrouillés.
 * Utilise les données user + totalHistories + distinctExercises.
 *
 * @param user              - Modèle User WatermelonDB
 * @param totalHistories    - Nombre de séances complètes non supprimées
 * @param distinctExercises - Nombre d'exercices distincts pratiqués
 * @returns Liste de 15 TitleDefinition triée dans l'ordre de définition
 */
export function computeTitles(
  user: User,
  totalHistories: number,
  distinctExercises: number,
): TitleDefinition[] {
  const unlockConditions: Record<TitleId, boolean> = {
    first_steps:     totalHistories >= 1,
    regular:         user.bestStreak >= 4,
    iron_will:       user.bestStreak >= 12,
    veteran:         totalHistories >= 50,
    centurion:       totalHistories >= 100,
    pr_hunter:       user.totalPrs >= 10,
    record_breaker:  user.totalPrs >= 50,
    tonnage_lifter:  user.totalTonnage >= 10000,
    tonnage_master:  user.totalTonnage >= 100000,
    explorer:        distinctExercises >= 20,
    exercise_master: distinctExercises >= 40,
    level_10:        user.level >= 10,
    level_25:        user.level >= 25,
    level_50:        user.level >= 50,
    elite:           user.level >= 75,
  }

  return TITLE_IDS.map(id => ({
    id,
    icon: TITLE_ICONS[id],
    unlocked: unlockConditions[id],
  }))
}
