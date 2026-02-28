/**
 * Tests for statsDuration.ts — pure functions, no mocks needed.
 */
import {
  MIN_VALID_DURATION_MIN,
  computeDurationStats,
  formatDuration,
} from '../statsDuration'
import type History from '../../models/History'

// ─── Mock builder ─────────────────────────────────────────────────────────────

function h(
  id: string,
  startTime: Date,
  options: { endTime?: Date; deletedAt?: Date } = {}
): History {
  return {
    id,
    startTime,
    endTime: options.endTime ?? null,
    deletedAt: options.deletedAt ?? null,
  } as unknown as History
}

// ─── MIN_VALID_DURATION_MIN ───────────────────────────────────────────────────

describe('MIN_VALID_DURATION_MIN', () => {
  it('is a positive number', () => {
    expect(MIN_VALID_DURATION_MIN).toBeGreaterThan(0)
  })
})

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats 0 as "0 min"', () => {
    expect(formatDuration(0)).toBe('0 min')
  })

  it('formats values under 60 as "N min"', () => {
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(59)).toBe('59 min')
  })

  it('formats exactly 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('formats values with remainder as "Xh Ymin"', () => {
    expect(formatDuration(90)).toBe('1h 30min')
    expect(formatDuration(125)).toBe('2h 5min')
  })

  it('formats whole hours without minutes', () => {
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(180)).toBe('3h')
  })
})

// ─── computeDurationStats ─────────────────────────────────────────────────────

describe('computeDurationStats', () => {
  it('returns zeros for empty array', () => {
    expect(computeDurationStats([])).toEqual({
      avgMin: 0,
      totalHours: 0,
      minMin: 0,
      maxMin: 0,
      perSession: [],
      historyAll: [],
    })
  })

  it('excludes sessions without endTime', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    const result = computeDurationStats([h('h1', start)])
    expect(result.perSession).toHaveLength(0)
    expect(result.avgMin).toBe(0)
  })

  it('excludes deleted sessions', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    const end = new Date(2026, 0, 1, 11, 0, 0)   // 60 min > MIN
    const result = computeDurationStats([h('h1', start, { endTime: end, deletedAt: new Date() })])
    expect(result.perSession).toHaveLength(0)
    expect(result.avgMin).toBe(0)
  })

  it('excludes sessions shorter than MIN_VALID_DURATION_MIN', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    // Duration = MIN_VALID_DURATION_MIN - 1 minutes
    const end = new Date(start.getTime() + (MIN_VALID_DURATION_MIN - 1) * 60000)
    const result = computeDurationStats([h('h1', start, { endTime: end })])
    expect(result.perSession).toHaveLength(0)
  })

  it('includes sessions exactly at MIN_VALID_DURATION_MIN', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    const end = new Date(start.getTime() + MIN_VALID_DURATION_MIN * 60000)
    const result = computeDurationStats([h('h1', start, { endTime: end })])
    expect(result.perSession).toHaveLength(1)
  })

  it('calculates avgMin, minMin, maxMin and totalHours correctly', () => {
    const start1 = new Date(2026, 0, 1, 10, 0, 0)
    const end1 = new Date(2026, 0, 1, 11, 0, 0)   // 60 min
    const start2 = new Date(2026, 0, 2, 10, 0, 0)
    const end2 = new Date(2026, 0, 2, 11, 30, 0)   // 90 min
    const result = computeDurationStats([
      h('h1', start1, { endTime: end1 }),
      h('h2', start2, { endTime: end2 }),
    ])
    expect(result.avgMin).toBe(75)
    expect(result.minMin).toBe(60)
    expect(result.maxMin).toBe(90)
    expect(result.totalHours).toBe(2.5)
  })

  it('perSession contains at most the last 30 entries', () => {
    const entries: History[] = []
    for (let i = 0; i < 35; i++) {
      const start = new Date(2026, 0, i + 1, 10, 0, 0)
      const end = new Date(2026, 0, i + 1, 11, 0, 0) // 60 min
      entries.push(h(`h${i}`, start, { endTime: end }))
    }
    const result = computeDurationStats(entries)
    expect(result.perSession).toHaveLength(30)
  })

  it('historyAll is sorted descending (most recent first)', () => {
    const start1 = new Date(2026, 0, 1, 10, 0, 0)
    const end1 = new Date(2026, 0, 1, 11, 0, 0)
    const start2 = new Date(2026, 0, 5, 10, 0, 0)
    const end2 = new Date(2026, 0, 5, 11, 0, 0)
    const result = computeDurationStats([
      h('h1', start1, { endTime: end1 }),
      h('h2', start2, { endTime: end2 }),
    ])
    expect(result.historyAll[0].date).toBeGreaterThan(result.historyAll[1].date)
  })

  it('perSession is sorted ascending (oldest first)', () => {
    const start1 = new Date(2026, 0, 1, 10, 0, 0)
    const end1 = new Date(2026, 0, 1, 11, 0, 0)
    const start2 = new Date(2026, 0, 5, 10, 0, 0)
    const end2 = new Date(2026, 0, 5, 11, 0, 0)
    const result = computeDurationStats([
      h('h2', start2, { endTime: end2 }),
      h('h1', start1, { endTime: end1 }),
    ])
    expect(result.perSession[0].date).toBeLessThan(result.perSession[1].date)
  })
})
