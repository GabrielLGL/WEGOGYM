// ─── Stats — Muscle Repartition & Sets per Muscle ─────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { StatsPeriod, MuscleRepartitionEntry, MuscleWeekEntry, MuscleWeekHistoryEntry, WeeklySetsChartResult, MonthlySetsChartResult } from './statsTypes'
import { getPeriodStart } from './statsDateUtils'

export function getMondayOfCurrentWeek(): number {
  const now = new Date()
  const day = now.getDay() // 0=dim, 1=lun, ..., 6=sam
  const diff = (day === 0 ? -6 : 1 - day) // jours à soustraire pour aller au lundi
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

export function computeMuscleRepartition(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  period: StatsPeriod
): MuscleRepartitionEntry[] {
  const periodStart = getPeriodStart(period)
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))
  const exerciseMuscles = new Map(exercises.map(e => [e.id, e.muscles]))

  const muscleVolume = new Map<string, number>()
  sets
    .filter(s => {
      if (!activeHistoryIds.has(s.history.id)) return false
      return (historyDates.get(s.history.id) ?? 0) >= periodStart
    })
    .forEach(s => {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      const volume = s.weight * s.reps
      muscles.forEach(muscle => {
        const trimmed = muscle.trim()
        if (!trimmed) return
        muscleVolume.set(trimmed, (muscleVolume.get(trimmed) ?? 0) + volume)
      })
    })

  if (muscleVolume.size === 0) return []

  const sorted = Array.from(muscleVolume.entries()).sort((a, b) => b[1] - a[1])
  const top7 = sorted.slice(0, 7)
  const othersVolume = sorted.slice(7).reduce((sum, [, v]) => sum + v, 0)
  const allEntries: Array<[string, number]> =
    othersVolume > 0 ? [...top7, ['Autres', othersVolume]] : top7

  const totalVolume = allEntries.reduce((sum, [, v]) => sum + v, 0)
  return allEntries.map(([muscle, volume]) => ({
    muscle,
    volume,
    pct: Math.round((volume / totalVolume) * 100),
  }))
}

export function computeSetsPerMuscleWeek(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[]
): MuscleWeekEntry[] {
  const mondayStart = getMondayOfCurrentWeek()
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(
    activeHistories
      .filter(h => historyDates.get(h.id)! >= mondayStart)
      .map(h => h.id)
  )

  const exerciseMuscles = new Map<string, string[]>(exercises.map(e => [e.id, e.muscles] as [string, string[]]))
  const setsPerMuscle = new Map<string, number>()

  sets
    .filter(s => activeHistoryIds.has(s.history.id))
    .forEach(s => {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      muscles.forEach(muscle => {
        setsPerMuscle.set(muscle, (setsPerMuscle.get(muscle) ?? 0) + 1)
      })
    })

  return Array.from(setsPerMuscle.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([muscle, setsCount]) => ({ muscle, sets: setsCount }))
}

/**
 * Calcule les séries par semaine sur une fenêtre paginable de `weeksToShow` semaines.
 *
 * @param options.muscleFilter - null = toutes muscles (global), string = filtre sur un muscle
 * @param options.weekOffset   - 0 = 4 dernières semaines, -1 = les 4 semaines d'avant, etc.
 * @param options.weeksToShow  - taille de la fenêtre (défaut 4)
 */
export function computeWeeklySetsChart(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  options: {
    muscleFilter: string | null
    weekOffset: number
    weeksToShow?: number
  }
): WeeklySetsChartResult {
  const weeksToShow = options.weeksToShow ?? 4
  const { muscleFilter, weekOffset } = options
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000

  // Lundi de la semaine courante
  const currentMonday = getMondayOfCurrentWeek()

  // windowStartMonday : premier lundi de la fenêtre affichée
  // offset=0  → currentMonday - 3*WEEK_MS (4 dernières semaines)
  // offset=-1 → currentMonday - 7*WEEK_MS (4 semaines d'avant)
  const windowStartMonday = currentMonday + (weekOffset * weeksToShow - (weeksToShow - 1)) * WEEK_MS

  // Pré-calcul des maps pour la performance
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))
  const exerciseMuscles = new Map<string, string[]>(
    exercises.map(e => [e.id, e.muscles] as [string, string[]])
  )

  const labels: string[] = []
  const data: number[] = []

  for (let i = 0; i < weeksToShow; i++) {
    const weekStart = windowStartMonday + i * WEEK_MS
    const weekEnd = weekStart + WEEK_MS
    const weekDate = new Date(weekStart)
    const weekLabel = `${String(weekDate.getDate()).padStart(2, '0')}/${String(weekDate.getMonth() + 1).padStart(2, '0')}`
    labels.push(weekLabel)

    const count = sets.filter(s => {
      if (!activeHistoryIds.has(s.history.id)) return false
      const d = historyDates.get(s.history.id) ?? 0
      if (d < weekStart || d >= weekEnd) return false
      if (muscleFilter === null) return true
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      return muscles.some(m => m.trim() === muscleFilter)
    }).length

    data.push(count)
  }

  // Label de plage : "DD/MM – DD/MM" (premier lundi → dernier dimanche)
  const lastWeekSunday = new Date(windowStartMonday + weeksToShow * WEEK_MS - 1)
  const firstDate = new Date(windowStartMonday)
  const weekRangeLabel =
    `${String(firstDate.getDate()).padStart(2, '0')}/${String(firstDate.getMonth() + 1).padStart(2, '0')}` +
    ` – ` +
    `${String(lastWeekSunday.getDate()).padStart(2, '0')}/${String(lastWeekSunday.getMonth() + 1).padStart(2, '0')}`

  const hasNext = weekOffset < 0   // peut avancer si pas sur la fenêtre la plus récente
  const hasPrev = true             // on laisse toujours reculer (pas de limite connue des données)

  return { labels, data, weekRangeLabel, hasPrev, hasNext }
}

/** @deprecated Non utilisé depuis la refonte StatsVolumeScreen — candidat à la suppression */
export function computeSetsPerMuscleHistory(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  muscleFilter: string,
  weeks: number = 8
): MuscleWeekHistoryEntry[] {
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))

  const exerciseMuscles = new Map<string, string[]>(exercises.map(e => [e.id, e.muscles] as [string, string[]]))

  const result: MuscleWeekHistoryEntry[] = []
  const now = Date.now()

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000
    const weekStart = weekEnd - 7 * 24 * 60 * 60 * 1000
    const weekDate = new Date(weekEnd)
    const weekLabel = `${String(weekDate.getDate()).padStart(2, '0')}/${String(weekDate.getMonth() + 1).padStart(2, '0')}`

    const weekSets = sets.filter(s => {
      if (!activeHistoryIds.has(s.history.id)) return false
      const d = historyDates.get(s.history.id) ?? 0
      return d >= weekStart && d < weekEnd
    })

    let count = 0
    weekSets.forEach(s => {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      if (muscles.includes(muscleFilter)) count++
    })

    result.push({ weekLabel, weekStart, sets: count })
  }

  return result
}

const MONTH_LABELS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

/**
 * Calcule les séries par mois sur toute l'historique (vue "Tout").
 * Retourne au maximum les 12 derniers mois.
 *
 * @param muscleFilter - null = tous muscles, string = filtre sur un muscle précis
 */
export function computeMonthlySetsChart(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  muscleFilter: string | null
): MonthlySetsChartResult {
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const historyDates = new Map(activeHistories.map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))
  const exerciseMuscles = new Map<string, string[]>(
    exercises.map(e => [e.id, e.muscles] as [string, string[]])
  )

  const activeSets = sets.filter(s => activeHistoryIds.has(s.history.id))
  if (activeSets.length === 0) return { labels: [], data: [] }

  const allTimestamps = activeSets.map(s => historyDates.get(s.history.id) ?? 0)
  const oldestTimestamp = Math.min(...allTimestamps)
  const oldestDate = new Date(oldestTimestamp)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Collect all months from oldest to current
  const allMonths: Array<{ year: number; month: number }> = []
  let y = oldestDate.getFullYear()
  let m = oldestDate.getMonth()
  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    allMonths.push({ year: y, month: m })
    m++
    if (m > 11) { m = 0; y++ }
  }

  // Keep at most the last 12 months
  const months = allMonths.slice(-12)

  const labels: string[] = []
  const data: number[] = []

  for (const { year, month } of months) {
    labels.push(MONTH_LABELS_FR[month])

    const monthStart = new Date(year, month, 1).getTime()
    const monthEnd = new Date(year, month + 1, 1).getTime()

    const count = activeSets.filter(s => {
      const d = historyDates.get(s.history.id) ?? 0
      if (d < monthStart || d >= monthEnd) return false
      if (muscleFilter === null) return true
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      return muscles.some(mu => mu.trim() === muscleFilter)
    }).length

    data.push(count)
  }

  return { labels, data }
}
