import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonthlyStats {
  totalVolume: number
  sessionCount: number
  prCount: number
  activeDays: number
  setsTotal: number
  avgSessionsPerWeek: number
  topExercise: { name: string; volume: number } | null
}

export type MonthlyTrend = 'up' | 'down' | 'stable'

export interface MonthlyProgressResult {
  current: MonthlyStats
  previous: MonthlyStats
  deltas: {
    volume: number
    sessions: number
    prs: number
    activeDays: number
    setsTotal: number
    avgPerWeek: number
  }
  trend: MonthlyTrend
  monthLabel: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getYearMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function prevMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 2, 1) // month is 0-indexed, so m-1 is current, m-2 is previous
  return getYearMonth(d)
}

function computeDelta(curr: number, prev: number): number {
  if (prev === 0 && curr > 0) return 100
  if (prev === 0 && curr === 0) return 0
  return Math.round(((curr - prev) / prev) * 100)
}

function weeksInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  return daysInMonth / 7
}

function buildMonthStats(
  histories: History[],
  sets: WorkoutSet[],
  exerciseMap: Map<string, string>,
  yearMonth: string,
): MonthlyStats {
  const monthHistories = histories.filter(h => {
    const d = h.startTime
    return d && getYearMonth(d) === yearMonth
  })

  const historyIds = new Set(monthHistories.map(h => h.id))
  const monthSets = sets.filter(s => historyIds.has(s.historyId))

  const totalVolume = monthSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0)
  const prCount = monthSets.filter(s => s.isPr).length
  const setsTotal = monthSets.length

  const uniqueDays = new Set(
    monthHistories.map(h => {
      const d = h.startTime
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )
  const activeDays = uniqueDays.size

  const weeks = weeksInMonth(yearMonth)
  const avgSessionsPerWeek = weeks > 0 ? Math.round((monthHistories.length / weeks) * 10) / 10 : 0

  // Top exercise by volume
  const volumeByExercise = new Map<string, number>()
  for (const s of monthSets) {
    const vol = (s.weight || 0) * (s.reps || 0)
    volumeByExercise.set(s.exerciseId, (volumeByExercise.get(s.exerciseId) || 0) + vol)
  }

  let topExercise: MonthlyStats['topExercise'] = null
  let maxVol = 0
  for (const [exId, vol] of volumeByExercise) {
    if (vol > maxVol) {
      maxVol = vol
      topExercise = { name: exerciseMap.get(exId) || '?', volume: vol }
    }
  }

  return {
    totalVolume,
    sessionCount: monthHistories.length,
    prCount,
    activeDays,
    setsTotal,
    avgSessionsPerWeek,
    topExercise,
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function computeMonthlyProgress(
  histories: History[],
  sets: WorkoutSet[],
  exercises: Exercise[],
  targetMonth?: string,
): MonthlyProgressResult {
  const now = new Date()
  const currentYM = targetMonth || getYearMonth(now)
  const previousYM = prevMonth(currentYM)

  const exerciseMap = new Map<string, string>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.name)
  }

  const current = buildMonthStats(histories, sets, exerciseMap, currentYM)
  const previous = buildMonthStats(histories, sets, exerciseMap, previousYM)

  const deltas = {
    volume: computeDelta(current.totalVolume, previous.totalVolume),
    sessions: computeDelta(current.sessionCount, previous.sessionCount),
    prs: computeDelta(current.prCount, previous.prCount),
    activeDays: computeDelta(current.activeDays, previous.activeDays),
    setsTotal: computeDelta(current.setsTotal, previous.setsTotal),
    avgPerWeek: computeDelta(current.avgSessionsPerWeek, previous.avgSessionsPerWeek),
  }

  const trend: MonthlyTrend = deltas.volume > 5 ? 'up' : deltas.volume < -5 ? 'down' : 'stable'

  return {
    current,
    previous,
    deltas,
    trend,
    monthLabel: currentYM,
  }
}

export function getAvailableMonths(histories: History[]): string[] {
  const months = new Set<string>()
  for (const h of histories) {
    if (h.startTime) {
      months.add(getYearMonth(h.startTime))
    }
  }
  return Array.from(months).sort()
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMonthLabel(yearMonth: string, language: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const names = language === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES_EN
  return `${names[m - 1]} ${y}`
}
