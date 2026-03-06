// ─── Stats — Shared Context (computed once per render) ──────────────────────

import type History from '../models/History'
import type Exercise from '../models/Exercise'
import type { StatsContext } from './statsTypes'

/**
 * Build a shared StatsContext from histories and exercises.
 * Call once in a useMemo, then pass to all stats functions to avoid
 * redundant O(H+E) rebuilds per function.
 */
export function prepareStatsContext(
  histories: History[],
  exercises: Exercise[]
): StatsContext {
  const activeHistories = histories.filter(h => h.deletedAt === null)

  const historyDates = new Map<string, number>()
  const historyIds = new Set<string>()
  for (const h of activeHistories) {
    historyIds.add(h.id)
    historyDates.set(h.id, h.startTime.getTime())
  }

  const exerciseMuscles = new Map<string, string[]>()
  for (const e of exercises) {
    exerciseMuscles.set(e.id, e.muscles)
  }

  return { historyDates, historyIds, exerciseMuscles }
}
