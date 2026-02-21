// ─── Types de base ────────────────────────────────────────────────────────────

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'resistance_band'

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'traps'

export type BodyZone =
  | 'knee' | 'lower_back' | 'shoulder' | 'elbow' | 'hip' | 'neck' | 'ankle'

export type SplitType =
  | 'full_body' | 'half_body' | 'push_pull' | 'push_pull_legs' | 'split'

export type MovementPattern = 'push' | 'pull' | 'legs' | 'core'

// ─── Profil utilisateur ───────────────────────────────────────────────────────

export interface UserProfile {
  goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'general_fitness'
  level: 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek: 2 | 3 | 4 | 5 | 6
  minutesPerSession: number
  equipment: Equipment[]
  // Biométrie (optionnel v1 — non exposé dans wizard actuel)
  age?: number
  weightKg?: number
  heightCm?: number
  // Contraintes
  injuries: BodyZone[]
  posturalIssues: boolean
}

// ─── Output séance / programme ────────────────────────────────────────────────

export interface SetParams {
  sets: number
  repsMin: number
  repsMax: number
  restSeconds: number
  rir: number
  tempoEccentric: number
}

export interface PGSessionExercise {
  exerciseId: string
  exerciseName: string
  musclesPrimary: MuscleGroup[]
  order: number
  params: SetParams
}

export interface PGGeneratedSession {
  dayOfWeek: number          // 1=lundi … 7=dimanche
  sessionType: SplitType
  musclesTargeted: MuscleGroup[]
  totalSets: number
  estimatedMinutes: number
  exercises: PGSessionExercise[]
}

export interface PGGeneratedProgram {
  id: string
  createdAt: Date
  profile: UserProfile
  splitType: SplitType
  weeksCount: number         // 4 en v1
  sessionsPerWeek: PGGeneratedSession[]
  weeklyVolumeByMuscle: Record<MuscleGroup, number>
}

// ─── Mappings FR ↔ EN ─────────────────────────────────────────────────────────
// Utilisés par exerciseSelector pour filtrer la DB WatermelonDB (noms en français)

export const EQUIPMENT_TO_DB: Record<Equipment, string[]> = {
  barbell:         ['Poids libre'],
  dumbbell:        ['Poids libre'],
  cable:           ['Poulies'],
  machine:         ['Machine'],
  bodyweight:      ['Poids du corps'],
  kettlebell:      ['Poids libre'],
  resistance_band: ['Poids libre'],
}

export const MUSCLE_TO_DB: Record<MuscleGroup, string> = {
  chest:      'Pecs',
  back:       'Dos',
  shoulders:  'Epaules',
  biceps:     'Biceps',
  triceps:    'Triceps',
  quads:      'Quadriceps',
  hamstrings: 'Ischios',
  glutes:     'Ischios',   // pas de 'Fessiers' dans le schéma actuel
  calves:     'Mollets',
  core:       'Abdos',
  traps:      'Trapèzes',
}

// InjuryZone (FR, champ injuryRisk dans exerciseMetadata) → BodyZone (EN)
export const INJURY_ZONE_TO_BODY_ZONE: Record<string, BodyZone> = {
  epaules:  'shoulder',
  genoux:   'knee',
  bas_dos:  'lower_back',
  poignets: 'elbow',
  nuque:    'neck',
  none:     'ankle',       // 'none' ignoré dans le filtre
}
