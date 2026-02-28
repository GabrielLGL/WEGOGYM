// ─── Stats — Duration ─────────────────────────────────────────────────────────

import type History from '../models/History'
import type { DurationStats } from './statsTypes'

export const MIN_VALID_DURATION_MIN = 10

export function computeDurationStats(histories: History[]): DurationStats {
  const withDuration = histories
    .filter(h => h.deletedAt == null)
    .filter(h => h.endTime != null)
    .map(h => ({
      id: h.id,
      date: h.startTime.getTime(),
      durationMin: Math.round((h.endTime!.getTime() - h.startTime.getTime()) / 60000),
    }))
    .filter(e => e.durationMin >= MIN_VALID_DURATION_MIN)
    .sort((a, b) => a.date - b.date)

  if (withDuration.length === 0) {
    return { avgMin: 0, totalHours: 0, minMin: 0, maxMin: 0, perSession: [], historyAll: [] }
  }

  const durations = withDuration.map(e => e.durationMin)
  const totalMin = durations.reduce((sum, d) => sum + d, 0)

  return {
    avgMin: Math.round(totalMin / durations.length),
    totalHours: Math.round((totalMin / 60) * 10) / 10,
    minMin: Math.min(...durations),
    maxMin: Math.max(...durations),
    perSession: withDuration.slice(-30),
    historyAll: [...withDuration].reverse(),
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
