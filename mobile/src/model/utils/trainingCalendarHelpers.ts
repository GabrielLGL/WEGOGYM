/**
 * trainingCalendarHelpers — Compute heatmap data for the last N weeks of training.
 *
 * Uses history (session) count per day as intensity metric.
 */

export interface CalendarDay {
  date: number            // timestamp début de journée
  setsCount: number       // nombre de sessions ce jour (based on histories)
  volume: number          // volume total (kg) — only available for recent data
  intensity: 0 | 1 | 2 | 3 | 4  // 0=repos, 1-4=quartiles d'intensité
  isToday: boolean
}

export interface CalendarWeek {
  days: CalendarDay[]     // 7 jours (lundi → dimanche)
  weekNumber: number
}

interface HistoryLike {
  createdAt: Date | number
  deletedAt: Date | null
  isAbandoned: boolean
}

interface SetLike {
  createdAt: Date | number
}

/**
 * Get the start of day (midnight) for a given timestamp.
 */
function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Get the Monday of the week containing the given timestamp.
 */
function getMondayOfWeek(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  // JS: Sunday=0, Monday=1 ... Saturday=6
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d.getTime()
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Compute quartile-based intensity levels for non-zero days.
 */
function assignIntensities(days: CalendarDay[]): void {
  const nonZeroCounts = days
    .filter(d => d.setsCount > 0)
    .map(d => d.setsCount)
    .sort((a, b) => a - b)

  if (nonZeroCounts.length === 0) return

  const q1 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.25)]
  const q2 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.5)]
  const q3 = nonZeroCounts[Math.floor(nonZeroCounts.length * 0.75)]

  for (const day of days) {
    if (day.setsCount === 0) {
      day.intensity = 0
    } else if (day.setsCount <= q1) {
      day.intensity = 1
    } else if (day.setsCount <= q2) {
      day.intensity = 2
    } else if (day.setsCount <= q3) {
      day.intensity = 3
    } else {
      day.intensity = 4
    }
  }
}

/**
 * Génère les données de la heatmap pour les N dernières semaines.
 */
export function computeTrainingCalendar(
  histories: HistoryLike[],
  _sets: SetLike[],
  weeks: number = 12,
): CalendarWeek[] {
  const now = Date.now()
  const todayStart = startOfDay(now)
  const currentMonday = getMondayOfWeek(now)
  const startMonday = currentMonday - (weeks - 1) * 7 * DAY_MS

  // Filter valid histories
  const validHistories = histories.filter(
    h => h.deletedAt === null && !h.isAbandoned,
  )

  // Build a map: dayTimestamp -> session count
  const dayCounts = new Map<number, number>()
  for (const h of validHistories) {
    const ts = typeof h.createdAt === 'number' ? h.createdAt : h.createdAt.getTime()
    const dayTs = startOfDay(ts)
    if (dayTs >= startMonday && dayTs <= todayStart) {
      dayCounts.set(dayTs, (dayCounts.get(dayTs) ?? 0) + 1)
    }
  }

  // Build all days
  const allDays: CalendarDay[] = []
  const totalDays = weeks * 7
  for (let i = 0; i < totalDays; i++) {
    const dayTs = startMonday + i * DAY_MS
    const count = dayCounts.get(dayTs) ?? 0
    allDays.push({
      date: dayTs,
      setsCount: count,
      volume: 0,
      intensity: 0,
      isToday: dayTs === todayStart,
    })
  }

  // Assign intensity based on quartiles
  assignIntensities(allDays)

  // Group by week
  const result: CalendarWeek[] = []
  for (let w = 0; w < weeks; w++) {
    result.push({
      days: allDays.slice(w * 7, w * 7 + 7),
      weekNumber: w + 1,
    })
  }

  return result
}
