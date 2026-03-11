import {
  DAY_MS,
  DELOAD_CONSECUTIVE_DAYS_THRESHOLD,
  DELOAD_VOLUME_SPIKE_RATIO,
  DELOAD_VOLUME_WEEKS_WINDOW,
  DELOAD_MIN_HISTORY_WEEKS,
  DELOAD_TRAINING_BLOCK_WEEKS,
  DELOAD_REST_GAP_DAYS,
  MRV_THRESHOLDS,
} from '../constants'

// ─── Types ──────────────────────────────────────────────────────────────────

export type DeloadType = 'rest_day' | 'deload_week' | 'reduce_volume' | 'muscle_overload'
export type DeloadSeverity = 'warning' | 'suggestion'

export interface DeloadRecommendation {
  type: DeloadType
  severity: DeloadSeverity
  reasonKey: string
  reasonParams?: Record<string, string | number>
  affectedMuscles?: string[]
}

interface HistoryEntry {
  startTime: number
  endTime?: number
  isAbandoned?: boolean
  deletedAt?: number
}

interface DeloadParams {
  histories: HistoryEntry[]
  weeklyVolumes: number[]
  setsPerMuscle?: Record<string, number>
  userLevel: string
  currentStreak: number
  now?: number
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function filterValidHistories(histories: HistoryEntry[]): HistoryEntry[] {
  return histories.filter(h => !h.deletedAt && !h.isAbandoned)
}

function getTrainingDayKeys(histories: HistoryEntry[]): Set<number> {
  const days = new Set<number>()
  for (const h of histories) {
    days.add(Math.floor(h.startTime / DAY_MS))
  }
  return days
}

function countConsecutiveDaysUpToToday(dayKeys: Set<number>, todayKey: number): number {
  let count = 0
  let key = todayKey
  while (dayKeys.has(key)) {
    count++
    key--
  }
  return count
}

function countRestDaysInLast7(dayKeys: Set<number>, todayKey: number): number {
  let trainingDays = 0
  for (let i = 0; i < 7; i++) {
    if (dayKeys.has(todayKey - i)) {
      trainingDays++
    }
  }
  return 7 - trainingDays
}

// ─── Signal detectors (by priority) ────────────────────────────────────────

function detectConsecutiveDays(
  validHistories: HistoryEntry[],
  now: number
): DeloadRecommendation | null {
  const dayKeys = getTrainingDayKeys(validHistories)
  const todayKey = Math.floor(now / DAY_MS)
  const consecutive = countConsecutiveDaysUpToToday(dayKeys, todayKey)

  if (consecutive > DELOAD_CONSECUTIVE_DAYS_THRESHOLD) {
    return {
      type: 'rest_day',
      severity: 'warning',
      reasonKey: 'consecutiveDays',
      reasonParams: { days: consecutive },
    }
  }
  return null
}

function detectVolumeSpike(weeklyVolumes: number[]): DeloadRecommendation | null {
  if (weeklyVolumes.length < DELOAD_VOLUME_WEEKS_WINDOW + 1) return null

  const currentWeek = weeklyVolumes[0]
  const previousWeeks = weeklyVolumes.slice(1, DELOAD_VOLUME_WEEKS_WINDOW + 1)
  const avg = previousWeeks.reduce((sum, v) => sum + v, 0) / previousWeeks.length

  if (avg === 0) return null

  const ratio = currentWeek / avg
  if (ratio > DELOAD_VOLUME_SPIKE_RATIO) {
    const percent = Math.round((ratio - 1) * 100)
    return {
      type: 'reduce_volume',
      severity: 'warning',
      reasonKey: 'volumeSpike',
      reasonParams: { percent },
    }
  }
  return null
}

function detectLongBlock(currentStreak: number): DeloadRecommendation | null {
  if (currentStreak >= DELOAD_TRAINING_BLOCK_WEEKS) {
    return {
      type: 'deload_week',
      severity: 'suggestion',
      reasonKey: 'longBlock',
      reasonParams: { weeks: currentStreak },
    }
  }
  return null
}

function detectMuscleOverload(
  setsPerMuscle: Record<string, number> | undefined,
  userLevel: string
): DeloadRecommendation | null {
  if (!setsPerMuscle) return null

  const thresholds = MRV_THRESHOLDS[userLevel] || MRV_THRESHOLDS['intermediate']
  const overloaded: string[] = []

  for (const [muscle, sets] of Object.entries(setsPerMuscle)) {
    const key = muscle.toLowerCase()
    const threshold = thresholds[key]
    if (threshold && sets > threshold) {
      overloaded.push(muscle)
    }
  }

  if (overloaded.length > 0) {
    return {
      type: 'muscle_overload',
      severity: 'suggestion',
      reasonKey: 'muscleOverload',
      reasonParams: { muscles: overloaded.join(', ') },
      affectedMuscles: overloaded,
    }
  }
  return null
}

function detectFewRestDays(
  validHistories: HistoryEntry[],
  now: number
): DeloadRecommendation | null {
  const dayKeys = getTrainingDayKeys(validHistories)
  const todayKey = Math.floor(now / DAY_MS)
  const restDays = countRestDaysInLast7(dayKeys, todayKey)

  if (restDays < DELOAD_REST_GAP_DAYS) {
    return {
      type: 'rest_day',
      severity: 'suggestion',
      reasonKey: 'fewRestDays',
      reasonParams: { restDays },
    }
  }
  return null
}

// ─── Main function ──────────────────────────────────────────────────────────

/** Analyse les données d'entraînement et retourne la recommandation de plus haute priorité, ou null */
export function computeDeloadRecommendation(params: DeloadParams): DeloadRecommendation | null {
  const {
    histories,
    weeklyVolumes,
    setsPerMuscle,
    userLevel,
    currentStreak,
    now = Date.now(),
  } = params

  // Pas assez d'historique pour recommander
  if (weeklyVolumes.length < DELOAD_MIN_HISTORY_WEEKS) return null

  const validHistories = filterValidHistories(histories)

  // Signal 1: Jours consécutifs (warning)
  const consecutive = detectConsecutiveDays(validHistories, now)
  if (consecutive) return consecutive

  // Signal 2: Spike de volume (warning)
  const spike = detectVolumeSpike(weeklyVolumes)
  if (spike) return spike

  // Signal 3: Block d'entraînement long (suggestion)
  const longBlock = detectLongBlock(currentStreak)
  if (longBlock) return longBlock

  // Signal 4: Surcharge musculaire (suggestion)
  const muscleOverload = detectMuscleOverload(setsPerMuscle, userLevel)
  if (muscleOverload) return muscleOverload

  // Signal 5: Manque de repos (suggestion)
  const fewRest = detectFewRestDays(validHistories, now)
  if (fewRest) return fewRest

  return null
}
