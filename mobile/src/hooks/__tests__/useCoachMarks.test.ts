/**
 * Tests for useCoachMarks hook
 */
jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn(),
  },
}))

import { renderHook, act } from '@testing-library/react-native'
import { useCoachMarks } from '../useCoachMarks'
import { database } from '../../model/index'
import { mockUser } from '../../model/utils/__tests__/testFactories'

const mockWrite = (database as unknown as { write: jest.Mock }).write

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((fn: () => Promise<unknown>) => fn())
})

describe('useCoachMarks', () => {
  it('shouldShow = false when user is null', () => {
    const { result } = renderHook(() => useCoachMarks(null))
    expect(result.current.shouldShow).toBe(false)
  })

  it('shouldShow = false when onboardingCompleted is false', () => {
    const user = mockUser({ onboardingCompleted: false, tutorialCompleted: false })
    const { result } = renderHook(() => useCoachMarks(user))
    expect(result.current.shouldShow).toBe(false)
  })

  it('shouldShow = false when tutorialCompleted is true', () => {
    const user = mockUser({ onboardingCompleted: true, tutorialCompleted: true })
    const { result } = renderHook(() => useCoachMarks(user))
    expect(result.current.shouldShow).toBe(false)
  })

  it('shouldShow = true when onboarding done but tutorial not', () => {
    const user = mockUser({ onboardingCompleted: true, tutorialCompleted: false })
    const { result } = renderHook(() => useCoachMarks(user))
    expect(result.current.shouldShow).toBe(true)
  })

  it('markCompleted does nothing when user is null', async () => {
    const { result } = renderHook(() => useCoachMarks(null))

    await act(async () => {
      await result.current.markCompleted()
    })

    expect(mockWrite).not.toHaveBeenCalled()
  })

  it('markCompleted updates user.tutorialCompleted to true', async () => {
    const capturedUpdate: Record<string, unknown> = {}
    const user = mockUser({
      onboardingCompleted: true,
      tutorialCompleted: false,
      update: jest.fn().mockImplementation(async (fn: (u: Record<string, unknown>) => void) => {
        fn(capturedUpdate)
      }),
    })

    const { result } = renderHook(() => useCoachMarks(user))

    await act(async () => {
      await result.current.markCompleted()
    })

    expect(mockWrite).toHaveBeenCalled()
    expect(user.update).toHaveBeenCalled()
    expect(capturedUpdate.tutorialCompleted).toBe(true)
  })
})
