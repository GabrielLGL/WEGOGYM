// ─── Stats — Volume, Calendar & Formatters ────────────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { StatsPeriod, VolumeStats, VolumeWeekEntry, HeatmapDay } from './statsTypes'
import { getPeriodStart, toDateKey } from './statsDateUtils'

export function computeVolumeStats(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  period: StatsPeriod
): VolumeStats {
  const periodStart = getPeriodStart(period)
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))

  const periodSets = sets.filter(s => {
    if (!activeHistoryIds.has(s.history.id)) return false
    return (historyDates.get(s.history.id) ?? 0) >= periodStart
  })

  const total = periodSets.reduce((sum, s) => sum + s.weight * s.reps, 0)

  // Comparaison avec la période précédente
  const periodLengthMs =
    period === '1m' ? 30 * 24 * 60 * 60 * 1000 :
    period === '3m' ? 90 * 24 * 60 * 60 * 1000 : 0

  let comparedToPrevious = 0
  if (periodLengthMs > 0) {
    const prevStart = periodStart - periodLengthMs
    const prevSets = sets.filter(s => {
      if (!activeHistoryIds.has(s.history.id)) return false
      const d = historyDates.get(s.history.id) ?? 0
      return d >= prevStart && d < periodStart
    })
    const prevTotal = prevSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    if (prevTotal > 0) {
      comparedToPrevious = Math.round(((total - prevTotal) / prevTotal) * 100)
    }
  }

  // Volume par semaine (12 dernières semaines)
  const perWeek: VolumeWeekEntry[] = []
  for (let i = 11; i >= 0; i--) {
    const weekEnd = Date.now() - i * 7 * 24 * 60 * 60 * 1000
    const weekStart = weekEnd - 7 * 24 * 60 * 60 * 1000
    const weekSets = sets.filter(s => {
      if (!activeHistoryIds.has(s.history.id)) return false
      const d = historyDates.get(s.history.id) ?? 0
      return d >= weekStart && d < weekEnd
    })
    const weekDate = new Date(weekEnd)
    perWeek.push({
      weekLabel: `${weekDate.getDate()}/${weekDate.getMonth() + 1}`,
      volume: weekSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    })
  }

  // Top 3 exercices par volume
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const volumeByExercise = new Map<string, number>()
  periodSets.forEach(s => {
    const exId = s.exercise.id
    volumeByExercise.set(exId, (volumeByExercise.get(exId) ?? 0) + s.weight * s.reps)
  })
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

export function formatVolume(kg: number): string {
  return `${Math.round(kg).toLocaleString('fr-FR')} kg`
}
