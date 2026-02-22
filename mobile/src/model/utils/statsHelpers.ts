import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type Exercise from '../models/Exercise'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatsPeriod = '1m' | '3m' | 'all'

export interface GlobalKPIs {
  totalSessions: number
  totalVolumeKg: number
  totalPRs: number
}

export interface DurationStats {
  avgMin: number
  totalHours: number
  minMin: number
  maxMin: number
  perSession: Array<{ date: number; durationMin: number }>
}

export interface VolumeWeekEntry {
  weekLabel: string
  volume: number
}

export interface VolumeTopExercise {
  exerciseId: string
  name: string
  volume: number
}

export interface VolumeStats {
  total: number
  perWeek: VolumeWeekEntry[]
  topExercises: VolumeTopExercise[]
  comparedToPrevious: number
}

export interface MuscleRepartitionEntry {
  muscle: string
  volume: number
  pct: number
}

export interface ExercisePR {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: number
  orm1: number
}

export interface ExerciseFrequency {
  exerciseId: string
  exerciseName: string
  count: number
}

// ─── Period Filter ────────────────────────────────────────────────────────────

function getPeriodStart(period: StatsPeriod): number {
  if (period === 'all') return 0
  const days = period === '1m' ? 30 : 90
  return Date.now() - days * 24 * 60 * 60 * 1000
}

// ─── Date key helper ─────────────────────────────────────────────────────────

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ─── Period Labels (partagés avec les écrans Stats) ───────────────────────────

export const PERIOD_LABELS = ['1 mois', '3 mois', 'Tout'] as const

export function labelToPeriod(label: string | null): StatsPeriod {
  if (label === '3 mois') return '3m'
  if (label === 'Tout') return 'all'
  return '1m'
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export function computeGlobalKPIs(
  histories: History[],
  sets: WorkoutSet[]
): GlobalKPIs {
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))
  const activeSets = sets.filter(s => activeHistoryIds.has(s.history.id))

  return {
    totalSessions: activeHistories.length,
    totalVolumeKg: activeSets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    totalPRs: activeSets.filter(s => s.isPr).length,
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

function getActiveDayStrings(histories: History[]): Set<string> {
  const days = new Set<string>()
  histories
    .filter(h => h.deletedAt === null)
    .forEach(h => days.add(toDateKey(h.startTime)))
  return days
}

export function computeCurrentStreak(histories: History[]): number {
  const days = getActiveDayStrings(histories)
  if (days.size === 0) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateKey(d)

    if (days.has(key)) {
      streak++
    } else if (i === 0) {
      // Pas de séance aujourd'hui — on essaie depuis hier
      continue
    } else {
      break
    }
  }

  return streak
}

export function computeRecordStreak(histories: History[]): number {
  const days = getActiveDayStrings(histories)
  if (days.size === 0) return 0

  const sortedDays = Array.from(days).sort()
  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1])
    const curr = new Date(sortedDays[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000))

    if (diffDays === 1) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

// ─── Motivational Phrase ──────────────────────────────────────────────────────

export function computeMotivationalPhrase(
  histories: History[],
  sets: WorkoutSet[]
): string {
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))

  // 1. Streak ≥ 3
  const streak = computeCurrentStreak(activeHistories)
  if (streak >= 3) {
    return `🔥 ${streak} jours consécutifs — ne lâche rien !`
  }

  // 2. PR cette semaine (7 derniers jours)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const hasPRThisWeek = sets.some(
    s => s.isPr && activeHistoryIds.has(s.history.id) && s.createdAt.getTime() > oneWeekAgo
  )
  if (hasPRThisWeek) {
    return '💥 Nouveau record cette semaine — tu progresses !'
  }

  // 3. Retour après gap > 4 jours
  if (activeHistories.length > 0) {
    const lastSession = [...activeHistories].sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    )[0]
    const daysSinceLast = Math.floor(
      (Date.now() - lastSession.startTime.getTime()) / (24 * 60 * 60 * 1000)
    )
    if (daysSinceLast > 4) {
      return `😤 De retour après ${daysSinceLast} jours — l'important c'est de revenir.`
    }
  }

  // 4. Premier jour du mois
  if (new Date().getDate() === 1) {
    return "🎯 Nouveau mois, nouvelles perfs. C'est parti !"
  }

  // 5. Régularité ≥ 4 séances/semaine (sur 4 semaines)
  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000
  const recentCount = activeHistories.filter(h => h.startTime.getTime() > fourWeeksAgo).length
  const avgPerWeek = recentCount / 4
  if (avgPerWeek >= 4) {
    return `⚡ ${Math.round(avgPerWeek)} séances/semaine — niveau sérieux.`
  }

  // 6. Défaut : volume du mois courant
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthHistoryIds = new Set(
    activeHistories
      .filter(h => h.startTime.getTime() >= monthStart.getTime())
      .map(h => h.id)
  )
  const monthVolume = sets
    .filter(s => monthHistoryIds.has(s.history.id))
    .reduce((sum, s) => sum + s.weight * s.reps, 0)

  return `🚀 Ce mois : ${formatVolume(monthVolume)} soulevés.`
}

// ─── Duration ─────────────────────────────────────────────────────────────────

export function computeDurationStats(histories: History[]): DurationStats {
  const withDuration = histories
    .filter(h => h.deletedAt === null && h.endTime != null)
    .map(h => ({
      date: h.startTime.getTime(),
      durationMin: Math.round((h.endTime!.getTime() - h.startTime.getTime()) / 60000),
    }))
    .filter(e => e.durationMin > 0)
    .sort((a, b) => a.date - b.date)

  if (withDuration.length === 0) {
    return { avgMin: 0, totalHours: 0, minMin: 0, maxMin: 0, perSession: [] }
  }

  const durations = withDuration.map(e => e.durationMin)
  const totalMin = durations.reduce((sum, d) => sum + d, 0)

  return {
    avgMin: Math.round(totalMin / durations.length),
    totalHours: Math.round((totalMin / 60) * 10) / 10,
    minMin: Math.min(...durations),
    maxMin: Math.max(...durations),
    perSession: withDuration.slice(-30),
  }
}

// ─── Volume ───────────────────────────────────────────────────────────────────

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

// ─── Calendar ─────────────────────────────────────────────────────────────────

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

// ─── Muscle Repartition ───────────────────────────────────────────────────────

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

// ─── PRs by Exercise ──────────────────────────────────────────────────────────

export function computePRsByExercise(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[]
): ExercisePR[] {
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const activeHistoryIds = new Set(
    histories.filter(h => h.deletedAt === null).map(h => h.id)
  )

  const bestByExercise = new Map<string, { weight: number; reps: number; date: number }>()
  sets
    .filter(s => s.isPr && activeHistoryIds.has(s.history.id))
    .forEach(s => {
      const exId = s.exercise.id
      const existing = bestByExercise.get(exId)
      if (!existing || s.weight > existing.weight || (s.weight === existing.weight && s.reps > existing.reps)) {
        bestByExercise.set(exId, {
          weight: s.weight,
          reps: s.reps,
          date: s.createdAt.getTime(),
        })
      }
    })

  return Array.from(bestByExercise.entries())
    .map(([exerciseId, { weight, reps, date }]) => ({
      exerciseId,
      exerciseName: exerciseNames.get(exerciseId) ?? exerciseId,
      weight,
      reps,
      date,
      orm1: Math.round(weight * (1 + reps / 30)),
    }))
    .sort((a, b) => b.date - a.date)
}

// ─── Top Exercises by Frequency ───────────────────────────────────────────────

export function computeTopExercisesByFrequency(
  sets: WorkoutSet[],
  exercises: Exercise[],
  histories: History[],
  limit: number = 5
): ExerciseFrequency[] {
  const exerciseNames = new Map(exercises.map(e => [e.id, e.name]))
  const activeHistoryIds = new Set(
    histories.filter(h => h.deletedAt === null).map(h => h.id)
  )

  // Compter les séances uniques par exercice (1 séance = 1 historique)
  const seenPairs = new Set<string>()
  const countByExercise = new Map<string, number>()
  sets
    .filter(s => activeHistoryIds.has(s.history.id))
    .forEach(s => {
      const pair = `${s.exercise.id}:${s.history.id}`
      if (!seenPairs.has(pair)) {
        seenPairs.add(pair)
        const exId = s.exercise.id
        countByExercise.set(exId, (countByExercise.get(exId) ?? 0) + 1)
      }
    })

  return Array.from(countByExercise.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([exerciseId, count]) => ({
      exerciseId,
      exerciseName: exerciseNames.get(exerciseId) ?? exerciseId,
      count,
    }))
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatVolume(kg: number): string {
  return `${Math.round(kg).toLocaleString('fr-FR')} kg`
}
