/**
 * Tests for workoutSetUtils.ts — DB-dependent functions, mocked.
 */
import { getMaxWeightForExercise, saveWorkoutSet, deleteWorkoutSet } from '../workoutSetUtils'
import { database } from '../../index'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}))

const mockGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  // Default: write executes callback immediately
  mockWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
})

// ─── getMaxWeightForExercise ──────────────────────────────────────────────────

describe('getMaxWeightForExercise', () => {
  it('returns 0 when no sets found', async () => {
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) })
    expect(await getMaxWeightForExercise('e1', 'h-current')).toBe(0)
  })

  it('returns the max weight from previous sets', async () => {
    const sets = [
      { weight: 100 },
      { weight: 120 },
      { weight: 80 },
    ]
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) })
    expect(await getMaxWeightForExercise('e1', 'h-current')).toBe(120)
  })

  it('returns a single set weight when only one set exists', async () => {
    const sets = [{ weight: 75 }]
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) })
    expect(await getMaxWeightForExercise('e1', 'h-current')).toBe(75)
  })
})

// ─── saveWorkoutSet ───────────────────────────────────────────────────────────

describe('saveWorkoutSet', () => {
  it('creates a set record via database.write', async () => {
    const mockSet = { id: 'new-set' }
    const mockCreate = jest.fn().mockResolvedValue(mockSet)
    const mockFindHistory = jest.fn().mockResolvedValue({ id: 'h1' })
    const mockFindExercise = jest.fn().mockResolvedValue({ id: 'e1' })

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'histories') return { find: mockFindHistory }
      if (collection === 'exercises') return { find: mockFindExercise }
      if (collection === 'sets') return { create: mockCreate }
      return {}
    })

    const result = await saveWorkoutSet({
      historyId: 'h1',
      exerciseId: 'e1',
      weight: 100,
      reps: 10,
      setOrder: 1,
      isPr: false,
    })

    expect(mockWrite).toHaveBeenCalled()
    expect(result).toBe(mockSet)
  })
})

// ─── deleteWorkoutSet ─────────────────────────────────────────────────────────

describe('deleteWorkoutSet', () => {
  it('calls destroyPermanently on the found set', async () => {
    const mockDestroy = jest.fn().mockResolvedValue(undefined)
    const mockSet = { destroyPermanently: mockDestroy }
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockSet]) }) })

    await deleteWorkoutSet('h1', 'e1', 1)
    expect(mockWrite).toHaveBeenCalled()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('does nothing when no set matches', async () => {
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) })

    await deleteWorkoutSet('h1', 'e1', 1)
    expect(mockWrite).toHaveBeenCalled()
    // No error thrown
  })
})
