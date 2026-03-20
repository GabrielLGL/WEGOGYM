export type AIGoal = 'bodybuilding' | 'power' | 'renfo' | 'cardio'
export type AILevel = 'débutant' | 'intermédiaire' | 'avancé'
export type AIProviderName = 'offline'
export type AIDuration = 45 | 60 | 90 | 120
export type AISplit = 'auto' | 'fullbody' | 'upperlower' | 'ppl' | 'brosplit' | 'arnold' | 'phul' | 'fiveday' | 'pushpull' | 'fullbodyhi'

export interface AIFormData {
  mode: 'program' | 'session'
  goal: AIGoal
  level: AILevel
  equipment: string[]
  daysPerWeek?: number
  durationMin: AIDuration
  muscleGroups?: string[]
  targetProgramId?: string
  split?: AISplit          // choix du split programme
  musclesFocus?: string[]  // [] = équilibré, sinon muscles prioritaires
  phase?: 'prise_masse' | 'seche' | 'recomposition' | 'maintien'
  recovery?: 'rapide' | 'normale' | 'lente'
  injuries?: string[]      // 'none' | 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque'
  ageGroup?: '18-25' | '26-35' | '36-45' | '45+'
}

export interface GeneratedExercise {
  exerciseName: string
  setsTarget: number
  repsTarget: string
  weightTarget: number
  restSeconds?: number
  rpe?: number
}

export interface GeneratedSession {
  name: string
  exercises: GeneratedExercise[]
}

export interface GeneratedPlan {
  name: string
  sessions: GeneratedSession[]
  includeDeload?: boolean
}

export interface GeneratePlanResult {
  plan: GeneratedPlan
  usedFallback: boolean
  fallbackReason?: string
}

export interface ExerciseInfo {
  name: string
  muscles: string[]
}

export interface DBContext {
  exercises: ExerciseInfo[]
  recentMuscles: string[]
  prs: Record<string, number>
}

export interface AIProvider {
  generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan>
}

export type ExerciseType = 'compound_heavy' | 'compound' | 'accessory' | 'isolation'
export type SFRLevel = 'high' | 'medium' | 'low'
export type InjuryZone = 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque' | 'none'
export type ProgressionType = 'linear' | 'wave' | 'auto'

export interface ExerciseMetadata {
  type: ExerciseType
  minLevel: AILevel
  isUnilateral: boolean
  primaryMuscle: string
  secondaryMuscles: string[]
  sfr?: SFRLevel
  stretchFocus?: boolean
  injuryRisk?: InjuryZone[]
  progressionType?: ProgressionType
}

export type ExerciseMetadataMap = Record<string, ExerciseMetadata>
