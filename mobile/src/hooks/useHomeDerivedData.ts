/**
 * useHomeDerivedData — Pre-computes ALL derived metrics for HomeScreen.
 *
 * Instead of having multiple child components recalculate the same values
 * (streak, weekly activity, session counts, volume, etc.), this hook
 * centralises every derivation in one place with useMemo.
 *
 * Raw DB data still comes from withObservables; this hook sits between
 * the HOC output and the child components.
 */

import { useMemo } from 'react'

import type History from '../model/models/History'
import type WorkoutSet from '../model/models/Set'
import type Session from '../model/models/Session'
import type User from '../model/models/User'
import type { WeeklyActivityData } from '../model/utils/statsTypes'
import { computeMotivationalPhrase, buildWeeklyActivity } from '../model/utils/statsHelpers'
import { computeCurrentStreak, computeRecordStreak } from '../model/utils/statsKPIs'
import { xpToNextLevel, formatTonnage } from '../model/utils/gamificationHelpers'
import type { Language } from '../i18n'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface XPProgress {
  current: number
  required: number
  percentage: number
}

export interface WeeklySummary {
  sessionCount: number
  totalVolumeKg: number
}

export interface HomeDerivedData {
  /** User object (first in array, or null) */
  user: User | null

  /** XP progress towards next level */
  xpProgress: XPProgress

  /** Current consecutive-day streak (computed from histories) */
  currentStreak: number

  /** All-time best streak (computed from histories) */
  recordStreak: number

  /** Weekly activity breakdown (Mon-Sun, sessions per day) */
  weeklyActivity: WeeklyActivityData

  /** Summary of the current week (session count + total volume) */
  weeklySummary: WeeklySummary

  /** Last completed history entry (or null) */
  lastCompletedHistory: History | null

  /** Session name of the last completed history (or null) */
  lastSessionName: string | null

  /** Motivational phrase based on current stats */
  motivationalPhrase: string

  /** Formatted total tonnage string */
  formattedTonnage: string
}

// ─── Input ──────────────────────────────────────────────────────────────────

export interface HomeDerivedDataInput {
  users: User[]
  histories: History[]
  sets: WorkoutSet[]
  sessions: Session[]
  language: Language
  dayLabels: string[]
  sessionFallback: string
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useHomeDerivedData({
  users,
  histories,
  sets,
  sessions,
  language,
  dayLabels,
  sessionFallback,
}: HomeDerivedDataInput): HomeDerivedData {
  const user = users[0] ?? null

  const xpProgress = useMemo(
    () => xpToNextLevel(user?.totalXp ?? 0, user?.level ?? 1),
    [user?.totalXp, user?.level],
  )

  const currentStreak = useMemo(
    () => computeCurrentStreak(histories),
    [histories],
  )

  const recordStreak = useMemo(
    () => computeRecordStreak(histories),
    [histories],
  )

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(histories, sets, sessions, dayLabels, sessionFallback),
    [histories, sets, sessions, dayLabels, sessionFallback],
  )

  const weeklySummary = useMemo((): WeeklySummary => {
    const sessionCount = weeklyActivity.reduce(
      (acc, d) => acc + d.sessions.length,
      0,
    )
    const totalVolumeKg = weeklyActivity.reduce(
      (acc, d) => acc + d.sessions.reduce((a, s) => a + s.volumeKg, 0),
      0,
    )
    return { sessionCount, totalVolumeKg }
  }, [weeklyActivity])

  const lastCompletedHistory = useMemo(() => {
    const completed = histories.filter(h => h.endTime)
    if (completed.length === 0) return null
    return completed.sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime(),
    )[0]
  }, [histories])

  const lastSessionName = useMemo(() => {
    if (!lastCompletedHistory) return null
    const sessionId = lastCompletedHistory.session.id
    const session = sessions.find(s => s.id === sessionId)
    return session?.name ?? null
  }, [lastCompletedHistory, sessions])

  const motivationalPhrase = useMemo(
    () => computeMotivationalPhrase(histories, sets, language),
    [histories, sets, language],
  )

  const formattedTonnage = useMemo(
    () => formatTonnage(user?.totalTonnage ?? 0),
    [user?.totalTonnage],
  )

  return {
    user,
    xpProgress,
    currentStreak,
    recordStreak,
    weeklyActivity,
    weeklySummary,
    lastCompletedHistory,
    lastSessionName,
    motivationalPhrase,
    formattedTonnage,
  }
}
