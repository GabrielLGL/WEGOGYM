/**
 * Extended tests for workoutSetUtils.ts — covers addRetroactiveSet & recalculateSetPrs
 */
jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

import { addRetroactiveSet, recalculateSetPrs } from '../workoutSetUtils'
import { database } from '../../index'

const mockGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock
const mockBatch = database.batch as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
  mockBatch.mockResolvedValue(undefined)
})

// ─── addRetroactiveSet ───────────────────────────────────────────────────────

describe('addRetroactiveSet', () => {
  it('creates a set with isPr = false inside database.write', async () => {
    const mockHistory = { id: 'h1' }
    const mockExercise = { id: 'e1' }
    const capturedRecord: Record<string, unknown> = {}
    const mockCreate = jest.fn().mockImplementation((cb: (r: Record<string, unknown>) => void) => {
      const record: Record<string, unknown> = {
        history: { set: jest.fn() },
        exercise: { set: jest.fn() },
        weight: 0,
        reps: 0,
        setOrder: 0,
        isPr: true, // should be overridden to false
      }
      cb(record)
      Object.assign(capturedRecord, record)
      return record
    })

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'histories') return { find: jest.fn().mockResolvedValue(mockHistory) }
      if (collection === 'exercises') return { find: jest.fn().mockResolvedValue(mockExercise) }
      if (collection === 'sets') return { create: mockCreate }
      return {}
    })

    const result = await addRetroactiveSet({
      historyId: 'h1',
      exerciseId: 'e1',
      weight: 80,
      reps: 10,
      setOrder: 3,
    })

    expect(mockWrite).toHaveBeenCalled()
    expect(capturedRecord.weight).toBe(80)
    expect(capturedRecord.reps).toBe(10)
    expect(capturedRecord.setOrder).toBe(3)
    expect(capturedRecord.isPr).toBe(false)
  })
})

// ─── recalculateSetPrs ───────────────────────────────────────────────────────

describe('recalculateSetPrs', () => {
  it('does nothing when no sets exist', async () => {
    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
      }
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
      }
      return {}
    })

    await recalculateSetPrs('e1')
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('does nothing when all PR flags are already correct', async () => {
    const histories = [
      { id: 'h1', startTime: new Date(2026, 0, 1) },
    ]
    const sets = [
      { history: { id: 'h1' }, weight: 50, setOrder: 1, isPr: true },
      { history: { id: 'h1' }, weight: 40, setOrder: 2, isPr: false },
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) }
      }
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      return {}
    })

    await recalculateSetPrs('e1')
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('updates incorrect PR flags via database.batch', async () => {
    const histories = [
      { id: 'h1', startTime: new Date(2026, 0, 1) },
      { id: 'h2', startTime: new Date(2026, 0, 2) },
    ]
    const mockPrepareUpdate = jest.fn().mockImplementation(function (this: Record<string, unknown>, cb: (s: Record<string, unknown>) => void) {
      cb(this)
      return this
    })
    const sets = [
      { history: { id: 'h1' }, weight: 50, setOrder: 1, isPr: false, prepareUpdate: mockPrepareUpdate },
      { history: { id: 'h2' }, weight: 60, setOrder: 1, isPr: false, prepareUpdate: mockPrepareUpdate },
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) }
      }
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      return {}
    })

    await recalculateSetPrs('e1')
    expect(mockWrite).toHaveBeenCalled()
    expect(mockBatch).toHaveBeenCalled()
    // Both sets should have been updated (both had isPr = false but should be true)
    expect(mockPrepareUpdate).toHaveBeenCalledTimes(2)
  })

  it('filters out sets belonging to soft-deleted histories', async () => {
    // Only h1 is active (deleted_at = null), h2 is deleted
    const histories = [
      { id: 'h1', startTime: new Date(2026, 0, 1) },
    ]
    const sets = [
      { history: { id: 'h1' }, weight: 50, setOrder: 1, isPr: false, prepareUpdate: jest.fn().mockReturnValue({}) },
      { history: { id: 'h2' }, weight: 100, setOrder: 1, isPr: true }, // deleted history, should be filtered
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) }
      }
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      return {}
    })

    await recalculateSetPrs('e1')
    // Only h1's set should be evaluated. It has isPr=false but should be true.
    expect(mockWrite).toHaveBeenCalled()
  })

  it('sorts sets chronologically by history start time then setOrder', async () => {
    const histories = [
      { id: 'h1', startTime: new Date(2026, 0, 2) }, // Later
      { id: 'h2', startTime: new Date(2026, 0, 1) }, // Earlier
    ]
    const prepareUpdate = jest.fn().mockReturnValue({})
    const sets = [
      { history: { id: 'h1' }, weight: 50, setOrder: 1, isPr: true, prepareUpdate },
      { history: { id: 'h2' }, weight: 60, setOrder: 1, isPr: false, prepareUpdate },
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(sets) }) }
      }
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      return {}
    })

    await recalculateSetPrs('e1')
    // h2 (60kg) is earlier and should be PR. h1 (50kg) is later and should NOT be PR.
    expect(mockWrite).toHaveBeenCalled()
  })
})
