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

// ─── CGU / Disclaimer ────────────────────────────────────────────────────────

export const CGU_VERSION = '1.0'
export const CGU_URL = 'https://kore-app.net/cgu'

// ─── Profil utilisateur (onboarding) ─────────────────────────────────────────

export const USER_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type UserLevel = typeof USER_LEVELS[number]

export const USER_GOALS = ['mass', 'strength', 'recomp', 'health'] as const
export type UserGoal = typeof USER_GOALS[number]

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

// ─── Deload / Periodization ────────────────────────────────────────────────

export const DELOAD_CONSECUTIVE_DAYS_THRESHOLD = 6
export const DELOAD_VOLUME_SPIKE_RATIO = 1.3
export const DELOAD_VOLUME_WEEKS_WINDOW = 4
export const DELOAD_MIN_HISTORY_WEEKS = 3
export const DELOAD_TRAINING_BLOCK_WEEKS = 6
export const DELOAD_REST_GAP_DAYS = 2

// MRV (Maximum Recoverable Volume) — sets/semaine par muscle
// Source : Renaissance Periodization guidelines, adapté par niveau
// Ces seuils sont des suggestions, pas des valeurs absolues
export const MRV_THRESHOLDS: Record<string, Record<string, number>> = {
  beginner:     { chest: 14, back: 16, shoulders: 14, biceps: 12, triceps: 12, legs: 16, abs: 16 },
  intermediate: { chest: 18, back: 20, shoulders: 18, biceps: 16, triceps: 16, legs: 20, abs: 20 },
  advanced:     { chest: 22, back: 24, shoulders: 22, biceps: 20, triceps: 20, legs: 24, abs: 24 },
}
