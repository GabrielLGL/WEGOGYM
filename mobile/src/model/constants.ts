export const MUSCLES_LIST = [
  'Pecs',
  'Dos',
  'Quadriceps',
  'Ischios',
  'Mollets',
  'Trapèzes',
  'Epaules',
  'Biceps',
  'Triceps',
  'Abdos',
  'Cardio'
];

export const EQUIPMENT_LIST = [
  'Poids libre',
  'Machine',
  'Poulies',
  'Poids du corps'
];

// ─── Profil utilisateur (onboarding) ─────────────────────────────────────────

export const USER_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type UserLevel = typeof USER_LEVELS[number]

export const USER_GOALS = ['mass', 'strength', 'recomp', 'health'] as const
export type UserGoal = typeof USER_GOALS[number]

export const PROGRAM_EQUIPMENT = ['full_gym', 'home_gym', 'bodyweight'] as const
export type ProgramEquipment = typeof PROGRAM_EQUIPMENT[number]

export const USER_LEVEL_LABELS: Record<UserLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

export const USER_LEVEL_DESCRIPTIONS: Record<UserLevel, string> = {
  beginner: 'Je commence la muscu',
  intermediate: 'Je m\'entraîne depuis quelques mois',
  advanced: 'Plus de 2 ans d\'expérience',
}

export const USER_GOAL_LABELS: Record<UserGoal, string> = {
  mass: 'Prise de masse',
  strength: 'Force',
  recomp: 'Recomposition',
  health: 'Santé générale',
}

export const USER_GOAL_DESCRIPTIONS: Record<UserGoal, string> = {
  mass: 'Gagner du muscle',
  strength: 'Devenir plus fort',
  recomp: 'Perdre du gras, gagner du muscle',
  health: 'Rester en forme',
}
