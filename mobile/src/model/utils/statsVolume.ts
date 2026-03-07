// ─── Stats — Volume, Calendar & Formatters ────────────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type Session from '../models/Session'
import type { StatsPeriod, StatsContext, VolumeStats, VolumeWeekEntry, HeatmapDay, WeekDayActivity, WeeklyActivityData } from './statsTypes'
import { getPeriodStart, toDateKey } from './statsDateUtils'
import { getMondayOfCurrentWeek } from './statsMuscle'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function computeVolumeStats(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  period: StatsPeriod,
  ctx?: StatsContext
): VolumeStats {
  // Use shared context or build locally
  const historyDates = ctx?.historyDates ?? new Map(histories.filter(h => h.deletedAt === null).map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = ctx?.historyIds ?? new Set(histories.filter(h => h.deletedAt === null).map(h => h.id))

  const periodStart = getPeriodStart(period)
  const periodLengthMs =
    period === '1m' ? 30 * 24 * 60 * 60 * 1000 :
    period === '3m' ? 90 * 24 * 60 * 60 * 1000 : 0
  const prevStart = periodLengthMs > 0 ? periodStart - periodLengthMs : 0

  // Weekly buckets: 12 dernières semaines
  const now = Date.now()
  const weekWindowStart = now - 12 * WEEK_MS
  const weekBuckets = new Array<number>(12).fill(0)

  // Single pass
  let total = 0
  let prevTotal = 0
  const volumeByExercise = new Map<string, number>()

  for (const s of sets) {
    const hId = s.history.id
    if (!activeHistoryIds.has(hId)) continue
    const d = historyDates.get(hId) ?? 0
    const vol = s.weight * s.reps

    // Weekly bucket
    if (d >= weekWindowStart && d < now) {
      const bucketIdx = Math.floor((d - weekWindowStart) / WEEK_MS)
      if (bucketIdx >= 0 && bucketIdx < 12) {
        weekBuckets[bucketIdx] += vol
      }
    }

    // Period total + top exercises
    if (d >= periodStart) {
      total += vol
      const exId = s.exercise.id
      volumeByExercise.set(exId, (volumeByExercise.get(exId) ?? 0) + vol)
    }

    // Previous period comparison
    if (periodLengthMs > 0 && d >= prevStart && d < periodStart) {
      prevTotal += vol
    }
  }

  // Build perWeek labels
  const perWeek: VolumeWeekEntry[] = []
  for (let i = 0; i < 12; i++) {
    const weekEnd = weekWindowStart + (i + 1) * WEEK_MS
    const weekDate = new Date(weekEnd)
    perWeek.push({
      weekLabel: `${weekDate.getDate()}/${weekDate.getMonth() + 1}`,
      volume: weekBuckets[i],
    })
  }

  // Compared to previous
  const comparedToPrevious = (periodLengthMs > 0 && prevTotal > 0)
    ? Math.round(((total - prevTotal) / prevTotal) * 100)
    : 0

  // Top 3 exercices par volume
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const topExercises = Array.from(volumeByExercise.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, vol]) => ({
      exerciseId: id,
      name: exerciseNames.get(id) ?? id,
      volume: vol,
    }))

  return { total, perWeek, topExercises, comparedToPrevious }
}

export function computeCalendarData(histories: History[]): Map<string, number> {
  const result = new Map<string, number>()
  histories
    .filter(h => h.deletedAt === null)
    .forEach(h => {
      const key = toDateKey(h.startTime)
      result.set(key, (result.get(key) ?? 0) + 1)
    })
  return result
}

export function buildHeatmapData(histories: History[]): HeatmapDay[] {
  const calendarMap = computeCalendarData(histories)
  const days: HeatmapDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateKey(d)
    const jsDay = d.getDay() // 0=dimanche ... 6=samedi
    const isoDay = (jsDay + 6) % 7 // 0=lundi ... 6=dimanche
    days.push({
      date: key,
      count: calendarMap.get(key) ?? 0,
      dayOfWeek: isoDay,
    })
  }

  return days
}

export function formatVolume(kg: number, locale = 'fr-FR'): string {
  return `${Math.round(kg).toLocaleString(locale)} kg`
}

const DAY_MS = 24 * 60 * 60 * 1000

export function buildWeeklyActivity(
  histories: History[],
  sets: WorkoutSet[],
  sessions: Session[],
  dayLabels?: string[],
  sessionFallback = 'Séance',
): WeeklyActivityData {
  const mondayTs = getMondayOfCurrentWeek()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = toDateKey(today)

  const sessionNames = new Map(sessions.map(s => [s.id, s.name]))

  return Array.from({ length: 7 }, (_, i): WeekDayActivity => {
    const dayDate = new Date(mondayTs + i * DAY_MS)
    const dateKey = toDateKey(dayDate)
    const isToday = dateKey === todayKey
    const isPast = dayDate < today

    const dayHistories = histories.filter(h => h.deletedAt === null && toDateKey(h.startTime) === dateKey)

    const daySessions = dayHistories.map(h => {
      const historySets = sets.filter(s => s.history.id === h.id)
      const setCount = historySets.length
      const volumeKg = Math.round(historySets.reduce((acc, s) => acc + s.weight * s.reps, 0) * 10) / 10
      const durationMin = h.endTime != null
        ? Math.round((h.endTime.getTime() - h.startTime.getTime()) / 60000)
        : null
      const sessionName = sessionNames.get(h.session.id) ?? sessionFallback
      return { sessionName, setCount, volumeKg, durationMin }
    })

    return {
      dateKey,
      dayLabel: dayLabels?.[i] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dayNumber: dayDate.getDate(),
      isToday,
      isPast,
      sessions: daySessions,
    }
  })
}
