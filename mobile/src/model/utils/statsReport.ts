// ─── Stats — Report Summary (weekly / monthly) ──────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type {
  ReportPeriod,
  ReportSummary,
  StatsContext,
  MuscleRepartitionEntry,
  VolumeTopExercise,
  ExercisePR,
} from './statsTypes'
import { prepareStatsContext } from './statsContext'
import { computeCurrentStreak } from './statsKPIs'
import { MINUTE_MS, WEEK_MS, EPLEY_FORMULA_DIVISOR } from '../constants'

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const TOP_LIMIT = 3

// ─── Period helpers ──────────────────────────────────────────────────────────

/**
 * Returns the ReportPeriod for a given week offset.
 * weekOffset=0 → current week (Monday-Sunday), -1 → previous week, etc.
 */
export function getWeekPeriod(weekOffset: number): ReportPeriod {
  const now = new Date()
  const day = now.getDay() // 0=dim, 1=lun, ..., 6=sam
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  // ISO week number
  const jan4 = new Date(monday.getFullYear(), 0, 4)
  const startOfYear = new Date(jan4)
  const dayOfJan4 = jan4.getDay() || 7
  startOfYear.setDate(jan4.getDate() - (dayOfJan4 - 1))
  const weekNumber = Math.ceil(
    ((monday.getTime() - startOfYear.getTime()) / WEEK_MS) + 1
  )

  const monthName = MONTH_NAMES_FR[monday.getMonth()]
  const label = `Sem. ${weekNumber} — ${monthName} ${monday.getFullYear()}`

  return {
    type: 'weekly',
    startDate: monday.getTime(),
    endDate: sunday.getTime(),
    label,
  }
}

/**
 * Returns the ReportPeriod for a given month offset.
 * monthOffset=0 → current month, -1 → previous month, etc.
 */
export function getMonthPeriod(monthOffset: number): ReportPeriod {
  const now = new Date()
  const targetMonth = now.getMonth() + monthOffset
  const targetYear = now.getFullYear()

  const firstDay = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0)
  const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

  const monthName = MONTH_NAMES_FR[firstDay.getMonth()]
  const label = `${monthName} ${firstDay.getFullYear()}`

  return {
    type: 'monthly',
    startDate: firstDay.getTime(),
    endDate: lastDay.getTime(),
    label,
  }
}

// ─── Report computation ──────────────────────────────────────────────────────

/**
 * Computes a full ReportSummary for the given period.
 * Aggregates sessions count, volume, duration, PRs, streak, muscle repartition,
 * top exercises, and comparison vs previous period.
 */
export function computeReportSummary(
  histories: History[],
  sets: WorkoutSet[],
  exercises: Exercise[],
  period: ReportPeriod,
  ctx?: StatsContext,
): ReportSummary {
  const context = ctx ?? prepareStatsContext(histories, exercises)

  // 1. Filter histories to the period
  const periodHistories = histories.filter(h => {
    if (h.deletedAt !== null || h.isAbandoned) return false
    const ts = h.startTime.getTime()
    return ts >= period.startDate && ts <= period.endDate
  })

  const periodHistoryIds = new Set(periodHistories.map(h => h.id))

  // 2. Filter sets to those belonging to filtered histories
  const periodSets = sets.filter(s => periodHistoryIds.has(s.history.id))

  // 3. Sessions count
  const sessionsCount = periodHistories.length

  // 4. Total volume
  const totalVolumeKg = periodSets.reduce((sum, s) => sum + s.weight * s.reps, 0)

  // 5. Duration stats
  const durationsMin = periodHistories
    .filter(h => h.endTime != null)
    .map(h => Math.round((h.endTime!.getTime() - h.startTime.getTime()) / MINUTE_MS))
    .filter(d => d > 0)

  const totalDurationMin = durationsMin.reduce((sum, d) => sum + d, 0)
  const avgDurationMin = durationsMin.length > 0
    ? Math.round(totalDurationMin / durationsMin.length)
    : 0

  // 6. PRs in the period
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const prSets = periodSets.filter(s => s.isPr)
  const prsCount = prSets.length

  const bestByExercise = new Map<string, { weight: number; reps: number; date: number }>()
  for (const s of prSets) {
    const exId = s.exercise.id
    const existing = bestByExercise.get(exId)
    if (!existing || s.weight > existing.weight || (s.weight === existing.weight && s.reps > existing.reps)) {
      bestByExercise.set(exId, {
        weight: s.weight,
        reps: s.reps,
        date: s.createdAt.getTime(),
      })
    }
  }

  const prs: ExercisePR[] = Array.from(bestByExercise.entries())
    .map(([exerciseId, { weight, reps, date }]) => ({
      exerciseId,
      exerciseName: exerciseNames.get(exerciseId) ?? exerciseId,
      weight,
      reps,
      date,
      orm1: Math.round(weight * (1 + reps / EPLEY_FORMULA_DIVISOR)),
    }))
    .sort((a, b) => b.date - a.date)

  // 7. Current streak (uses all histories, not just period)
  const currentStreak = computeCurrentStreak(histories)

  // 8. Compared to previous period (volume % change)
  const periodLengthMs = period.endDate - period.startDate
  const prevStart = period.startDate - periodLengthMs - 1
  const prevEnd = period.startDate - 1

  let prevTotalVolume = 0
  const prevHistoryIds = new Set<string>()
  for (const h of histories) {
    if (h.deletedAt !== null || h.isAbandoned) continue
    const ts = h.startTime.getTime()
    if (ts >= prevStart && ts <= prevEnd) {
      prevHistoryIds.add(h.id)
    }
  }
  for (const s of sets) {
    if (prevHistoryIds.has(s.history.id)) {
      prevTotalVolume += s.weight * s.reps
    }
  }

  const comparedToPrevious = prevTotalVolume > 0
    ? Math.round(((totalVolumeKg - prevTotalVolume) / prevTotalVolume) * 100)
    : 0

  // 9. Top muscles (top 3 by volume)
  const exerciseMuscles = context.exerciseMuscles
  const muscleVolume = new Map<string, number>()
  for (const s of periodSets) {
    const muscles = exerciseMuscles.get(s.exercise.id) ?? []
    const vol = s.weight * s.reps
    for (const muscle of muscles) {
      const trimmed = muscle.trim()
      if (!trimmed) continue
      muscleVolume.set(trimmed, (muscleVolume.get(trimmed) ?? 0) + vol)
    }
  }

  const totalMuscleVolume = Array.from(muscleVolume.values()).reduce((a, b) => a + b, 0)
  const topMuscles: MuscleRepartitionEntry[] = Array.from(muscleVolume.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LIMIT)
    .map(([muscle, volume]) => ({
      muscle,
      volume,
      pct: totalMuscleVolume > 0 ? Math.round((volume / totalMuscleVolume) * 100) : 0,
    }))

  // 10. Top exercises (top 3 by volume)
  const volumeByExercise = new Map<string, number>()
  for (const s of periodSets) {
    const exId = s.exercise.id
    volumeByExercise.set(exId, (volumeByExercise.get(exId) ?? 0) + s.weight * s.reps)
  }

  const topExercises: VolumeTopExercise[] = Array.from(volumeByExercise.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_LIMIT)
    .map(([id, vol]) => ({
      exerciseId: id,
      name: exerciseNames.get(id) ?? id,
      volume: vol,
    }))

  return {
    period,
    sessionsCount,
    totalVolumeKg,
    totalDurationMin,
    avgDurationMin,
    prsCount,
    currentStreak,
    comparedToPrevious,
    topMuscles,
    topExercises,
    prs,
  }
}
