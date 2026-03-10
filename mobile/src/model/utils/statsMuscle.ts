/**
 * statsMuscle.ts — Agrégation de la répartition musculaire
 *
 * Calcule la distribution du volume (poids × reps) par groupe musculaire,
 * le nombre de séries par muscle pour la semaine en cours, et les graphiques
 * hebdomadaires/mensuels de séries (avec pagination et filtre par muscle).
 *
 * Toutes les fonctions excluent les séances soft-deleted (deletedAt !== null).
 */

// ─── Stats — Muscle Repartition & Sets per Muscle ─────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { StatsPeriod, StatsContext, MuscleRepartitionEntry, MuscleWeekEntry, WeeklySetsChartResult, MonthlySetsChartResult } from './statsTypes'
import { getPeriodStart } from './statsDateUtils'
import { WEEK_MS, MUSCLE_TOP_N, MUSCLE_WEEK_CHART_LIMIT, MONTHLY_CHART_MAX_MONTHS } from '../constants'

/** Retourne le timestamp (ms) du lundi 00:00:00 de la semaine en cours */
export function getMondayOfCurrentWeek(): number {
  const now = new Date()
  const day = now.getDay() // 0=dim, 1=lun, ..., 6=sam
  const diff = (day === 0 ? -6 : 1 - day) // jours à soustraire pour aller au lundi
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

/**
 * Calcule la répartition du volume (poids × reps) par muscle sur une période donnée.
 * Retourne les top 7 muscles + un agrégat "Autres", avec le pourcentage de chacun.
 * Le volume est réparti entre tous les muscles de chaque exercice (un set de bench press
 * contribue au volume Pecs, Épaules et Triceps).
 */
export function computeMuscleRepartition(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  period: StatsPeriod,
  othersLabel = 'Autres'
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
  const top7 = sorted.slice(0, MUSCLE_TOP_N)
  const othersVolume = sorted.slice(MUSCLE_TOP_N).reduce((sum, [, v]) => sum + v, 0)
  const allEntries: [string, number][] =
    othersVolume > 0 ? [...top7, [othersLabel, othersVolume]] : top7

  const totalVolume = allEntries.reduce((sum, [, v]) => sum + v, 0)
  return allEntries.map(([muscle, volume]) => ({
    muscle,
    volume,
    pct: Math.round((volume / totalVolume) * 100),
  }))
}

/**
 * Compte le nombre de séries par muscle pour la semaine en cours (lundi → dimanche).
 * Retourne les muscles triés par nombre de séries décroissant, limité à MUSCLE_WEEK_CHART_LIMIT.
 */
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
    .slice(0, MUSCLE_WEEK_CHART_LIMIT)
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
    ctx?: StatsContext
  }
): WeeklySetsChartResult {
  const weeksToShow = options.weeksToShow ?? 4
  const { muscleFilter, ctx } = options

  const currentMonday = getMondayOfCurrentWeek()
  const windowStartMonday = currentMonday + (options.weekOffset * weeksToShow - (weeksToShow - 1)) * WEEK_MS
  const windowEnd = windowStartMonday + weeksToShow * WEEK_MS

  // Use shared context or build locally
  const historyDates = ctx?.historyDates ?? new Map(histories.filter(h => h.deletedAt === null).map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = ctx?.historyIds ?? new Set(histories.filter(h => h.deletedAt === null).map(h => h.id))
  const exerciseMuscles = ctx?.exerciseMuscles ?? new Map<string, string[]>(exercises.map(e => [e.id, e.muscles] as [string, string[]]))

  // Single pass: bucket each set into the right week
  const buckets = new Array<number>(weeksToShow).fill(0)
  for (const s of sets) {
    const hId = s.history.id
    if (!activeHistoryIds.has(hId)) continue
    const d = historyDates.get(hId) ?? 0
    if (d < windowStartMonday || d >= windowEnd) continue
    if (muscleFilter !== null) {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      if (!muscles.some(m => m.trim() === muscleFilter)) continue
    }
    const idx = Math.floor((d - windowStartMonday) / WEEK_MS)
    if (idx >= 0 && idx < weeksToShow) buckets[idx]++
  }

  // Build labels
  const labels: string[] = []
  for (let i = 0; i < weeksToShow; i++) {
    const weekDate = new Date(windowStartMonday + i * WEEK_MS)
    labels.push(`${String(weekDate.getDate()).padStart(2, '0')}/${String(weekDate.getMonth() + 1).padStart(2, '0')}`)
  }

  const lastWeekSunday = new Date(windowEnd - 1)
  const firstDate = new Date(windowStartMonday)
  const weekRangeLabel =
    `${String(firstDate.getDate()).padStart(2, '0')}/${String(firstDate.getMonth() + 1).padStart(2, '0')}` +
    ` – ` +
    `${String(lastWeekSunday.getDate()).padStart(2, '0')}/${String(lastWeekSunday.getMonth() + 1).padStart(2, '0')}`

  return { labels, data: buckets, weekRangeLabel, hasPrev: true, hasNext: options.weekOffset < 0 }
}

/**
 * Calcule les séries par mois sur toute l'historique (vue "Tout").
 * Retourne au maximum les 12 derniers mois.
 *
 * @param muscleFilter - null = tous muscles, string = filtre sur un muscle précis
 * @param monthLabels - localized month abbreviations (12 entries)
 */
export function computeMonthlySetsChart(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  muscleFilter: string | null,
  ctx?: StatsContext,
  monthLabels?: string[]
): MonthlySetsChartResult {
  const MONTH_LABELS_DEFAULT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const historyDates = ctx?.historyDates ?? new Map(histories.filter(h => h.deletedAt === null).map(h => [h.id, h.startTime.getTime()]))
  const activeHistoryIds = ctx?.historyIds ?? new Set(histories.filter(h => h.deletedAt === null).map(h => h.id))
  const exerciseMuscles = ctx?.exerciseMuscles ?? new Map<string, string[]>(exercises.map(e => [e.id, e.muscles] as [string, string[]]))
  const labels_ = monthLabels ?? MONTH_LABELS_DEFAULT

  // Single pass: bucket by "YYYY-M" key, track oldest active set for month range
  const buckets = new Map<string, number>()
  let oldest = Infinity
  let hasActiveSet = false

  for (const s of sets) {
    const hId = s.history.id
    if (!activeHistoryIds.has(hId)) continue
    const d = historyDates.get(hId) ?? 0
    if (!hasActiveSet) { hasActiveSet = true }
    if (d < oldest) oldest = d

    if (muscleFilter !== null) {
      const muscles = exerciseMuscles.get(s.exercise.id) ?? []
      if (!muscles.some(mu => mu.trim() === muscleFilter)) continue
    }
    const dt = new Date(d)
    const key = `${dt.getFullYear()}-${dt.getMonth()}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  if (!hasActiveSet) return { labels: [], data: [] }

  const oldestDate = new Date(oldest)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Collect all months from oldest to current
  const allMonths: { year: number; month: number }[] = []
  let y = oldestDate.getFullYear()
  let m = oldestDate.getMonth()
  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    allMonths.push({ year: y, month: m })
    m++
    if (m > 11) { m = 0; y++ }
  }

  // Keep at most the last N months
  const months = allMonths.slice(-MONTHLY_CHART_MAX_MONTHS)
  const resultLabels: string[] = []
  const data: number[] = []

  for (const { year, month } of months) {
    resultLabels.push(labels_[month])
    data.push(buckets.get(`${year}-${month}`) ?? 0)
  }

  return { labels: resultLabels, data }
}
