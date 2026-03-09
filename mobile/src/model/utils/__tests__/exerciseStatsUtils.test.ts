/**
 * Tests for exerciseStatsUtils.ts
 * Pure function `buildExerciseStatsFromData` is tested without DB mocks.
 * Async DB functions use the mock.
 */
import {
  buildExerciseStatsFromData,
  getExerciseStatsFromSets,
  getLastPerformanceForExercise,
  getLastSetsForExercises,
} from '../exerciseStatsUtils'
import { database } from '../../index'
import type History from '../../models/History'
import type WorkoutSet from '../../models/Set'
import type Session from '../../models/Session'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
  },
}))

const mockGet = database.get as jest.Mock

function h(id: string, startTime: Date, sessionId: string, options: { deletedAt?: Date } = {}): History {
  return {
    id,
    startTime,
    deletedAt: options.deletedAt ?? null,
    session: { id: sessionId },
  } as unknown as History
}

function s(id: string, historyId: string, exerciseId: string, weight: number, reps: number, setOrder: number = 1): WorkoutSet {
  return {
    id,
    history: { id: historyId },
    exercise: { id: exerciseId },
    weight,
    reps,
    setOrder,
  } as unknown as WorkoutSet
}

function sess(id: string, name: string): Session {
  return { id, name } as unknown as Session
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── buildExerciseStatsFromData ───────────────────────────────────────────────

describe('buildExerciseStatsFromData', () => {
  it('returns empty array for empty sets', () => {
    expect(buildExerciseStatsFromData([], [], [])).toEqual([])
  })

  it('groups sets by history and computes maxWeight', () => {
    const history = h('h1', new Date(2026, 0, 1), 'sess1')
    const session = sess('sess1', 'Full Body')
    const sets = [
      s('s1', 'h1', 'e1', 100, 10, 1),
      s('s2', 'h1', 'e1', 120, 8, 2),
    ]
    const result = buildExerciseStatsFromData(sets, [history], [session])
    expect(result).toHaveLength(1)
    expect(result[0].historyId).toBe('h1')
    expect(result[0].maxWeight).toBe(120)
    expect(result[0].sessionName).toBe('Full Body')
  })

  it('sorts sets within each session by setOrder ASC', () => {
    const history = h('h1', new Date(2026, 0, 1), 'sess1')
    const sets = [
      s('s2', 'h1', 'e1', 100, 5, 2),
      s('s1', 'h1', 'e1', 80, 8, 1),
    ]
    const result = buildExerciseStatsFromData(sets, [history], [])
    expect(result[0].sets[0].setOrder).toBe(1)
    expect(result[0].sets[1].setOrder).toBe(2)
  })

  it('sorts result by startTime ASC (oldest first)', () => {
    const h1 = h('h1', new Date(2026, 0, 1), 'sess1')
    const h2 = h('h2', new Date(2026, 0, 5), 'sess1')
    const sets = [s('s1', 'h2', 'e1', 100, 10), s('s2', 'h1', 'e1', 90, 10)]
    const result = buildExerciseStatsFromData(sets, [h1, h2], [])
    expect(result[0].historyId).toBe('h1')
    expect(result[1].historyId).toBe('h2')
  })

  it('skips histories with no matching sets', () => {
    const h1 = h('h1', new Date(2026, 0, 1), 'sess1')
    const h2 = h('h2', new Date(2026, 0, 2), 'sess1')
    const sets = [s('s1', 'h1', 'e1', 100, 10)] // only h1 has sets
    const result = buildExerciseStatsFromData(sets, [h1, h2], [])
    expect(result).toHaveLength(1)
    expect(result[0].historyId).toBe('h1')
  })

  it('uses empty string for sessionName when session not found', () => {
    const history = h('h1', new Date(2026, 0, 1), 'unknown-session')
    const sets = [s('s1', 'h1', 'e1', 100, 10)]
    const result = buildExerciseStatsFromData(sets, [history], [])
    expect(result[0].sessionName).toBe('')
  })
})

// ─── getExerciseStatsFromSets ─────────────────────────────────────────────────

describe('getExerciseStatsFromSets', () => {
  it('returns empty array when no sets found', async () => {
    const mockFetch = jest.fn().mockResolvedValue([])
    const mockQuery = jest.fn().mockReturnValue({ fetch: mockFetch })
    mockGet.mockReturnValue({ query: mockQuery })

    const result = await getExerciseStatsFromSets('e1')
    expect(result).toEqual([])
  })

  it('returns empty array when all histories are deleted (filtered out)', async () => {
    const set = s('s1', 'h1', 'e1', 100, 10)
    const mockFetchSets = jest.fn().mockResolvedValue([set])
    const mockFetchHistories = jest.fn().mockResolvedValue([]) // all filtered
    const mockQuery = jest.fn().mockReturnValue({ fetch: mockFetchSets })
    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') return { query: mockQuery }
      if (collection === 'histories') return { query: jest.fn().mockReturnValue({ fetch: mockFetchHistories }) }
      return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
    })

    const result = await getExerciseStatsFromSets('e1')
    expect(result).toEqual([])
  })
})

// ─── getLastPerformanceForExercise ────────────────────────────────────────────

describe('getLastPerformanceForExercise', () => {
  it('returns null when no sets found', async () => {
    const mockFetch = jest.fn().mockResolvedValue([])
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: mockFetch }) })

    const result = await getLastPerformanceForExercise('e1', 'h-current')
    expect(result).toBeNull()
  })

  it('returns null when no matching histories found', async () => {
    const set = s('s1', 'h1', 'e1', 100, 10)
    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([set]) }) }
      }
      // histories: none found
      return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
    })

    const result = await getLastPerformanceForExercise('e1', 'h-current')
    expect(result).toBeNull()
  })

  it('returns performance data for the most recent history', async () => {
    const setData = s('s1', 'h1', 'e1', 100, 10)
    const historyData = h('h1', new Date(2026, 0, 5), 'sess1')

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([setData]) }) }
      }
      return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([historyData]) }) }
    })

    const result = await getLastPerformanceForExercise('e1', 'h-other')
    expect(result).not.toBeNull()
    expect(result?.maxWeight).toBe(100)
    expect(result?.setsCount).toBe(1)
    expect(result?.avgReps).toBe(10)
  })
})

// ─── getLastSetsForExercises ──────────────────────────────────────────────────

describe('getLastSetsForExercises', () => {
  it('returns empty object for empty exerciseIds', async () => {
    const result = await getLastSetsForExercises([])
    expect(result).toEqual({})
  })

  it('returns empty object when no sets found', async () => {
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) })
    const result = await getLastSetsForExercises(['e1'])
    expect(result).toEqual({})
  })

  it('returns empty object when no histories found', async () => {
    const set = s('s1', 'h1', 'e1', 100, 10)
    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([set]) }) }
      return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
    })
    const result = await getLastSetsForExercises(['e1'])
    expect(result).toEqual({})
  })
})
