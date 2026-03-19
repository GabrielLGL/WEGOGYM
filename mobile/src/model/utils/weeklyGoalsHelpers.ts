/**
 * weeklyGoalsHelpers — Calcul de la progression des objectifs hebdomadaires
 *
 * Éphémère — aucune persistance DB, calculé à la volée.
 */

export interface WeeklyGoalProgress {
  sessionsCount: number
  sessionsTarget: number
  sessionsPct: number
  volumeKg: number
  volumeTarget: number
  volumePct: number
  weekLabel: string
  daysRemaining: number
  completed: boolean
}

import { getMondayOfWeek } from './dateHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

/** @deprecated Utiliser getMondayOfWeek de dateHelpers directement */
export const getWeekStart = getMondayOfWeek

/**
 * Calcule la progression des objectifs de la semaine en cours (lun-dim).
 *
 * @param histories - Historiques non supprimés avec startTime et id
 * @param sets - Séries avec weight, reps et historyId
 * @param language - 'fr' | 'en' pour le format du label
 * @param sessionsTarget - Objectif de séances (défaut: 4)
 * @param volumeTarget - Objectif de volume en kg (défaut: 20000)
 */
export function computeWeeklyGoals(
  histories: ReadonlyArray<{ id: string; startTime: Date; deletedAt: Date | null; isAbandoned: boolean }>,
  sets: ReadonlyArray<{ weight: number; reps: number; historyId: string }>,
  language: 'fr' | 'en',
  sessionsTarget = 4,
  volumeTarget = 20000,
): WeeklyGoalProgress {
  const now = new Date()
  const monday = getMondayOfWeek(now)
  const mondayTs = monday.getTime()
  const sunday = new Date(mondayTs + 7 * DAY_MS - 1)

  // Filter histories for this week (active only)
  const weekHistories = histories.filter(h =>
    h.deletedAt === null &&
    !h.isAbandoned &&
    h.startTime.getTime() >= mondayTs &&
    h.startTime.getTime() < mondayTs + 7 * DAY_MS,
  )

  const weekHistoryIds = new Set(weekHistories.map(h => h.id))
  const sessionsCount = weekHistoryIds.size

  // Volume from sets linked to this week's histories
  let volumeKg = 0
  for (const s of sets) {
    if (weekHistoryIds.has(s.historyId)) {
      volumeKg += s.weight * s.reps
    }
  }

  const sessionsPct = sessionsTarget > 0 ? Math.min(100, Math.round((sessionsCount / sessionsTarget) * 100)) : 0
  const volumePct = volumeTarget > 0 ? Math.min(100, Math.round((volumeKg / volumeTarget) * 100)) : 0

  // Days remaining (including today)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const daysRemaining = Math.max(0, Math.ceil((sunday.getTime() - todayStart.getTime()) / DAY_MS))

  // Week label
  const dayStart = monday.getDate()
  const dayEnd = sunday.getDate()
  const weekLabel = language === 'fr'
    ? `${dayStart}-${dayEnd} ${formatMonthFr(monday, sunday)}`
    : `${formatMonthEn(monday, sunday)} ${dayStart}-${dayEnd}`

  return {
    sessionsCount,
    sessionsTarget,
    sessionsPct,
    volumeKg: Math.round(volumeKg),
    volumeTarget,
    volumePct,
    weekLabel,
    daysRemaining,
    completed: sessionsPct >= 100 && volumePct >= 100,
  }
}

const MONTHS_FR = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthFr(monday: Date, sunday: Date): string {
  if (monday.getMonth() === sunday.getMonth()) {
    return MONTHS_FR[monday.getMonth()]
  }
  return `${MONTHS_FR[monday.getMonth()]}-${MONTHS_FR[sunday.getMonth()]}`
}

function formatMonthEn(monday: Date, sunday: Date): string {
  if (monday.getMonth() === sunday.getMonth()) {
    return MONTHS_EN[monday.getMonth()]
  }
  return `${MONTHS_EN[monday.getMonth()]}-${MONTHS_EN[sunday.getMonth()]}`
}
