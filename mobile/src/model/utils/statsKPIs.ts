// ─── Stats — KPIs, Streaks & Motivational Phrase ──────────────────────────────

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import type { GlobalKPIs } from './statsTypes'
import { toDateKey } from './statsDateUtils'
import { formatVolume } from './statsVolume'
import type { Language } from '../../i18n'
import { translations } from '../../i18n'

function getActiveDayStrings(histories: History[]): Set<string> {
  const days = new Set<string>()
  histories
    .filter(h => h.deletedAt === null)
    .forEach(h => days.add(toDateKey(h.startTime)))
  return days
}

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

export function computeMotivationalPhrase(
  histories: History[],
  sets: WorkoutSet[],
  language: Language = 'fr',
): string {
  const m = translations[language].home.motivational
  const activeHistories = histories.filter(h => h.deletedAt === null)
  const activeHistoryIds = new Set(activeHistories.map(h => h.id))

  // 1. Streak ≥ 3
  const streak = computeCurrentStreak(activeHistories)
  if (streak >= 3) {
    return m.streak.replace('{n}', String(streak))
  }

  // 2. PR cette semaine (7 derniers jours)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const hasPRThisWeek = sets.some(
    s => s.isPr && activeHistoryIds.has(s.history.id) && s.createdAt.getTime() > oneWeekAgo
  )
  if (hasPRThisWeek) {
    return m.weeklyRecord
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
      return m.returning.replace('{n}', String(daysSinceLast))
    }
  }

  // 4. Premier jour du mois
  if (new Date().getDate() === 1) {
    return m.newMonth
  }

  // 5. Régularité ≥ 4 séances/semaine (sur 4 semaines)
  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000
  const recentCount = activeHistories.filter(h => h.startTime.getTime() > fourWeeksAgo).length
  const avgPerWeek = recentCount / 4
  if (avgPerWeek >= 4) {
    return m.consistency.replace('{n}', String(Math.round(avgPerWeek)))
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

  return m.volume.replace('{volume}', formatVolume(monthVolume))
}
