import History from '../models/History'
import WorkoutSet from '../models/Set'

export interface FlashbackData {
  sessions: number
  volumeKg: number
  periodStart: number
  periodEnd: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Calcule les statistiques d'une période passée (1 ou 3 mois) dans une fenêtre ±3 jours.
 * Fenêtre : [targetDate - 3 jours, targetDate + 3 jours]
 * @returns null si aucune séance active dans la fenêtre
 */
export function computeFlashback(
  histories: History[],
  sets: WorkoutSet[],
  monthsAgo: 1 | 3,
): FlashbackData | null {
  const now = Date.now()
  const targetDate = now - monthsAgo * 30 * DAY_MS
  const periodStart = targetDate - 3 * DAY_MS
  const periodEnd = targetDate + 3 * DAY_MS

  const windowHistories = histories.filter(h => {
    if (h.isAbandoned || h.deletedAt !== null) return false
    const ts = h.startTime.getTime()
    return ts >= periodStart && ts <= periodEnd
  })

  if (windowHistories.length === 0) return null

  const windowHistoryIds = new Set(windowHistories.map(h => h.id))
  const volumeKg = sets
    .filter(s => windowHistoryIds.has(s.history.id))
    .reduce((sum, s) => sum + s.weight * s.reps, 0)

  return {
    sessions: windowHistories.length,
    volumeKg,
    periodStart,
    periodEnd,
  }
}
