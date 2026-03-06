/**
 * Tests for statsMuscle.ts — pure functions, no mocks needed.
 */
import {
  getMondayOfCurrentWeek,
  computeMuscleRepartition,
  computeSetsPerMuscleWeek,
  computeWeeklySetsChart,
  computeMonthlySetsChart,
} from '../statsMuscle'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Exercise from '../../models/Exercise'

// ─── Mock builders ────────────────────────────────────────────────────────────

function h(
  id: string,
  startTime: Date,
  options: { deletedAt?: Date } = {}
): History {
  return {
    id,
    startTime,
    deletedAt: options.deletedAt ?? null,
  } as unknown as History
}

function s(id: string, historyId: string, exerciseId: string): WorkoutSet {
  return {
    id,
    history: { id: historyId },
    exercise: { id: exerciseId },
    weight: 100,
    reps: 10,
  } as unknown as WorkoutSet
}

function ex(id: string, name: string, muscles: string[]): Exercise {
  return { id, name, muscles } as unknown as Exercise
}

// ─── getMondayOfCurrentWeek ───────────────────────────────────────────────────

describe('getMondayOfCurrentWeek', () => {
  it('returns a timestamp in the past or today', () => {
    expect(getMondayOfCurrentWeek()).toBeLessThanOrEqual(Date.now())
  })

  it('corresponds to a Monday (day-of-week = 1 in JS)', () => {
    const mondayTs = getMondayOfCurrentWeek()
    const monday = new Date(mondayTs)
    expect(monday.getDay()).toBe(1) // 1 = Monday in JS
  })

  it('is set to midnight (hours/minutes/seconds = 0)', () => {
    const monday = new Date(getMondayOfCurrentWeek())
    expect(monday.getHours()).toBe(0)
    expect(monday.getMinutes()).toBe(0)
    expect(monday.getSeconds()).toBe(0)
    expect(monday.getMilliseconds()).toBe(0)
  })
})

// ─── computeMuscleRepartition ─────────────────────────────────────────────────

describe('computeMuscleRepartition', () => {
  it('returns empty for no sets', () => {
    expect(computeMuscleRepartition([], [], [], 'all')).toEqual([])
  })

  it('returns empty for only deleted histories', () => {
    const exercise = ex('e1', 'Bench', ['Pecs'])
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const set = s('s1', 'h1', 'e1')
    expect(computeMuscleRepartition([set], [exercise], [history], 'all')).toEqual([])
  })

  it('calculates correct percentages for 2 equal muscles', () => {
    const e1 = ex('e1', 'Bench', ['Pecs'])
    const e2 = ex('e2', 'Squat', ['Quads'])
    const history = h('h1', new Date())
    const sets = [s('s1', 'h1', 'e1'), s('s2', 'h1', 'e2')]
    const result = computeMuscleRepartition(sets, [e1, e2], [history], 'all')
    expect(result).toHaveLength(2)
    expect(result[0].pct).toBe(50)
    expect(result[1].pct).toBe(50)
  })

  it('groups muscles beyond top 7 into "Autres"', () => {
    const muscles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const exercises = muscles.map((m, i) => ex(`e${i}`, `Ex${i}`, [m]))
    const history = h('h1', new Date())
    const sets = muscles.map((_, i) => s(`s${i}`, 'h1', `e${i}`))
    const result = computeMuscleRepartition(sets, exercises, [history], 'all')
    expect(result).toHaveLength(8) // 7 top + 1 Autres
    expect(result[result.length - 1].muscle).toBe('Autres')
  })

  it('skips empty muscle names', () => {
    const exercise = ex('e1', 'Test', ['Pecs', '', '  '])
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const result = computeMuscleRepartition([set], [exercise], [history], 'all')
    expect(result).toHaveLength(1)
    expect(result[0].muscle).toBe('Pecs')
  })
})

// ─── computeSetsPerMuscleWeek ─────────────────────────────────────────────────

describe('computeSetsPerMuscleWeek', () => {
  it('returns empty for no sets', () => {
    expect(computeSetsPerMuscleWeek([], [], [])).toEqual([])
  })

  it('returns empty for only deleted histories', () => {
    const exercise = ex('e1', 'Pull-up', ['Dos'])
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const set = s('s1', 'h1', 'e1')
    expect(computeSetsPerMuscleWeek([set], [exercise], [history])).toEqual([])
  })

  it('counts sets from current week by muscle', () => {
    const exercise = ex('e1', 'Curl', ['Biceps'])
    const history = h('h1', new Date()) // today = this week
    const sets = [s('s1', 'h1', 'e1'), s('s2', 'h1', 'e1')]
    const result = computeSetsPerMuscleWeek(sets, [exercise], [history])
    expect(result).toHaveLength(1)
    expect(result[0].muscle).toBe('Biceps')
    expect(result[0].sets).toBe(2)
  })

  it('ignores sessions from previous weeks', () => {
    const exercise = ex('e1', 'Curl', ['Biceps'])
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 8)
    const history = h('h1', lastWeek)
    const set = s('s1', 'h1', 'e1')
    expect(computeSetsPerMuscleWeek([set], [exercise], [history])).toEqual([])
  })

  it('returns at most 8 muscles', () => {
    const muscles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    const exercises = muscles.map((m, i) => ex(`e${i}`, `Ex${i}`, [m]))
    const history = h('h1', new Date())
    const sets = muscles.map((_, i) => s(`s${i}`, 'h1', `e${i}`))
    const result = computeSetsPerMuscleWeek(sets, exercises, [history])
    expect(result.length).toBeLessThanOrEqual(8)
  })

  it('sorts by set count descending', () => {
    const e1 = ex('e1', 'Ex1', ['Quads'])
    const e2 = ex('e2', 'Ex2', ['Biceps'])
    const history = h('h1', new Date())
    // e1: 3 sets, e2: 1 set
    const sets = [
      s('s1', 'h1', 'e1'), s('s2', 'h1', 'e1'), s('s3', 'h1', 'e1'),
      s('s4', 'h1', 'e2'),
    ]
    const result = computeSetsPerMuscleWeek(sets, [e1, e2], [history])
    expect(result[0].muscle).toBe('Quads')
    expect(result[0].sets).toBe(3)
  })
})

// ─── computeWeeklySetsChart ───────────────────────────────────────────────────

describe('computeWeeklySetsChart', () => {
  it('returns 4 labels and data=[0,0,0,0] for no data', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: 0, weeksToShow: 4 })
    expect(result.labels).toHaveLength(4)
    expect(result.data).toEqual([0, 0, 0, 0])
  })

  it('hasNext=false for weekOffset=0', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: 0 })
    expect(result.hasNext).toBe(false)
  })

  it('hasNext=true for weekOffset=-1', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: -1 })
    expect(result.hasNext).toBe(true)
  })

  it('hasPrev=true always', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: 0 })
    expect(result.hasPrev).toBe(true)
  })

  it('counts sets in current week at data[3] for offset=0', () => {
    const exercise = ex('e1', 'Squat', ['Quads'])
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const result = computeWeeklySetsChart([set], [exercise], [history], { muscleFilter: null, weekOffset: 0 })
    expect(result.data[3]).toBe(1)
  })

  it('filters by muscle — includes matching', () => {
    const exercise = ex('e1', 'Squat', ['Quads'])
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const result = computeWeeklySetsChart([set], [exercise], [history], { muscleFilter: 'Quads', weekOffset: 0 })
    expect(result.data[3]).toBe(1)
  })

  it('filters by muscle — excludes non-matching', () => {
    const exercise = ex('e1', 'Squat', ['Quads'])
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const result = computeWeeklySetsChart([set], [exercise], [history], { muscleFilter: 'Pecs', weekOffset: 0 })
    expect(result.data.every(v => v === 0)).toBe(true)
  })

  it('ignores deleted histories', () => {
    const exercise = ex('e1', 'Squat', ['Quads'])
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const set = s('s1', 'h1', 'e1')
    const result = computeWeeklySetsChart([set], [exercise], [history], { muscleFilter: null, weekOffset: 0 })
    expect(result.data.every(v => v === 0)).toBe(true)
  })

  it('uses default weeksToShow=4 when not specified', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: 0 })
    expect(result.labels).toHaveLength(4)
  })

  it('weekRangeLabel is a formatted date range string', () => {
    const result = computeWeeklySetsChart([], [], [], { muscleFilter: null, weekOffset: 0 })
    expect(result.weekRangeLabel).toMatch(/\d{2}\/\d{2} – \d{2}\/\d{2}/)
  })
})

// ─── computeMonthlySetsChart ──────────────────────────────────────────────────

describe('computeMonthlySetsChart', () => {
  it('returns empty for no active sets', () => {
    expect(computeMonthlySetsChart([], [], [], null)).toEqual({ labels: [], data: [] })
  })

  it('returns 1 entry for data in current month only', () => {
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const result = computeMonthlySetsChart([set], [], [history], null)
    expect(result.labels).toHaveLength(1)
    expect(result.data[0]).toBe(1)
  })

  it('caps at 12 months even with older data', () => {
    const now = new Date()
    const histories: ReturnType<typeof h>[] = []
    const sets: ReturnType<typeof s>[] = []
    for (let i = 0; i < 15; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15)
      const id = `h${i}`
      histories.push(h(id, date))
      sets.push(s(`s${i}`, id, 'e1'))
    }
    const result = computeMonthlySetsChart(sets, [], histories, null)
    expect(result.labels.length).toBeLessThanOrEqual(12)
  })

  it('filters by muscle when muscleFilter is set', () => {
    const exercise = ex('e1', 'Pull-up', ['Dos'])
    const history = h('h1', new Date())
    const set = s('s1', 'h1', 'e1')
    const resultDos = computeMonthlySetsChart([set], [exercise], [history], 'Dos')
    const resultPecs = computeMonthlySetsChart([set], [exercise], [history], 'Pecs')
    expect(resultDos.data[resultDos.data.length - 1]).toBe(1)
    expect(resultPecs.data[resultPecs.data.length - 1]).toBe(0)
  })

  it('ignores deleted histories', () => {
    const history = h('h1', new Date(), { deletedAt: new Date() })
    const set = s('s1', 'h1', 'e1')
    expect(computeMonthlySetsChart([set], [], [history], null)).toEqual({ labels: [], data: [] })
  })
})
