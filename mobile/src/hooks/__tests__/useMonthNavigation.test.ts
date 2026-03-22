import { renderHook, act } from '@testing-library/react-native'
import { PanResponder } from 'react-native'
import { useMonthNavigation } from '../useMonthNavigation'

// Capture PanResponder config to test swipe callbacks
let capturedConfig: Record<string, (...args: unknown[]) => unknown> = {}
const originalCreate = PanResponder.create
jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
  capturedConfig = config as Record<string, (...args: unknown[]) => unknown>
  return originalCreate(config)
})

describe('useMonthNavigation', () => {
  describe('etat initial', () => {
    it('should initialize with current year and month', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const now = new Date()

      expect(result.current.viewYear).toBe(now.getFullYear())
      expect(result.current.viewMonth).toBe(now.getMonth())
    })

    it('should have isCurrentMonth true initially', () => {
      const { result } = renderHook(() => useMonthNavigation())

      expect(result.current.isCurrentMonth).toBe(true)
    })

    it('should return today as a Date', () => {
      const { result } = renderHook(() => useMonthNavigation())

      expect(result.current.today).toBeInstanceOf(Date)
    })

    it('should return panHandlers object', () => {
      const { result } = renderHook(() => useMonthNavigation())

      expect(result.current.panHandlers).toBeDefined()
      expect(typeof result.current.panHandlers).toBe('object')
    })
  })

  describe('goToPrevMonth', () => {
    it('should decrement month by 1', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const initialMonth = result.current.viewMonth

      act(() => {
        result.current.goToPrevMonth()
      })

      if (initialMonth === 0) {
        expect(result.current.viewMonth).toBe(11)
      } else {
        expect(result.current.viewMonth).toBe(initialMonth - 1)
      }
    })

    it('should rollover from January to December of previous year', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const currentYear = result.current.viewYear

      // Navigate back to January
      const stepsToJanuary = result.current.viewMonth
      for (let i = 0; i < stepsToJanuary; i++) {
        act(() => {
          result.current.goToPrevMonth()
        })
      }

      expect(result.current.viewMonth).toBe(0)
      expect(result.current.viewYear).toBe(currentYear)

      // One more step should rollover to December of previous year
      act(() => {
        result.current.goToPrevMonth()
      })

      expect(result.current.viewMonth).toBe(11)
      expect(result.current.viewYear).toBe(currentYear - 1)
    })

    it('should set isCurrentMonth to false after navigating back', () => {
      const { result } = renderHook(() => useMonthNavigation())

      act(() => {
        result.current.goToPrevMonth()
      })

      expect(result.current.isCurrentMonth).toBe(false)
    })

    it('should call onMonthChange callback', () => {
      const onMonthChange = jest.fn()
      const { result } = renderHook(() => useMonthNavigation(onMonthChange))

      act(() => {
        result.current.goToPrevMonth()
      })

      expect(onMonthChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('goToNextMonth', () => {
    it('should be blocked when already on current month', () => {
      const onMonthChange = jest.fn()
      const { result } = renderHook(() => useMonthNavigation(onMonthChange))

      expect(result.current.isCurrentMonth).toBe(true)

      act(() => {
        result.current.goToNextMonth()
      })

      // Should not change
      const now = new Date()
      expect(result.current.viewYear).toBe(now.getFullYear())
      expect(result.current.viewMonth).toBe(now.getMonth())
      // onMonthChange should NOT be called when blocked
      expect(onMonthChange).not.toHaveBeenCalled()
    })

    it('should increment month when in the past', () => {
      const { result } = renderHook(() => useMonthNavigation())

      // Go back first
      act(() => {
        result.current.goToPrevMonth()
      })

      const monthAfterBack = result.current.viewMonth

      act(() => {
        result.current.goToNextMonth()
      })

      // Should be back to current month
      const now = new Date()
      expect(result.current.viewYear).toBe(now.getFullYear())
      expect(result.current.viewMonth).toBe(now.getMonth())
    })

    it('should call onMonthChange callback when not blocked', () => {
      const onMonthChange = jest.fn()
      const { result } = renderHook(() => useMonthNavigation(onMonthChange))

      // Go back first so we can go forward
      act(() => {
        result.current.goToPrevMonth()
      })

      onMonthChange.mockClear()

      act(() => {
        result.current.goToNextMonth()
      })

      expect(onMonthChange).toHaveBeenCalledTimes(1)
    })

    it('should rollover from December to January of next year', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const currentYear = result.current.viewYear

      // Navigate back far enough to reach a December, then forward to test rollover
      // Go back 13 months to ensure we are in the past at month 11
      const currentMonth = result.current.viewMonth
      const stepsBack = currentMonth + 13
      for (let i = 0; i < stepsBack; i++) {
        act(() => {
          result.current.goToPrevMonth()
        })
      }

      // Now navigate forward to reach November (month 11) of previous year
      // We are at: currentMonth - stepsBack, accounting for rollovers
      // Let's just navigate to a known December
      // After going back 13 months from current, we should be well in the past
      // Navigate forward until we hit month 11
      while (result.current.viewMonth !== 11) {
        act(() => {
          result.current.goToNextMonth()
        })
      }

      expect(result.current.viewMonth).toBe(11)
      const yearAtDecember = result.current.viewYear

      act(() => {
        result.current.goToNextMonth()
      })

      expect(result.current.viewMonth).toBe(0)
      expect(result.current.viewYear).toBe(yearAtDecember + 1)
    })
  })

  describe('goToToday', () => {
    it('should navigate back to current month after going to past', () => {
      const { result } = renderHook(() => useMonthNavigation())

      // Navigate to the past
      act(() => {
        result.current.goToPrevMonth()
      })
      act(() => {
        result.current.goToPrevMonth()
      })

      expect(result.current.isCurrentMonth).toBe(false)

      act(() => {
        result.current.goToToday()
      })

      const now = new Date()
      expect(result.current.viewYear).toBe(now.getFullYear())
      expect(result.current.viewMonth).toBe(now.getMonth())
      expect(result.current.isCurrentMonth).toBe(true)
    })

    it('should call onMonthChange callback', () => {
      const onMonthChange = jest.fn()
      const { result } = renderHook(() => useMonthNavigation(onMonthChange))

      act(() => {
        result.current.goToToday()
      })

      expect(onMonthChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('sans callback onMonthChange', () => {
    it('should work without onMonthChange callback', () => {
      const { result } = renderHook(() => useMonthNavigation())

      // Should not throw
      act(() => {
        result.current.goToPrevMonth()
      })
      act(() => {
        result.current.goToNextMonth()
      })
      act(() => {
        result.current.goToToday()
      })

      expect(result.current.isCurrentMonth).toBe(true)
    })
  })

  describe('panResponder swipe callbacks', () => {
    const mockEvent = {} as Parameters<NonNullable<typeof capturedConfig['onMoveShouldSetPanResponder']>>[0]

    it('should recognize horizontal swipe with onMoveShouldSetPanResponder', () => {
      renderHook(() => useMonthNavigation())

      const shouldSet = capturedConfig.onMoveShouldSetPanResponder
      // Horizontal swipe exceeding minimum dx
      expect(shouldSet(mockEvent, { dx: 20, dy: 5 })).toBe(true)
      // Too little horizontal movement
      expect(shouldSet(mockEvent, { dx: 10, dy: 5 })).toBe(false)
      // Too much vertical movement
      expect(shouldSet(mockEvent, { dx: 20, dy: 50 })).toBe(false)
    })

    it('should call goToPrevMonth on right swipe exceeding threshold', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const now = new Date()

      act(() => {
        capturedConfig.onPanResponderRelease(mockEvent, { dx: 60 })
      })

      // Right swipe = go to previous month
      if (now.getMonth() === 0) {
        expect(result.current.viewMonth).toBe(11)
      } else {
        expect(result.current.viewMonth).toBe(now.getMonth() - 1)
      }
    })

    it('should call goToNextMonth on left swipe exceeding threshold', () => {
      const { result } = renderHook(() => useMonthNavigation())

      // First go back so goToNextMonth is not blocked
      act(() => {
        result.current.goToPrevMonth()
      })
      act(() => {
        result.current.goToPrevMonth()
      })

      const monthBefore = result.current.viewMonth

      act(() => {
        capturedConfig.onPanResponderRelease(mockEvent, { dx: -60 })
      })

      // Left swipe = go to next month
      if (monthBefore === 11) {
        expect(result.current.viewMonth).toBe(0)
      } else {
        expect(result.current.viewMonth).toBe(monthBefore + 1)
      }
    })

    it('should not navigate on swipe below threshold', () => {
      const { result } = renderHook(() => useMonthNavigation())
      const now = new Date()

      act(() => {
        capturedConfig.onPanResponderRelease(mockEvent, { dx: 30 })
      })

      // No change — swipe too small
      expect(result.current.viewYear).toBe(now.getFullYear())
      expect(result.current.viewMonth).toBe(now.getMonth())
    })
  })
})
