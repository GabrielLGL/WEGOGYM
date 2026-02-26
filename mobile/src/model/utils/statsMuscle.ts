// ─── Stats — Muscle Repartition & Sets per Muscle ─────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'
import type { StatsPeriod, MuscleRepartitionEntry, MuscleWeekEntry, MuscleWeekHistoryEntry } from './statsTypes'
import { getPeriodStart } from './statsDateUtils'

function getMondayOfCurrentWeek(): number {
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
