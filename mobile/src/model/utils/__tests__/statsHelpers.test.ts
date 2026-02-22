/**
 * Tests for statsHelpers.ts
 * All functions are pure (no DB access) — no mocks needed.
 */
import {
  computeGlobalKPIs,
  computeCurrentStreak,
  computeRecordStreak,
  computeMotivationalPhrase,
  computeDurationStats,
  computeVolumeStats,
  computeCalendarData,
  computeMuscleRepartition,
  computePRsByExercise,
  computeTopExercisesByFrequency,
  formatDuration,
  formatVolume,
  toDateKey,
  labelToPeriod,
  PERIOD_LABELS,
} from '../statsHelpers'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Exercise from '../../models/Exercise'

// ─── Mock builders ────────────────────────────────────────────────────────────

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

function s(
  id: string,
  historyId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  options: { isPr?: boolean; createdAt?: Date } = {}
): WorkoutSet {
  return {
    id,
    history: { id: historyId },
    exercise: { id: exerciseId },
    weight,
    reps,
    isPr: options.isPr ?? false,
    createdAt: options.createdAt ?? new Date(),
  } as unknown as WorkoutSet
}

function ex(id: string, name: string, muscles: string[] = []): Exercise {
  return { id, name, muscles } as unknown as Exercise
}

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(0)).toBe('0 min')
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(59)).toBe('59 min')
  })

  it('formats exactly 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('formats hours and remaining minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min')
    expect(formatDuration(125)).toBe('2h 5min')
  })

  it('formats whole hours without minutes', () => {
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(180)).toBe('3h')
  })
})

// ─── formatVolume ─────────────────────────────────────────────────────────────

describe('formatVolume', () => {
  it('includes "kg" suffix', () => {
    expect(formatVolume(500)).toContain('kg')
  })

  it('rounds to integer', () => {
    const result = formatVolume(500.7)
    expect(result).not.toContain('.')
    expect(result).toContain('501')
  })

  it('uses fr-FR locale formatting', () => {
    expect(formatVolume(500)).toBe(`${Math.round(500).toLocaleString('fr-FR')} kg`)
    expect(formatVolume(1500.4)).toBe(`${Math.round(1500.4).toLocaleString('fr-FR')} kg`)
  })
})

// ─── toDateKey ────────────────────────────────────────────────────────────────

describe('toDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2026, 1, 22) // Feb 22, 2026
    expect(toDateKey(date)).toBe('2026-02-22')
  })

  it('pads month and day with leading zeros', () => {
    const date = new Date(2026, 0, 5) // Jan 5, 2026
    expect(toDateKey(date)).toBe('2026-01-05')
  })

  it('handles December (month 12)', () => {
    const date = new Date(2026, 11, 31) // Dec 31, 2026
    expect(toDateKey(date)).toBe('2026-12-31')
  })
})

// ─── labelToPeriod / PERIOD_LABELS ───────────────────────────────────────────

describe('labelToPeriod', () => {
  it('returns "1m" for "1 mois"', () => {
    expect(labelToPeriod('1 mois')).toBe('1m')
  })

  it('returns "1m" for null (default)', () => {
    expect(labelToPeriod(null)).toBe('1m')
  })

  it('returns "3m" for "3 mois"', () => {
    expect(labelToPeriod('3 mois')).toBe('3m')
  })

  it('returns "all" for "Tout"', () => {
    expect(labelToPeriod('Tout')).toBe('all')
  })
})

describe('PERIOD_LABELS', () => {
  it('contains the three expected labels', () => {
    expect(PERIOD_LABELS).toContain('1 mois')
    expect(PERIOD_LABELS).toContain('3 mois')
    expect(PERIOD_LABELS).toContain('Tout')
  })
})

// ─── computeGlobalKPIs ────────────────────────────────────────────────────────

describe('computeGlobalKPIs', () => {
  it('returns zeros for empty arrays', () => {
    expect(computeGlobalKPIs([], [])).toEqual({
      totalSessions: 0,
      totalVolumeKg: 0,
      totalPRs: 0,
    })
  })

  it('counts only active (non-deleted) sessions', () => {
    const histories = [
      h('h1', new Date()),
      h('h2', new Date(), { deletedAt: new Date() }),
    ]
    expect(computeGlobalKPIs(histories, []).totalSessions).toBe(1)
  })

  it('calculates total volume from weight × reps', () => {
    const histories = [h('h1', new Date())]
    const sets = [
      s('s1', 'h1', 'e1', 100, 10), // 1000 kg
      s('s2', 'h1', 'e1', 50, 5),   // 250 kg
    ]
    expect(computeGlobalKPIs(histories, sets).totalVolumeKg).toBe(1250)
  })

  it('excludes sets from deleted histories', () => {
    const histories = [h('h1', new Date(), { deletedAt: new Date() })]
    const sets = [s('s1', 'h1', 'e1', 100, 10)]
    expect(computeGlobalKPIs(histories, sets).totalVolumeKg).toBe(0)
  })

  it('counts PR sets correctly', () => {
    const histories = [h('h1', new Date())]
    const sets = [
      s('s1', 'h1', 'e1', 100, 1, { isPr: true }),
      s('s2', 'h1', 'e1', 50, 5, { isPr: false }),
    ]
    expect(computeGlobalKPIs(histories, sets).totalPRs).toBe(1)
  })
})

// ─── computeCurrentStreak ─────────────────────────────────────────────────────

describe('computeCurrentStreak', () => {
  it('returns 0 for empty histories', () => {
    expect(computeCurrentStreak([])).toBe(0)
  })

  it('returns 0 for only deleted histories', () => {
    const histories = [h('h1', new Date(), { deletedAt: new Date() })]
    expect(computeCurrentStreak(histories)).toBe(0)
  })

  it('returns 1 for a session today', () => {
    const today = new Date()
    expect(computeCurrentStreak([h('h1', today)])).toBe(1)
  })

  it('returns 1 for a session yesterday (no session today)', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(computeCurrentStreak([h('h1', yesterday)])).toBe(1)
  })

  it('returns correct streak for consecutive days', () => {
    const today = new Date()
    const d = (offset: number) => {
      const date = new Date(today)
      date.setDate(today.getDate() - offset)
      return date
    }
    const histories = [h('h1', d(0)), h('h2', d(1)), h('h3', d(2))]
    expect(computeCurrentStreak(histories)).toBe(3)
  })

  it('returns 0 if the most recent session was 2+ days ago', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    expect(computeCurrentStreak([h('h1', twoDaysAgo)])).toBe(0)
  })
})

// ─── computeRecordStreak ──────────────────────────────────────────────────────

describe('computeRecordStreak', () => {
  it('returns 0 for empty histories', () => {
    expect(computeRecordStreak([])).toBe(0)
  })

  it('returns 1 for a single session', () => {
    expect(computeRecordStreak([h('h1', new Date(2026, 0, 1))])).toBe(1)
  })

  it('returns 1 for non-consecutive sessions', () => {
    const histories = [
      h('h1', new Date(2026, 0, 1)),
      h('h2', new Date(2026, 0, 3)),
      h('h3', new Date(2026, 0, 5)),
    ]
    expect(computeRecordStreak(histories)).toBe(1)
  })

  it('returns the longest consecutive streak', () => {
    const histories = [
      h('h1', new Date(2026, 0, 1)),
      h('h2', new Date(2026, 0, 2)),
      h('h3', new Date(2026, 0, 3)),
      h('h4', new Date(2026, 0, 5)), // gap
      h('h5', new Date(2026, 0, 6)),
    ]
    expect(computeRecordStreak(histories)).toBe(3)
  })
})

// ─── computeDurationStats ─────────────────────────────────────────────────────

describe('computeDurationStats', () => {
  it('returns zeros for empty histories', () => {
    expect(computeDurationStats([])).toEqual({
      avgMin: 0,
      totalHours: 0,
      minMin: 0,
      maxMin: 0,
      perSession: [],
    })
  })

  it('excludes sessions without endTime', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    expect(computeDurationStats([h('h1', start)]).perSession).toHaveLength(0)
  })

  it('excludes deleted sessions', () => {
    const start = new Date(2026, 0, 1, 10, 0, 0)
    const end = new Date(2026, 0, 1, 11, 0, 0)
    const histories = [h('h1', start, { endTime: end, deletedAt: new Date() })]
    expect(computeDurationStats(histories).perSession).toHaveLength(0)
  })

  it('calculates avg, min, max and totalHours correctly', () => {
    const start1 = new Date(2026, 0, 1, 10, 0, 0)
    const end1 = new Date(2026, 0, 1, 11, 0, 0)   // 60 min
    const start2 = new Date(2026, 0, 2, 10, 0, 0)
    const end2 = new Date(2026, 0, 2, 11, 30, 0)   // 90 min
    const histories = [
      h('h1', start1, { endTime: end1 }),
      h('h2', start2, { endTime: end2 }),
    ]
    const result = computeDurationStats(histories)
    expect(result.avgMin).toBe(75)       // (60+90)/2
    expect(result.minMin).toBe(60)
    expect(result.maxMin).toBe(90)
    expect(result.totalHours).toBe(2.5)  // 150 min / 60
    expect(result.perSession).toHaveLength(2)
  })
})

// ─── computeCalendarData ──────────────────────────────────────────────────────

describe('computeCalendarData', () => {
  it('returns empty map for empty histories', () => {
    expect(computeCalendarData([])).toEqual(new Map())
  })

  it('maps date keys to session counts', () => {
    const date = new Date(2026, 1, 22) // Feb 22
    const result = computeCalendarData([h('h1', date)])
    expect(result.get('2026-02-22')).toBe(1)
  })

  it('counts multiple sessions on the same day', () => {
    const date = new Date(2026, 1, 22)
    const result = computeCalendarData([h('h1', date), h('h2', date)])
    expect(result.get('2026-02-22')).toBe(2)
  })

  it('excludes deleted histories', () => {
    const date = new Date(2026, 1, 22)
    const result = computeCalendarData([h('h1', date, { deletedAt: new Date() })])
    expect(result.get('2026-02-22')).toBeUndefined()
  })
})

// ─── computeVolumeStats ───────────────────────────────────────────────────────

describe('computeVolumeStats', () => {
  it('returns zero total and 12 weeks for empty data', () => {
    const result = computeVolumeStats([], [], [], '1m')
    expect(result.total).toBe(0)
    expect(result.perWeek).toHaveLength(12)
    expect(result.topExercises).toHaveLength(0)
  })

  it('calculates total volume for "all" period', () => {
    const history = h('h1', new Date(2026, 0, 15))
    const sets = [
      s('s1', 'h1', 'ex1', 100, 10), // 1000
      s('s2', 'h1', 'ex1', 50, 5),   // 250
    ]
    const result = computeVolumeStats(sets, [ex('ex1', 'Squat')], [history], 'all')
    expect(result.total).toBe(1250)
  })

  it('returns top exercises sorted by volume (descending)', () => {
    const history = h('h1', new Date(2026, 0, 15))
    const sets = [
      s('s1', 'h1', 'ex1', 100, 10), // 1000 for ex1
      s('s2', 'h1', 'ex2', 200, 10), // 2000 for ex2
    ]
    const result = computeVolumeStats(
      sets,
      [ex('ex1', 'Squat'), ex('ex2', 'Bench')],
      [history],
      'all'
    )
    expect(result.topExercises[0].exerciseId).toBe('ex2')
    expect(result.topExercises[1].exerciseId).toBe('ex1')
  })

  it('excludes sets from deleted histories', () => {
    const history = h('h1', new Date(2026, 0, 15), { deletedAt: new Date() })
    const sets = [s('s1', 'h1', 'ex1', 100, 10)]
    expect(computeVolumeStats(sets, [], [history], 'all').total).toBe(0)
  })

  it('computes comparedToPrevious correctly', () => {
    const now = Date.now()
    const recentDate = new Date(now - 10 * 24 * 60 * 60 * 1000) // 10 days ago (in 1m window)
    const oldDate = new Date(now - 40 * 24 * 60 * 60 * 1000)    // 40 days ago (prev window)
    const h1 = h('h1', recentDate)
    const h2 = h('h2', oldDate)
    const sets = [
      s('s1', 'h1', 'ex1', 200, 10), // 2000 this period
      s('s2', 'h2', 'ex1', 100, 10), // 1000 prev period
    ]
    const result = computeVolumeStats(sets, [ex('ex1', 'Squat')], [h1, h2], '1m')
    expect(result.comparedToPrevious).toBe(100) // +100%
  })
})

// ─── computeMuscleRepartition ─────────────────────────────────────────────────

describe('computeMuscleRepartition', () => {
  it('returns empty array for no sets', () => {
    expect(computeMuscleRepartition([], [], [], '1m')).toEqual([])
  })

  it('calculates percentage for each muscle', () => {
    const chest = ex('ex1', 'Bench', ['Pectoraux'])
    const legs = ex('ex2', 'Squat', ['Quadriceps'])
    const history = h('h1', new Date())
    const sets = [
      s('s1', 'h1', 'ex1', 100, 10), // 1000 kg pec
      s('s2', 'h1', 'ex2', 100, 10), // 1000 kg quad
    ]
    const result = computeMuscleRepartition(sets, [chest, legs], [history], 'all')
    expect(result).toHaveLength(2)
    const totalPct = result.reduce((sum, r) => sum + r.pct, 0)
    // Sum of percentages should be ~100 (rounding may give ±2)
    expect(totalPct).toBeGreaterThanOrEqual(98)
    expect(totalPct).toBeLessThanOrEqual(102)
    expect(result[0].pct).toBe(50)
    expect(result[1].pct).toBe(50)
  })

  it('excludes deleted histories', () => {
    const chest = ex('ex1', 'Bench', ['Pectoraux'])
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const sets = [s('s1', 'h1', 'ex1', 100, 10)]
    expect(computeMuscleRepartition(sets, [chest], [history], 'all')).toEqual([])
  })
})

// ─── computePRsByExercise ─────────────────────────────────────────────────────

describe('computePRsByExercise', () => {
  it('returns empty for no PR sets', () => {
    const history = h('h1', new Date())
    const sets = [s('s1', 'h1', 'ex1', 100, 10)]
    expect(computePRsByExercise(sets, [], [history])).toEqual([])
  })

  it('returns one entry per exercise (best weight)', () => {
    const squat = ex('ex1', 'Squat')
    const history = h('h1', new Date())
    const sets = [
      s('s1', 'h1', 'ex1', 100, 5, { isPr: true }),
      s('s2', 'h1', 'ex1', 110, 3, { isPr: true }),
    ]
    const result = computePRsByExercise(sets, [squat], [history])
    expect(result).toHaveLength(1)
    expect(result[0].weight).toBe(110)
    expect(result[0].exerciseName).toBe('Squat')
  })

  it('calculates 1RM using Epley formula', () => {
    const squat = ex('ex1', 'Squat')
    const history = h('h1', new Date())
    const sets = [s('s1', 'h1', 'ex1', 100, 10, { isPr: true })]
    const result = computePRsByExercise(sets, [squat], [history])
    // orm1 = Math.round(100 * (1 + 10/30)) = Math.round(133.33) = 133
    expect(result[0].orm1).toBe(133)
  })

  it('excludes sets from deleted histories', () => {
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const sets = [s('s1', 'h1', 'ex1', 100, 5, { isPr: true })]
    expect(computePRsByExercise(sets, [ex('ex1', 'Squat')], [history])).toEqual([])
  })
})

// ─── computeTopExercisesByFrequency ───────────────────────────────────────────

describe('computeTopExercisesByFrequency', () => {
  it('returns empty for no sets', () => {
    expect(computeTopExercisesByFrequency([], [], [])).toEqual([])
  })

  it('counts unique sessions per exercise', () => {
    const squat = ex('ex1', 'Squat')
    const h1 = h('h1', new Date(2026, 0, 1))
    const h2 = h('h2', new Date(2026, 0, 2))
    const sets = [
      s('s1', 'h1', 'ex1', 100, 10), // session 1
      s('s2', 'h1', 'ex1', 100, 10), // same session — not counted twice
      s('s3', 'h2', 'ex1', 100, 10), // session 2
    ]
    const result = computeTopExercisesByFrequency(sets, [squat], [h1, h2])
    expect(result[0].count).toBe(2)
    expect(result[0].exerciseName).toBe('Squat')
  })

  it('respects the limit parameter', () => {
    const exercises = [ex('e1', 'A'), ex('e2', 'B'), ex('e3', 'C')]
    const hist = h('h1', new Date())
    const sets = [
      s('s1', 'h1', 'e1', 100, 10),
      s('s2', 'h1', 'e2', 100, 10),
      s('s3', 'h1', 'e3', 100, 10),
    ]
    expect(computeTopExercisesByFrequency(sets, exercises, [hist], 2)).toHaveLength(2)
  })

  it('defaults to limit 5', () => {
    const exercises = Array.from({ length: 7 }, (_, i) => ex(`e${i}`, `Ex${i}`))
    const hist = h('h1', new Date())
    const sets = exercises.map((e, i) => s(`s${i}`, 'h1', e.id, 100, 10))
    const result = computeTopExercisesByFrequency(sets, exercises, [hist])
    expect(result).toHaveLength(5)
  })
})

// ─── computeMotivationalPhrase ────────────────────────────────────────────────

describe('computeMotivationalPhrase', () => {
  it('returns a non-empty string', () => {
    expect(computeMotivationalPhrase([], [])).toBeTruthy()
  })

  it('returns default volume phrase for no data', () => {
    const result = computeMotivationalPhrase([], [])
    expect(result).toContain('Ce mois')
  })

  it('returns streak phrase when streak >= 3', () => {
    const today = new Date()
    const d = (offset: number) => {
      const date = new Date(today)
      date.setDate(today.getDate() - offset)
      return date
    }
    const histories = [h('h1', d(0)), h('h2', d(1)), h('h3', d(2))]
    const result = computeMotivationalPhrase(histories, [])
    expect(result).toContain('3 jours consécutifs')
  })

  it('returns PR phrase when PR happened this week', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const history = h('h1', yesterday)
    const recentSet = s('s1', 'h1', 'ex1', 100, 5, {
      isPr: true,
      createdAt: yesterday,
    })
    const result = computeMotivationalPhrase([history], [recentSet])
    // Either streak phrase (if yesterday gives streak=1 < 3) or PR phrase
    expect(result).toContain('record')
  })
})
