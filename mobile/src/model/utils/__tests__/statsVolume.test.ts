/**
 * Tests for statsVolume.ts — pure functions, no mocks needed.
 */
import {
  computeVolumeStats,
  computeCalendarData,
  buildHeatmapData,
  formatVolume,
  buildWeeklyActivity,
} from '../statsVolume'
import { toDateKey } from '../statsDateUtils'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Exercise from '../../models/Exercise'
import type Session from '../../models/Session'

// ─── Mock builders ────────────────────────────────────────────────────────────

function h(
  id: string,
  startTime: Date,
  sessionId: string = 'sess1',
  options: { endTime?: Date; deletedAt?: Date } = {}
): History {
  return {
    id,
    startTime,
    endTime: options.endTime ?? null,
    deletedAt: options.deletedAt ?? null,
    session: { id: sessionId },
  } as unknown as History
}

function s(id: string, historyId: string, exerciseId: string, weight: number, reps: number): WorkoutSet {
  return {
    id,
    history: { id: historyId },
    exercise: { id: exerciseId },
    weight,
    reps,
  } as unknown as WorkoutSet
}

function ex(id: string, name: string): Exercise {
  return { id, name } as unknown as Exercise
}

function sess(id: string, name: string): Session {
  return { id, name } as unknown as Session
}

// ─── formatVolume ─────────────────────────────────────────────────────────────

describe('formatVolume', () => {
  it('appends "kg" suffix', () => {
    expect(formatVolume(500)).toContain('kg')
  })

  it('rounds to integer', () => {
    const result = formatVolume(500.7)
    expect(result).toContain('501')
    expect(result).not.toContain('.')
  })

  it('uses fr-FR locale formatting', () => {
    expect(formatVolume(500)).toBe(`${Math.round(500).toLocaleString('fr-FR')} kg`)
  })

  it('handles 0', () => {
    expect(formatVolume(0)).toBe(`${(0).toLocaleString('fr-FR')} kg`)
  })
})

// ─── computeVolumeStats ───────────────────────────────────────────────────────

describe('computeVolumeStats', () => {
  it('returns 0 total and 12 perWeek entries for empty data', () => {
    const result = computeVolumeStats([], [], [], '1m')
    expect(result.total).toBe(0)
    expect(result.perWeek).toHaveLength(12)
    expect(result.topExercises).toHaveLength(0)
  })

  it('calculates total volume for "all" period', () => {
    const history = h('h1', new Date())
    const sets = [s('s1', 'h1', 'e1', 100, 10), s('s2', 'h1', 'e1', 50, 5)]
    const result = computeVolumeStats(sets, [ex('e1', 'Squat')], [history], 'all')
    expect(result.total).toBe(1250)
  })

  it('excludes sets from deleted histories', () => {
    const history = h('h1', new Date(), 's1', { deletedAt: new Date() })
    const sets = [s('s1', 'h1', 'e1', 100, 10)]
    expect(computeVolumeStats(sets, [], [history], 'all').total).toBe(0)
  })

  it('sorts topExercises by volume descending', () => {
    const history = h('h1', new Date())
    const sets = [
      s('s1', 'h1', 'e1', 100, 10), // 1000 for e1
      s('s2', 'h1', 'e2', 200, 10), // 2000 for e2
    ]
    const result = computeVolumeStats(sets, [ex('e1', 'Squat'), ex('e2', 'Bench')], [history], 'all')
    expect(result.topExercises[0].exerciseId).toBe('e2')
    expect(result.topExercises[1].exerciseId).toBe('e1')
  })

  it('computes comparedToPrevious for 1m period', () => {
    const now = Date.now()
    const recent = new Date(now - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    const old = new Date(now - 40 * 24 * 60 * 60 * 1000)    // 40 days ago
    const histories = [h('h1', recent), h('h2', old)]
    const sets = [
      s('s1', 'h1', 'e1', 200, 10), // 2000 recent
      s('s2', 'h2', 'e1', 100, 10), // 1000 previous
    ]
    const result = computeVolumeStats(sets, [ex('e1', 'Squat')], histories, '1m')
    expect(result.comparedToPrevious).toBe(100) // +100%
  })

  it('comparedToPrevious = 0 for "all" period', () => {
    const history = h('h1', new Date())
    const sets = [s('s1', 'h1', 'e1', 100, 10)]
    const result = computeVolumeStats(sets, [], [history], 'all')
    expect(result.comparedToPrevious).toBe(0)
  })
})

// ─── computeCalendarData ──────────────────────────────────────────────────────

describe('computeCalendarData', () => {
  it('returns empty map for empty histories', () => {
    expect(computeCalendarData([])).toEqual(new Map())
  })

  it('maps a session to its date key', () => {
    const date = new Date(2026, 1, 22)
    const result = computeCalendarData([h('h1', date)])
    expect(result.get('2026-02-22')).toBe(1)
  })

  it('accumulates multiple sessions on the same day', () => {
    const date = new Date(2026, 1, 22)
    const result = computeCalendarData([h('h1', date), h('h2', date)])
    expect(result.get('2026-02-22')).toBe(2)
  })

  it('excludes deleted histories', () => {
    const date = new Date(2026, 1, 22)
    const result = computeCalendarData([h('h1', date, 's1', { deletedAt: new Date() })])
    expect(result.has('2026-02-22')).toBe(false)
  })
})

// ─── buildHeatmapData ─────────────────────────────────────────────────────────

describe('buildHeatmapData', () => {
  it('returns exactly 365 days', () => {
    expect(buildHeatmapData([])).toHaveLength(365)
  })

  it('all counts are 0 for empty histories', () => {
    const result = buildHeatmapData([])
    expect(result.every(d => d.count === 0)).toBe(true)
  })

  it('last element is today', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result = buildHeatmapData([])
    expect(result[364].date).toBe(toDateKey(today))
  })

  it('first element is 364 days ago', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const oldest = new Date(today)
    oldest.setDate(today.getDate() - 364)
    const result = buildHeatmapData([])
    expect(result[0].date).toBe(toDateKey(oldest))
  })

  it('marks today with count=1 for a session today', () => {
    const today = new Date()
    const result = buildHeatmapData([h('h1', today)])
    expect(result[364].count).toBe(1)
  })

  it('dayOfWeek is ISO (0=Monday, 6=Sunday)', () => {
    const result = buildHeatmapData([])
    result.forEach(d => {
      expect(d.dayOfWeek).toBeGreaterThanOrEqual(0)
      expect(d.dayOfWeek).toBeLessThanOrEqual(6)
    })
    const today = new Date()
    const expectedDow = (today.getDay() + 6) % 7
    expect(result[364].dayOfWeek).toBe(expectedDow)
  })

  it('excludes deleted histories', () => {
    const today = new Date()
    const result = buildHeatmapData([h('h1', today, 's1', { deletedAt: new Date() })])
    expect(result[364].count).toBe(0)
  })
})

// ─── buildWeeklyActivity ──────────────────────────────────────────────────────

describe('buildWeeklyActivity', () => {
  it('returns exactly 7 entries (Mon–Sun)', () => {
    const result = buildWeeklyActivity([], [], [], undefined, 'Session')
    expect(result).toHaveLength(7)
  })

  it('entries have correct dayLabel in order (Mon→Sun default)', () => {
    const result = buildWeeklyActivity([], [], [], undefined, 'Session')
    const labels = result.map(d => d.dayLabel)
    expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })

  it('each entry has dateKey as YYYY-MM-DD', () => {
    const result = buildWeeklyActivity([], [], [], undefined, 'Session')
    result.forEach(d => {
      expect(d.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('today entry has isToday=true', () => {
    const result = buildWeeklyActivity([], [], [], undefined, 'Session')
    const todayEntries = result.filter(d => d.isToday)
    expect(todayEntries).toHaveLength(1)
  })

  it('sessions array is empty when no histories match day', () => {
    const result = buildWeeklyActivity([], [], [], undefined, 'Session')
    result.forEach(d => {
      expect(d.sessions).toEqual([])
    })
  })

  it('includes session data for a history on a day this week', () => {
    // Find a day that is in the current week
    const today = new Date()
    const todayKey = toDateKey(today)

    const session = sess('sess1', 'Full Body')
    const history = h('h1', today, 'sess1')
    const set = s('s1', 'h1', 'e1', 100, 10)

    const result = buildWeeklyActivity([history], [set], [session], undefined, 'Session')
    const todayEntry = result.find(d => d.dateKey === todayKey)
    expect(todayEntry?.sessions).toHaveLength(1)
    expect(todayEntry?.sessions[0].sessionName).toBe('Full Body')
    expect(todayEntry?.sessions[0].setCount).toBe(1)
    expect(todayEntry?.sessions[0].volumeKg).toBe(1000)
  })

  it('calculates durationMin when endTime is set', () => {
    const today = new Date()
    const endTime = new Date(today.getTime() + 60 * 60000) // +60 min
    const session = sess('sess1', 'Full Body')
    const history = h('h1', today, 'sess1', { endTime })
    const result = buildWeeklyActivity([history], [], [session], undefined, 'Session')
    const todayEntry = result.find(d => d.isToday)
    expect(todayEntry?.sessions[0].durationMin).toBe(60)
  })

  it('sets durationMin to null when endTime is missing', () => {
    const today = new Date()
    const session = sess('sess1', 'Full Body')
    const history = h('h1', today, 'sess1') // no endTime
    const result = buildWeeklyActivity([history], [], [session], undefined, 'Session')
    const todayEntry = result.find(d => d.isToday)
    expect(todayEntry?.sessions[0].durationMin).toBeNull()
  })
})
