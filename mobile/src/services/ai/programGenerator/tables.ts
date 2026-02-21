import type { MuscleGroup, MovementPattern, SplitType, Equipment } from './types'

// ─── Volume hebdo cible par muscle (séries/semaine) ───────────────────────────

export const WEEKLY_VOLUME_TABLE = {
  hypertrophy: {
    beginner:     { min: 8,  optimal: 10, max: 12 },
    intermediate: { min: 12, optimal: 14, max: 16 },
    advanced:     { min: 16, optimal: 18, max: 20 },
  },
  strength: {
    beginner:     { min: 6,  optimal: 8,  max: 10 },
    intermediate: { min: 8,  optimal: 10, max: 12 },
    advanced:     { min: 10, optimal: 12, max: 15 },
  },
  fat_loss: {
    beginner:     { min: 8,  optimal: 10, max: 12 },
    intermediate: { min: 10, optimal: 12, max: 15 },
    advanced:     { min: 12, optimal: 15, max: 18 },
  },
  general_fitness: {
    beginner:     { min: 6,  optimal: 8,  max: 10 },
    intermediate: { min: 8,  optimal: 10, max: 12 },
    advanced:     { min: 10, optimal: 12, max: 15 },
  },
} as const

// ─── Paramètres d'exécution selon objectif ────────────────────────────────────

export const PARAMS_TABLE = {
  hypertrophy:     { repsMin: 8,  repsMax: 12, rir: 2, restCompound: 120, restIsolation: 90,  tempoEcc: 2 },
  strength:        { repsMin: 1,  repsMax: 5,  rir: 1, restCompound: 240, restIsolation: 180, tempoEcc: 2 },
  fat_loss:        { repsMin: 10, repsMax: 15, rir: 2, restCompound: 90,  restIsolation: 60,  tempoEcc: 2 },
  general_fitness: { repsMin: 10, repsMax: 15, rir: 3, restCompound: 120, restIsolation: 90,  tempoEcc: 2 },
} as const

// ─── Split par défaut selon fréquence ────────────────────────────────────────

export const SPLIT_BY_FREQUENCY: Record<number, SplitType> = {
  2: 'full_body',
  3: 'full_body',
  4: 'half_body',
  5: 'push_pull_legs',
  6: 'push_pull_legs',
}

// ─── Muscles par pattern de mouvement ─────────────────────────────────────────

export const MUSCLES_BY_PATTERN: Record<MovementPattern, MuscleGroup[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps', 'traps'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  core: ['core'],
}

// Inverse : muscle → pattern (dérivé de MUSCLES_BY_PATTERN)
export const MUSCLE_TO_PATTERN: Record<MuscleGroup, MovementPattern> = {
  chest:      'push',
  shoulders:  'push',
  triceps:    'push',
  back:       'pull',
  biceps:     'pull',
  traps:      'pull',
  quads:      'legs',
  hamstrings: 'legs',
  glutes:     'legs',
  calves:     'legs',
  core:       'core',
}

// ─── Limites globales ─────────────────────────────────────────────────────────

export const MAX_SETS_PER_MUSCLE_PER_SESSION = 8
export const MAX_TOTAL_SETS_PER_SESSION = 25
export const MIN_EFFECTIVE_SETS = 4

// ─── Équipement "dumbbell only" (unilatéral préféré) ─────────────────────────

export const DUMBBELL_ONLY_EQUIPMENT: Equipment[] = ['dumbbell']
