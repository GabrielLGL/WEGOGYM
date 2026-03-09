/**
 * Tests for exerciseQueryUtils.ts
 * getNextPosition requires DB mock; filter/search functions are pure.
 */
import { filterExercises, searchExercises, filterAndSearchExercises, getNextPosition } from '../exerciseQueryUtils'
import { database } from '../../index'
import type Exercise from '../../models/Exercise'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
  },
}))

const mockGet = database.get as jest.Mock

function ex(id: string, name: string, muscles: string[], equipment: string): Exercise {
  return { id, name, muscles, equipment } as unknown as Exercise
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── filterExercises ──────────────────────────────────────────────────────────

describe('filterExercises', () => {
  const exercises = [
    ex('e1', 'Bench Press', ['Pectoraux'], 'Barre'),
    ex('e2', 'Squat', ['Quadriceps', 'Fessiers'], 'Barre'),
    ex('e3', 'Curl Haltères', ['Biceps'], 'Haltères'),
    ex('e4', 'Pull-up', ['Dos', 'Biceps'], 'Poids du corps'),
  ]

  it('returns all exercises when no filter applied', () => {
    expect(filterExercises(exercises)).toHaveLength(4)
  })

  it('filters by muscle', () => {
    const result = filterExercises(exercises, 'Biceps')
    expect(result).toHaveLength(2)
    expect(result.map(e => e.id)).toContain('e3')
    expect(result.map(e => e.id)).toContain('e4')
  })

  it('filters by equipment', () => {
    const result = filterExercises(exercises, null, 'Barre')
    expect(result).toHaveLength(2)
    expect(result.map(e => e.id)).toContain('e1')
    expect(result.map(e => e.id)).toContain('e2')
  })

  it('filters by both muscle and equipment', () => {
    const result = filterExercises(exercises, 'Biceps', 'Haltères')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e3')
  })

  it('returns empty when no exercise matches', () => {
    expect(filterExercises(exercises, 'Mollets', 'Barre')).toHaveLength(0)
  })

  it('returns all when both filters are null', () => {
    expect(filterExercises(exercises, null, null)).toHaveLength(4)
  })

  it('returns empty for empty exercise list', () => {
    expect(filterExercises([], 'Biceps')).toHaveLength(0)
  })
})

// ─── searchExercises ──────────────────────────────────────────────────────────

describe('searchExercises', () => {
  const exercises = [
    ex('e1', 'Bench Press', [], ''),
    ex('e2', 'Squat barre', [], ''),
    ex('e3', 'Curl haltères', [], ''),
  ]

  it('returns all exercises for empty query', () => {
    expect(searchExercises(exercises, '')).toHaveLength(3)
  })

  it('returns all exercises for whitespace-only query', () => {
    expect(searchExercises(exercises, '   ')).toHaveLength(3)
  })

  it('searches case-insensitively', () => {
    const result = searchExercises(exercises, 'BENCH')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e1')
  })

  it('matches partial name', () => {
    const result = searchExercises(exercises, 'squat')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e2')
  })

  it('returns empty when no exercise matches', () => {
    expect(searchExercises(exercises, 'deadlift')).toHaveLength(0)
  })

  it('handles accented characters in search', () => {
    const result = searchExercises(exercises, 'haltères')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e3')
  })
})

// ─── filterAndSearchExercises ─────────────────────────────────────────────────

describe('filterAndSearchExercises', () => {
  const exercises = [
    ex('e1', 'Bench Press', ['Pectoraux'], 'Barre'),
    ex('e2', 'Curl Biceps', ['Biceps'], 'Haltères'),
    ex('e3', 'Press Haltères', ['Pectoraux'], 'Haltères'),
  ]

  it('returns all exercises when no options given', () => {
    expect(filterAndSearchExercises(exercises, {})).toHaveLength(3)
  })

  it('applies muscle filter only', () => {
    const result = filterAndSearchExercises(exercises, { muscle: 'Pectoraux' })
    expect(result).toHaveLength(2)
  })

  it('applies search query only', () => {
    const result = filterAndSearchExercises(exercises, { searchQuery: 'press' })
    expect(result).toHaveLength(2) // Bench Press + Press Haltères
  })

  it('combines muscle filter and search', () => {
    const result = filterAndSearchExercises(exercises, { muscle: 'Pectoraux', searchQuery: 'press' })
    expect(result).toHaveLength(2) // Bench Press + Press Haltères (both Pecs)
  })

  it('returns empty when combined filters match nothing', () => {
    const result = filterAndSearchExercises(exercises, { muscle: 'Biceps', searchQuery: 'bench' })
    expect(result).toHaveLength(0)
  })
})

// ─── getNextPosition ──────────────────────────────────────────────────────────

describe('getNextPosition', () => {
  it('returns the count from the collection query', async () => {
    const mockFetchCount = jest.fn().mockResolvedValue(3)
    const mockQuery = jest.fn().mockReturnValue({ fetchCount: mockFetchCount })
    mockGet.mockReturnValue({ query: mockQuery })

    const result = await getNextPosition('programs')
    expect(result).toBe(3)
    expect(mockGet).toHaveBeenCalledWith('programs')
  })

  it('passes clauses to the query', async () => {
    const clause = { type: 'where', left: 'program_id', comparison: {}, right: 'p1' }
    const mockFetchCount = jest.fn().mockResolvedValue(1)
    const mockQuery = jest.fn().mockReturnValue({ fetchCount: mockFetchCount })
    mockGet.mockReturnValue({ query: mockQuery })

    await getNextPosition('sessions', clause as never)
    expect(mockQuery).toHaveBeenCalledWith(clause)
  })
})
