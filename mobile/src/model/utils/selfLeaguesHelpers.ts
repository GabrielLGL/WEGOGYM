// ─── Self-Leagues — Helpers ──────────────────────────────────────────────────
// Compare tes propres périodes passées par métrique choisie.

import type History from '../models/History'
import type WorkoutSet from '../models/Set'
import { MINUTE_MS } from '../constants'

export type SelfLeaguesMetric = 'volume' | 'sessions' | 'prs' | 'tonnage' | 'duration'
export type SelfLeaguesPeriodSize = 'week' | 'month'

export interface SelfLeaguesPeriodStats {
  label: string
  startDate: number
  endDate: number
  volume: number
  sessions: number
  prs: number
  tonnage: number
  durationMin: number
  isCurrentPeriod: boolean
}

export interface SelfLeaguesEntry extends SelfLeaguesPeriodStats {
  rank: number
  value: number
  pctFromAvg: number
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const MONTH_NAMES_SHORT_FR = [
  'janv', 'févr', 'mars', 'avr', 'mai', 'juin',
  'juil', 'août', 'sept', 'oct', 'nov', 'déc',
]
const MONTH_NAMES_FULL_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatWeekLabel(startTs: number, endTs: number): string {
  const start = new Date(startTs)
  const end = new Date(endTs)
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = MONTH_NAMES_SHORT_FR[start.getMonth()]
  const endMonth = MONTH_NAMES_SHORT_FR[end.getMonth()]

  if (start.getMonth() === end.getMonth()) {
    return `${startDay}–${endDay} ${startMonth}`
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`
}

function formatMonthLabel(startTs: number): string {
  const d = new Date(startTs)
  return `${MONTH_NAMES_FULL_FR[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Period generation ────────────────────────────────────────────────────────

/**
 * Returns the Monday of the week containing the given date.
 */
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns the Sunday of the week containing the given date.
 */
function getSundayOf(date: Date): Date {
  const monday = getMondayOf(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

// ─── Main functions ───────────────────────────────────────────────────────────

/**
 * Generates all periods from the earliest history to now,
 * and computes stats for each period.
 */
export function computeSelfLeaguePeriods(
  histories: History[],
  sets: WorkoutSet[],
  periodSize: SelfLeaguesPeriodSize,
): SelfLeaguesPeriodStats[] {
  const activeHistories = histories.filter(h => h.deletedAt === null && !h.isAbandoned)
  if (activeHistories.length === 0) return []

  const now = Date.now()

  // Build set index: historyId → sets
  const setsByHistory = new Map<string, WorkoutSet[]>()
  for (const s of sets) {
    const hid = s.history.id
    const arr = setsByHistory.get(hid) ?? []
    arr.push(s)
    setsByHistory.set(hid, arr)
  }

  const earliestTs = Math.min(...activeHistories.map(h => h.startTime.getTime()))

  const periods: SelfLeaguesPeriodStats[] = []

  if (periodSize === 'week') {
    // Iterate weekly from the Monday of the earliest history to the current week
    let currentMonday = getMondayOf(new Date(earliestTs))
    const todayMonday = getMondayOf(new Date(now))

    while (currentMonday.getTime() <= todayMonday.getTime()) {
      const startDate = currentMonday.getTime()
      const sunday = getSundayOf(currentMonday)
      const endDate = sunday.getTime()
      const isCurrentPeriod = now >= startDate && now <= endDate

      const periodHistories = activeHistories.filter(h => {
        const ts = h.startTime.getTime()
        return ts >= startDate && ts <= endDate
      })
      const periodHistoryIds = new Set(periodHistories.map(h => h.id))
      const periodSets = sets.filter(s => periodHistoryIds.has(s.history.id))

      const volume = periodSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      const tonnage = volume
      const prs = periodSets.filter(s => s.isPr).length
      const durationMin = periodHistories
        .filter(h => h.endTime != null)
        .reduce((sum, h) => sum + Math.round((h.endTime!.getTime() - h.startTime.getTime()) / MINUTE_MS), 0)

      periods.push({
        label: formatWeekLabel(startDate, endDate),
        startDate,
        endDate,
        volume,
        sessions: periodHistories.length,
        prs,
        tonnage,
        durationMin,
        isCurrentPeriod,
      })

      // Advance to next Monday
      const next = new Date(currentMonday)
      next.setDate(currentMonday.getDate() + 7)
      currentMonday = next
    }
  } else {
    // Iterate monthly from the 1st of the earliest month to the current month
    const earliestDate = new Date(earliestTs)
    let year = earliestDate.getFullYear()
    let month = earliestDate.getMonth()

    const todayDate = new Date(now)
    const todayYear = todayDate.getFullYear()
    const todayMonth = todayDate.getMonth()

    while (year < todayYear || (year === todayYear && month <= todayMonth)) {
      const firstDay = new Date(year, month, 1, 0, 0, 0, 0)
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999)
      const startDate = firstDay.getTime()
      const endDate = lastDay.getTime()
      const isCurrentPeriod = now >= startDate && now <= endDate

      const periodHistories = activeHistories.filter(h => {
        const ts = h.startTime.getTime()
        return ts >= startDate && ts <= endDate
      })
      const periodHistoryIds = new Set(periodHistories.map(h => h.id))
      const periodSets = sets.filter(s => periodHistoryIds.has(s.history.id))

      const volume = periodSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      const tonnage = volume
      const prs = periodSets.filter(s => s.isPr).length
      const durationMin = periodHistories
        .filter(h => h.endTime != null)
        .reduce((sum, h) => sum + Math.round((h.endTime!.getTime() - h.startTime.getTime()) / MINUTE_MS), 0)

      periods.push({
        label: formatMonthLabel(startDate),
        startDate,
        endDate,
        volume,
        sessions: periodHistories.length,
        prs,
        tonnage,
        durationMin,
        isCurrentPeriod,
      })

      month++
      if (month > 11) {
        month = 0
        year++
      }
    }
  }

  return periods
}

/**
 * Ranks periods by the chosen metric (descending).
 * Returns periods sorted by rank with pctFromAvg computed.
 */
export function buildSelfLeaguesRanking(
  periods: SelfLeaguesPeriodStats[],
  metric: SelfLeaguesMetric,
): SelfLeaguesEntry[] {
  if (periods.length === 0) return []

  const getValue = (p: SelfLeaguesPeriodStats): number => {
    switch (metric) {
      case 'volume':   return p.volume
      case 'sessions': return p.sessions
      case 'prs':      return p.prs
      case 'tonnage':  return p.tonnage
      case 'duration': return p.durationMin
    }
  }

  const sorted = [...periods].sort((a, b) => getValue(b) - getValue(a))
  const total = sorted.reduce((sum, p) => sum + getValue(p), 0)
  const avg = sorted.length > 0 ? total / sorted.length : 0

  return sorted.map((p, i) => {
    const value = getValue(p)
    const pctFromAvg = avg > 0 ? Math.round(((value - avg) / avg) * 100) : 0
    return { ...p, rank: i + 1, value, pctFromAvg }
  })
}
