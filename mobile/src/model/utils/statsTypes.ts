// ─── Stats — Types & Interfaces ───────────────────────────────────────────────

export type StatsPeriod = '1m' | '3m' | 'all'

export const PERIOD_LABELS = ['1 mois', '3 mois', 'Tout'] as const

export interface GlobalKPIs {
  totalSessions: number
  totalVolumeKg: number
  totalPRs: number
}

export interface DurationStats {
  avgMin: number
  totalHours: number
  minMin: number
  maxMin: number
  perSession: Array<{ date: number; durationMin: number }>
}

export interface VolumeWeekEntry {
  weekLabel: string
  volume: number
}

export interface VolumeTopExercise {
  exerciseId: string
  name: string
  volume: number
}

export interface VolumeStats {
  total: number
  perWeek: VolumeWeekEntry[]
  topExercises: VolumeTopExercise[]
  comparedToPrevious: number
}

export interface MuscleRepartitionEntry {
  muscle: string
  volume: number
  pct: number
}

export interface ExercisePR {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: number
  orm1: number
}

export interface ExerciseFrequency {
  exerciseId: string
  exerciseName: string
  count: number
}

export interface MuscleWeekEntry {
  muscle: string
  sets: number
}

export interface MuscleWeekHistoryEntry {
  weekLabel: string  // ex: "03/02"
  weekStart: number  // timestamp ms pour tri
  sets: number
}

export interface HeatmapDay {
  date: string       // 'YYYY-MM-DD'
  count: number      // 0 = repos, 1+ = nombre de seances
  dayOfWeek: number  // 0=lundi ... 6=dimanche (ISO)
}
