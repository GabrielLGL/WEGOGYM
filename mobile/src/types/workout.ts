export interface SetInputData {
  weight: string
  reps: string
}

export interface ValidatedSetData {
  weight: number
  reps: number
  isPr: boolean
}

export interface LastPerformance {
  maxWeight: number
  avgWeight: number
  avgReps: number
  setsCount: number
  date: Date
}

export interface RecapExerciseData {
  exerciseId: string
  exerciseName: string
  setsValidated: number
  setsTarget: number
  sets: { reps: number; weight: number }[]
  prevMaxWeight: number
  currMaxWeight: number
  muscles: string[]
}

export interface RecapComparisonData {
  prevVolume: number | null
  currVolume: number
  volumeGain: number
}
