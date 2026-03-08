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

// ─── Time constants ─────────────────────────────────────────────────────────

export const MINUTE_MS = 60_000
export const DAY_MS = 86_400_000
export const WEEK_MS = 7 * DAY_MS
export const MINUTES_PER_HOUR = 60

// ─── Gamification ───────────────────────────────────────────────────────────

export const MAX_LEVEL = 100
export const KG_PER_TONNE = 1000

// ─── Workout input limits ───────────────────────────────────────────────────

export const MIN_SETS = 1
export const MAX_SETS = 10
export const MIN_WEIGHT_KG = 0
export const MAX_WEIGHT_KG = 999
export const MIN_REST_TIME_S = 10
export const MAX_REST_TIME_S = 600
export const DEFAULT_REST_DURATION_S = 90
export const DEFAULT_REPS = 10
export const MAX_REPS = 99
export const MIN_REPS = 1

// ─── Sports science ────────────────────────────────────────────────────────

/** Epley formula: 1RM = weight × (1 + reps / EPLEY_FORMULA_DIVISOR) */
export const EPLEY_FORMULA_DIVISOR = 30

// ─── Stats chart limits ────────────────────────────────────────────────────

export const DURATION_CHART_SESSION_LIMIT = 30
export const VOLUME_CHART_WEEKS = 12
export const TOP_EXERCISES_VOLUME_LIMIT = 3
export const TOP_EXERCISES_DEFAULT_LIMIT = 5
export const HEATMAP_DAYS = 364
export const PERIOD_1M_DAYS = 30
export const PERIOD_3M_DAYS = 90
export const MUSCLE_TOP_N = 7
export const MUSCLE_WEEK_CHART_LIMIT = 8
export const MONTHLY_CHART_MAX_MONTHS = 12

// ─── KPI thresholds ────────────────────────────────────────────────────────

export const STREAK_LOOKUP_DAYS = 365
export const MIN_MOTIVATIONAL_STREAK = 3
export const RETURNING_GAP_DAYS = 4
export const REGULARITY_WINDOW_DAYS = 28
