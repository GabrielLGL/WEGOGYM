/**
 * Extended tests for useSessionManager — groupExercises & ungroupExercise
 */
jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))
jest.mock('../../model/utils/databaseHelpers', () => ({
  getNextPosition: jest.fn(),
  parseNumericInput: jest.fn(),
  parseIntegerInput: jest.fn(),
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  validateWorkoutInput: jest.fn().mockReturnValue({ valid: true }),
}))
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  ToastAndroid: { show: jest.fn(), SHORT: 1 },
}))
jest.mock('@nozbe/watermelondb', () => ({
  Q: { where: jest.fn().mockReturnValue({}) },
}))

import { renderHook, act } from '@testing-library/react-native'
import { useSessionManager } from '../useSessionManager'
import { database } from '../../model/index'

const mockWrite = database.write as jest.Mock
const mockBatch = (database as unknown as { batch: jest.Mock }).batch

const mockSession = { id: 'sess-1' }

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((fn: () => Promise<unknown>) => fn())
  mockBatch.mockResolvedValue(undefined)
})

// ─── groupExercises ──────────────────────────────────────────────────────────

describe('groupExercises', () => {
  it('returns false when items length < 2', async () => {
    const { result } = renderHook(() => useSessionManager(mockSession as any))

    let success: boolean
    await act(async () => {
      success = await result.current.groupExercises([{ id: 'se1' }] as any, 'superset')
    })

    expect(success!).toBe(false)
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('groups 2+ exercises as superset via database.batch', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = []
    const mockPrepareUpdate = jest.fn().mockImplementation(function (this: Record<string, unknown>, fn: (se: Record<string, unknown>) => void) {
      const se: Record<string, unknown> = { supersetId: null, supersetType: null, supersetPosition: null }
      fn(se)
      capturedUpdates.push(se)
      return se
    })

    const items = [
      { id: 'se1', prepareUpdate: mockPrepareUpdate },
      { id: 'se2', prepareUpdate: mockPrepareUpdate },
    ]

    const onSuccess = jest.fn()
    const { result } = renderHook(() => useSessionManager(mockSession as any, onSuccess))

    let success: boolean
    await act(async () => {
      success = await result.current.groupExercises(items as any, 'superset')
    })

    expect(success!).toBe(true)
    expect(mockWrite).toHaveBeenCalled()
    expect(mockBatch).toHaveBeenCalled()
    expect(capturedUpdates[0].supersetType).toBe('superset')
    expect(capturedUpdates[0].supersetPosition).toBe(0)
    expect(capturedUpdates[1].supersetPosition).toBe(1)
    expect(capturedUpdates[0].supersetId).toBe(capturedUpdates[1].supersetId)
    expect(onSuccess).toHaveBeenCalled()
  })

  it('groups as circuit type', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = []
    const mockPrepareUpdate = jest.fn().mockImplementation(function (this: Record<string, unknown>, fn: (se: Record<string, unknown>) => void) {
      const se: Record<string, unknown> = { supersetId: null, supersetType: null, supersetPosition: null }
      fn(se)
      capturedUpdates.push(se)
      return se
    })

    const items = [
      { id: 'se1', prepareUpdate: mockPrepareUpdate },
      { id: 'se2', prepareUpdate: mockPrepareUpdate },
      { id: 'se3', prepareUpdate: mockPrepareUpdate },
    ]

    const { result } = renderHook(() => useSessionManager(mockSession as any))

    await act(async () => {
      await result.current.groupExercises(items as any, 'circuit')
    })

    expect(capturedUpdates[0].supersetType).toBe('circuit')
    expect(capturedUpdates[2].supersetPosition).toBe(2)
  })

  it('returns false on database error', async () => {
    mockWrite.mockRejectedValueOnce(new Error('DB error'))
    const { result } = renderHook(() => useSessionManager(mockSession as any))

    let success: boolean
    await act(async () => {
      success = await result.current.groupExercises([{ id: '1' }, { id: '2' }] as any, 'superset')
    })

    expect(success!).toBe(false)
  })
})

// ─── ungroupExercise ─────────────────────────────────────────────────────────

describe('ungroupExercise', () => {
  it('returns false when exercise has no supersetId', async () => {
    const se = { id: 'se1', supersetId: null }
    const { result } = renderHook(() => useSessionManager(mockSession as any))

    let success: boolean
    await act(async () => {
      success = await result.current.ungroupExercise(se as any, [])
    })

    expect(success!).toBe(false)
    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('dissolves entire group when only 2 members (removing leaves 1)', async () => {
    const capturedUpdates: Array<Record<string, unknown>> = []
    const mockPrepareUpdate = jest.fn().mockImplementation((fn: (se: Record<string, unknown>) => void) => {
      const se: Record<string, unknown> = { supersetId: 'g1', supersetType: 'superset', supersetPosition: 0 }
      fn(se)
      capturedUpdates.push(se)
      return se
    })

    const se1 = { id: 'se1', supersetId: 'g1', prepareUpdate: mockPrepareUpdate }
    const se2 = { id: 'se2', supersetId: 'g1', prepareUpdate: mockPrepareUpdate }
    const allExercises = [se1, se2]

    const onSuccess = jest.fn()
    const { result } = renderHook(() => useSessionManager(mockSession as any, onSuccess))

    let success: boolean
    await act(async () => {
      success = await result.current.ungroupExercise(se1 as any, allExercises as any)
    })

    expect(success!).toBe(true)
    expect(mockBatch).toHaveBeenCalled()
    // Both should have been cleared
    expect(capturedUpdates).toHaveLength(2)
    expect(capturedUpdates[0].supersetId).toBeNull()
    expect(capturedUpdates[0].supersetType).toBeNull()
    expect(capturedUpdates[1].supersetId).toBeNull()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('removes only the selected exercise from group of 3+', async () => {
    const capturedPositions: Array<number | null> = []
    const mockUpdate = jest.fn().mockImplementation(async (fn: (se: Record<string, unknown>) => void) => {
      const se: Record<string, unknown> = { supersetId: 'g1', supersetType: 'superset', supersetPosition: 0 }
      fn(se)
    })
    const mockPrepareUpdate = jest.fn().mockImplementation((fn: (se: Record<string, unknown>) => void) => {
      const se: Record<string, unknown> = { supersetPosition: -1 }
      fn(se)
      capturedPositions.push(se.supersetPosition as number)
      return se
    })

    const se1 = { id: 'se1', supersetId: 'g1', supersetPosition: 0, update: mockUpdate }
    const se2 = { id: 'se2', supersetId: 'g1', supersetPosition: 1, prepareUpdate: mockPrepareUpdate }
    const se3 = { id: 'se3', supersetId: 'g1', supersetPosition: 2, prepareUpdate: mockPrepareUpdate }
    const allExercises = [se1, se2, se3]

    const { result } = renderHook(() => useSessionManager(mockSession as any))

    let success: boolean
    await act(async () => {
      success = await result.current.ungroupExercise(se1 as any, allExercises as any)
    })

    expect(success!).toBe(true)
    expect(mockUpdate).toHaveBeenCalled() // se1 removed
    // Remaining should be reindexed
    expect(capturedPositions).toEqual([0, 1])
  })

  it('returns false on database error', async () => {
    mockWrite.mockRejectedValueOnce(new Error('DB error'))
    const se = { id: 'se1', supersetId: 'g1' }
    const allExercises = [se, { id: 'se2', supersetId: 'g1' }]
    const { result } = renderHook(() => useSessionManager(mockSession as any))

    let success: boolean
    await act(async () => {
      success = await result.current.ungroupExercise(se as any, allExercises as any)
    })

    expect(success!).toBe(false)
  })
})
