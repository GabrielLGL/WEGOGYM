/**
 * streakHeatmapHelpers — GitHub-style heatmap with streak stats (13 weeks).
 */

import { getMondayOfWeekTs as getMondayOfWeek } from './dateHelpers'

export interface HeatmapDay {
  date: string          // 'YYYY-MM-DD'
  count: number
  intensity: 0 | 1 | 2 | 3
  isToday: boolean
}

export interface HeatmapResult {
  days: HeatmapDay[]    // 91 jours, aligné lundi
  totalWorkouts: number
  activeDays: number
  currentStreak: number
  longestStreak: number
}

interface HistoryLike {
  createdAt: Date | number
  deletedAt: Date | null
  isAbandoned: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function computeStreakHeatmap(histories: HistoryLike[]): HeatmapResult {
  const now = Date.now()
  const todayStart = startOfDay(now)
  const currentMonday = getMondayOfWeek(now)
  const weeks = 13
  const totalDays = weeks * 7
  const startMonday = currentMonday - (weeks - 1) * 7 * DAY_MS

  // Filter valid histories
  const valid = histories.filter(h => h.deletedAt === null && !h.isAbandoned)

  // Count sessions per day
  const dayCounts = new Map<number, number>()
  for (const h of valid) {
    const ts = typeof h.createdAt === 'number' ? h.createdAt : h.createdAt.getTime()
    const dayTs = startOfDay(ts)
    if (dayTs >= startMonday && dayTs <= todayStart) {
      dayCounts.set(dayTs, (dayCounts.get(dayTs) ?? 0) + 1)
    }
  }

  // Build days array
  const days: HeatmapDay[] = []
  let totalWorkouts = 0
  let activeDays = 0

  for (let i = 0; i < totalDays; i++) {
    const dayTs = startMonday + i * DAY_MS
    const count = dayCounts.get(dayTs) ?? 0
    if (count > 0) {
      totalWorkouts += count
      activeDays++
    }
    days.push({
      date: formatDate(dayTs),
      count,
      intensity: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
      isToday: dayTs === todayStart,
    })
  }

  // Compute streaks (consecutive days with >=1 session, scanning all valid histories)
  const allDayTimestamps = new Set<number>()
  for (const h of valid) {
    const ts = typeof h.createdAt === 'number' ? h.createdAt : h.createdAt.getTime()
    allDayTimestamps.add(startOfDay(ts))
  }

  const sortedDays = Array.from(allDayTimestamps).sort((a, b) => a - b)
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0
  let prevDay = -Infinity

  for (const dayTs of sortedDays) {
    if (prevDay === -Infinity || dayTs - prevDay === DAY_MS) {
      streak++
    } else {
      streak = 1
    }
    if (streak > longestStreak) longestStreak = streak
    prevDay = dayTs
  }

  // Check if current streak includes today or yesterday
  if (prevDay === todayStart || prevDay === todayStart - DAY_MS) {
    currentStreak = streak
  }

  return { days, totalWorkouts, activeDays, currentStreak, longestStreak }
}
