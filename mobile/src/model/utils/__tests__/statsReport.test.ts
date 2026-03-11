/**
 * Tests for statsReport.ts — period helpers and report summary computation.
 */
import {
  getWeekPeriod,
  getMonthPeriod,
  computeReportSummary,
} from '../statsReport'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Exercise from '../../models/Exercise'

// ─── Mock builders ────────────────────────────────────────────────────────────

function mockHistory(
  id: string,
  startTime: Date,
  options: { deletedAt?: Date; endTime?: Date; isAbandoned?: boolean } = {},
): History {
  return {
    id,
    startTime,
    endTime: options.endTime ?? null,
    deletedAt: options.deletedAt ?? null,
    isAbandoned: options.isAbandoned ?? false,
    session: { id: `session-${id}` },
  } as unknown as History
}

function mockSet(
  id: string,
  historyId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  options: { isPr?: boolean; createdAt?: Date } = {},
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

function mockExercise(
  id: string,
  name: string,
  muscles: string[] = [],
): Exercise {
  return {
    id,
    name,
    muscles,
  } as unknown as Exercise
}

// ─── getWeekPeriod ────────────────────────────────────────────────────────────

describe('getWeekPeriod', () => {
  it('returns a weekly period with correct type', () => {
    const period = getWeekPeriod(0)
    expect(period.type).toBe('weekly')
  })

  it('returns Monday-Sunday of the current week', () => {
    const period = getWeekPeriod(0)
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)

    // Start should be a Monday (day 1)
    expect(start.getDay()).toBe(1)
    // End should be a Sunday (day 0)
    expect(end.getDay()).toBe(0)
    // End should be within the same week (6 days + 23h59m59s later)
    const diffMs = period.endDate - period.startDate
    const sixDaysMs = 6 * 24 * 60 * 60 * 1000
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    expect(diffMs).toBeGreaterThanOrEqual(sixDaysMs)
    expect(diffMs).toBeLessThan(sevenDaysMs)
  })

  it('returns start at 00:00:00.000', () => {
    const period = getWeekPeriod(0)
    const start = new Date(period.startDate)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('generates a label with Sem. X format', () => {
    const period = getWeekPeriod(0)
    expect(period.label).toMatch(/^Sem\. \d+ — .+ \d{4}$/)
  })

  it('offset -1 returns previous week', () => {
    const current = getWeekPeriod(0)
    const previous = getWeekPeriod(-1)
    expect(previous.endDate).toBeLessThan(current.startDate)
  })
})

// ─── getMonthPeriod ───────────────────────────────────────────────────────────

describe('getMonthPeriod', () => {
  it('returns a monthly period with correct type', () => {
    const period = getMonthPeriod(0)
    expect(period.type).toBe('monthly')
  })

  it('returns first-to-last day of current month', () => {
    const period = getMonthPeriod(0)
    const start = new Date(period.startDate)
    const end = new Date(period.endDate)

    // Start should be 1st of the month
    expect(start.getDate()).toBe(1)
    expect(start.getHours()).toBe(0)

    // End should be last day of the month
    const expectedLastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
    expect(end.getDate()).toBe(expectedLastDay)
  })

  it('generates a label with month name and year', () => {
    const period = getMonthPeriod(0)
    expect(period.label).toMatch(/^\w+ \d{4}$/)
  })

  it('offset -1 returns previous month', () => {
    const current = getMonthPeriod(0)
    const previous = getMonthPeriod(-1)
    expect(previous.endDate).toBeLessThan(current.startDate)
  })
})

// ─── computeReportSummary ─────────────────────────────────────────────────────

describe('computeReportSummary', () => {
  const period = getWeekPeriod(0)

  it('returns zeros for empty data', () => {
    const result = computeReportSummary([], [], [], period)

    expect(result.sessionsCount).toBe(0)
    expect(result.totalVolumeKg).toBe(0)
    expect(result.totalDurationMin).toBe(0)
    expect(result.avgDurationMin).toBe(0)
    expect(result.prsCount).toBe(0)
    expect(result.currentStreak).toBe(0)
    expect(result.comparedToPrevious).toBe(0)
    expect(result.topMuscles).toEqual([])
    expect(result.topExercises).toEqual([])
    expect(result.prs).toEqual([])
    expect(result.period).toBe(period)
  })

  it('counts sessions within the period', () => {
    const inPeriod = new Date(period.startDate + 1000)
    const outOfPeriod = new Date(period.startDate - 86_400_000)

    const histories = [
      mockHistory('h1', inPeriod, { endTime: new Date(inPeriod.getTime() + 3_600_000) }),
      mockHistory('h2', outOfPeriod),
    ]

    const result = computeReportSummary(histories, [], [], period)
    expect(result.sessionsCount).toBe(1)
  })

  it('calculates volume from sets in period', () => {
    const inPeriod = new Date(period.startDate + 1000)
    const histories = [mockHistory('h1', inPeriod)]
    const exercises = [mockExercise('e1', 'Bench Press', ['Pecs'])]
    const sets = [
      mockSet('s1', 'h1', 'e1', 100, 10),  // 1000
      mockSet('s2', 'h1', 'e1', 50, 5),     // 250
    ]

    const result = computeReportSummary(histories, sets, exercises, period)
    expect(result.totalVolumeKg).toBe(1250)
  })

  it('excludes deleted and abandoned histories', () => {
    const inPeriod = new Date(period.startDate + 1000)
    const histories = [
      mockHistory('h1', inPeriod, { deletedAt: new Date() }),
      mockHistory('h2', inPeriod, { isAbandoned: true }),
    ]
    const sets = [
      mockSet('s1', 'h1', 'e1', 100, 10),
      mockSet('s2', 'h2', 'e1', 100, 10),
    ]
    const exercises = [mockExercise('e1', 'Bench')]

    const result = computeReportSummary(histories, sets, exercises, period)
    expect(result.sessionsCount).toBe(0)
    expect(result.totalVolumeKg).toBe(0)
  })

  it('counts PRs in the period', () => {
    const inPeriod = new Date(period.startDate + 1000)
    const histories = [mockHistory('h1', inPeriod)]
    const exercises = [mockExercise('e1', 'Squat')]
    const sets = [
      mockSet('s1', 'h1', 'e1', 150, 5, { isPr: true, createdAt: inPeriod }),
      mockSet('s2', 'h1', 'e1', 100, 10, { isPr: false }),
    ]

    const result = computeReportSummary(histories, sets, exercises, period)
    expect(result.prsCount).toBe(1)
    expect(result.prs).toHaveLength(1)
    expect(result.prs[0].exerciseName).toBe('Squat')
  })

  it('computes top muscles limited to 3', () => {
    const inPeriod = new Date(period.startDate + 1000)
    const histories = [mockHistory('h1', inPeriod)]
    const exercises = [
      mockExercise('e1', 'Bench', ['Pecs', 'Triceps', 'Epaules']),
      mockExercise('e2', 'Curl', ['Biceps']),
    ]
    const sets = [
      mockSet('s1', 'h1', 'e1', 100, 10),
      mockSet('s2', 'h1', 'e2', 20, 10),
    ]

    const result = computeReportSummary(histories, sets, exercises, period)
    expect(result.topMuscles.length).toBeLessThanOrEqual(3)
  })

  it('computes duration stats', () => {
    const start = new Date(period.startDate + 1000)
    const end = new Date(start.getTime() + 60 * 60_000) // 60 minutes
    const histories = [mockHistory('h1', start, { endTime: end })]

    const result = computeReportSummary(histories, [], [], period)
    expect(result.totalDurationMin).toBe(60)
    expect(result.avgDurationMin).toBe(60)
  })
})
