export type AIGoal = 'bodybuilding' | 'power' | 'renfo' | 'cardio'
export type AILevel = 'débutant' | 'intermédiaire' | 'avancé'
export type AIProviderName = 'offline' | 'claude' | 'openai' | 'gemini'
export type AIDuration = 30 | 45 | 60 | 90
export type AISplit = 'auto' | 'fullbody' | 'upperlower' | 'ppl'

export interface AIFormData {
  mode: 'program' | 'session'
  goal: AIGoal
  level: AILevel
  equipment: string[]
  daysPerWeek?: number
  durationMin: AIDuration
  muscleGroup?: string
  targetProgramId?: string
  split?: AISplit          // choix du split programme
  musclesFocus?: string[]  // [] = équilibré, sinon muscles prioritaires
}

export interface GeneratedExercise {
  exerciseName: string
  setsTarget: number
  repsTarget: string
  weightTarget: number
}

export interface GeneratedSession {
  name: string
  exercises: GeneratedExercise[]
}

export interface GeneratedPlan {
  name: string
  sessions: GeneratedSession[]
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
