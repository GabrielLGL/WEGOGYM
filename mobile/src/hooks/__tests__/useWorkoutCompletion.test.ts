/**
 * Tests for useWorkoutCompletion — getWeekStartTimestamp, getTotalSessionCount, and hook
 */

// We need to test the module-level functions and the hook

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))
jest.mock('../../model/utils/databaseHelpers', () => ({
  completeWorkoutHistory: jest.fn().mockResolvedValue(undefined),
  buildRecapExercises: jest.fn().mockResolvedValue([]),
  getLastSessionVolume: jest.fn().mockResolvedValue(null),
}))
jest.mock('../../model/utils/gamificationHelpers', () => ({
  calculateSessionXP: jest.fn().mockReturnValue(50),
  calculateSessionTonnage: jest.fn().mockReturnValue(1000),
  calculateLevel: jest.fn().mockReturnValue(2),
  updateStreak: jest.fn().mockReturnValue({ currentStreak: 1, bestStreak: 1, lastWorkoutWeek: '2026-W10' }),
  getCurrentISOWeek: jest.fn().mockReturnValue('2026-W10'),
  detectMilestones: jest.fn().mockReturnValue([]),
}))
jest.mock('../../model/utils/badgeHelpers', () => ({
  checkBadges: jest.fn().mockReturnValue([]),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useWorkoutCompletion } from '../useWorkoutCompletion'
import { database } from '../../model/index'
import { completeWorkoutHistory, buildRecapExercises, getLastSessionVolume } from '../../model/utils/databaseHelpers'
import { calculateSessionXP, calculateSessionTonnage } from '../../model/utils/gamificationHelpers'
import { mockUser as mockUserFactory } from '../../model/utils/__tests__/testFactories'

const mockGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock

function makeDefaultParams(overrides: Record<string, unknown> = {}) {
  return {
    historyId: 'h1',
    historyRef: { current: null },
    startTimestamp: Date.now() - 60000,
    user: null,
    completedSets: 0,
    totalSetsTarget: 3,
    totalPrs: 0,
    validatedSets: {},
    sessionExercises: [],
    sessionId: 's1',
    totalVolume: 0,
    isMountedRef: { current: true },
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())

  // Default mock for getTotalSessionCount
  mockGet.mockReturnValue({
    query: jest.fn().mockReturnValue({
      fetchCount: jest.fn().mockResolvedValue(5),
      fetch: jest.fn().mockResolvedValue([]),
      unsafeFetchRaw: jest.fn().mockResolvedValue([{ count: 3 }]),
    }),
  })
})

describe('useWorkoutCompletion', () => {
  it('returns completeWorkout function', () => {
    const params = makeDefaultParams()
    const { result } = renderHook(() => useWorkoutCompletion(params))
    expect(typeof result.current.completeWorkout).toBe('function')
  })

  it('completeWorkout returns result with durationSeconds', async () => {
    const params = makeDefaultParams({
      startTimestamp: Date.now() - 120000,
    })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output).toBeDefined()
    expect(output!.durationSeconds).toBeGreaterThanOrEqual(119)
    expect(output!.sessionXPGained).toBe(0) // no user
    expect(output!.newLevel).toBe(1)
    expect(output!.recapExercises).toEqual([])
  })

  it('calls completeWorkoutHistory with historyId', async () => {
    const params = makeDefaultParams()
    const { result } = renderHook(() => useWorkoutCompletion(params))

    await act(async () => {
      await result.current.completeWorkout()
    })

    expect(completeWorkoutHistory).toHaveBeenCalledWith('h1', expect.any(Number))
  })

  it('uses historyRef.current.id when available', async () => {
    const params = makeDefaultParams({
      historyRef: { current: { id: 'h-ref' } },
    })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    await act(async () => {
      await result.current.completeWorkout()
    })

    expect(completeWorkoutHistory).toHaveBeenCalledWith('h-ref', expect.any(Number))
  })

  it('returns null when isMountedRef is false', async () => {
    const testUser = mockUserFactory({
      totalXp: 100,
      totalTonnage: 5000,
      currentStreak: 1,
      bestStreak: 2,
      streakTarget: 3,
      lastWorkoutWeek: '2026-W09',
      totalPrs: 5,
      level: 2,
      update: jest.fn(),
    })

    const isMountedRef = { current: true }
    const params = makeDefaultParams({
      user: testUser,
      completedSets: 3,
      validatedSets: {
        s1: { reps: 10, weight: 80, isPr: false },
      },
      isMountedRef,
    })

    // Make the first fetchCount call set isMounted to false
    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetchCount: jest.fn().mockImplementation(async () => {
          isMountedRef.current = false
          return 5
        }),
        fetch: jest.fn().mockResolvedValue([]),
        unsafeFetchRaw: jest.fn().mockResolvedValue([{ count: 3 }]),
      }),
    })

    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output).toBeNull()
  })

  it('skips gamification when user is null', async () => {
    const params = makeDefaultParams({ user: null, completedSets: 5 })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output!.sessionXPGained).toBe(0)
    expect(calculateSessionXP).not.toHaveBeenCalled()
  })

  it('skips gamification when completedSets is 0', async () => {
    const testUser = mockUserFactory({ totalXp: 0, totalTonnage: 0, level: 1 })
    const params = makeDefaultParams({ user: testUser, completedSets: 0 })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output!.sessionXPGained).toBe(0)
    expect(calculateSessionXP).not.toHaveBeenCalled()
  })

  it('runs full gamification path when user and completedSets > 0', async () => {
    const testUser = mockUserFactory({
      totalXp: 100,
      totalTonnage: 5000,
      currentStreak: 1,
      bestStreak: 2,
      streakTarget: 3,
      lastWorkoutWeek: '2026-W09',
      totalPrs: 5,
      level: 2,
      update: jest.fn(),
    })

    // Setup mock chain for weekSessionCount query + getTotalSessionCount + distinct exercises + badges
    let callCount = 0
    mockGet.mockImplementation(() => ({
      query: jest.fn().mockReturnValue({
        fetchCount: jest.fn().mockResolvedValue(3),
        fetch: jest.fn().mockResolvedValue([]), // existing badges
        unsafeFetchRaw: jest.fn().mockResolvedValue([{ count: 8 }]),
      }),
      create: jest.fn(),
    }))
    mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())

    const params = makeDefaultParams({
      user: testUser,
      completedSets: 5,
      totalSetsTarget: 5,
      totalPrs: 2,
      validatedSets: {
        s1: { reps: 10, weight: 80, isPr: false },
        s2: { reps: 8, weight: 90, isPr: true },
      },
      totalVolume: 1500,
    })

    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output).toBeDefined()
    expect(output!.sessionXPGained).toBe(50)
    expect(output!.newLevel).toBe(2)
    expect(output!.newStreak).toBe(1)
    expect(calculateSessionTonnage).toHaveBeenCalled()
    expect(calculateSessionXP).toHaveBeenCalledWith(2, true)
    expect(testUser.update).toHaveBeenCalled()
  })

  it('handles gamification error gracefully', async () => {
    const testUser = mockUserFactory({
      totalXp: 100,
      totalTonnage: 5000,
      currentStreak: 1,
      bestStreak: 2,
      streakTarget: 3,
      lastWorkoutWeek: '2026-W09',
      totalPrs: 5,
      level: 2,
    })

    ;(calculateSessionTonnage as jest.Mock).mockImplementationOnce(() => {
      throw new Error('gamification error')
    })

    const params = makeDefaultParams({
      user: testUser,
      completedSets: 3,
      validatedSets: { s1: { reps: 10, weight: 80, isPr: false } },
    })

    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    // Should still return a result with default values
    expect(output).toBeDefined()
    expect(output!.sessionXPGained).toBe(0)
  })

  it('handles completeWorkoutHistory error gracefully', async () => {
    ;(completeWorkoutHistory as jest.Mock).mockRejectedValueOnce(new Error('DB error'))

    const params = makeDefaultParams()
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    // Should still return a result despite the error
    expect(output).toBeDefined()
    expect(output!.durationSeconds).toBeGreaterThan(0)
  })

  it('handles buildRecapExercises error gracefully', async () => {
    ;(buildRecapExercises as jest.Mock).mockRejectedValueOnce(new Error('Recap error'))

    const params = makeDefaultParams()
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output!.recapExercises).toEqual([])
    expect(output!.recapComparison.prevVolume).toBeNull()
  })

  it('computes recapComparison with prevVolume', async () => {
    ;(getLastSessionVolume as jest.Mock).mockResolvedValueOnce(800)

    const params = makeDefaultParams({ totalVolume: 1000 })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output!.recapComparison.prevVolume).toBe(800)
    expect(output!.recapComparison.currVolume).toBe(1000)
    expect(output!.recapComparison.volumeGain).toBe(200)
  })

  it('sets volumeGain to 0 when prevVolume is null', async () => {
    ;(getLastSessionVolume as jest.Mock).mockResolvedValueOnce(null)

    const params = makeDefaultParams({ totalVolume: 500 })
    const { result } = renderHook(() => useWorkoutCompletion(params))

    let output: any
    await act(async () => {
      output = await result.current.completeWorkout()
    })

    expect(output!.recapComparison.volumeGain).toBe(0)
  })
})
