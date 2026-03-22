/**
 * Tests for useCalendarDayDetail hook
 * Covers: toggleBlock, clearDetail, handleDayPress (all branches)
 */
jest.mock('../../model', () => ({
  database: {
    get: jest.fn(),
  },
}))

jest.mock('../../model/utils/statsHelpers', () => ({
  toDateKey: jest.fn((date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useCalendarDayDetail } from '../useCalendarDayDetail'
import type { DayCell } from '../useCalendarDayDetail'
import { database } from '../../model'
import { mockHistory, mockSet, mockSession, mockProgram, mockExercise } from '../../model/utils/__tests__/testFactories'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDay(overrides: Partial<DayCell> = {}): DayCell {
  return {
    dateKey: '2026-03-15',
    date: new Date(2026, 2, 15),
    dayNumber: 15,
    count: 0,
    isFuture: false,
    isCurrentMonth: true,
    ...overrides,
  }
}

function setupDatabaseMock(collections: Record<string, { query: jest.Mock }>) {
  (database.get as jest.Mock).mockImplementation((name: string) => {
    return collections[name] ?? {
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
        fetchCount: jest.fn().mockResolvedValue(0),
      }),
    }
  })
}

function makeQueryMock(data: unknown[]) {
  return {
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue(data),
    }),
  }
}

describe('useCalendarDayDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── clearDetail ──────────────────────────────────────────────

  describe('clearDetail', () => {
    it('should reset detail to null', async () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      // Ouvrir un jour sans history
      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 0 }))
      })
      expect(result.current.detail).not.toBeNull()

      // Fermer
      act(() => {
        result.current.clearDetail()
      })
      expect(result.current.detail).toBeNull()
    })
  })

  // ── toggleBlock ──────────────────────────────────────────────

  describe('toggleBlock', () => {
    it('should add historyId to expandedBlocks', () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      act(() => {
        result.current.toggleBlock('h-1')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(true)
    })

    it('should remove historyId from expandedBlocks on second toggle', () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      act(() => {
        result.current.toggleBlock('h-1')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(true)

      act(() => {
        result.current.toggleBlock('h-1')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(false)
    })

    it('should handle multiple blocks independently', () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      act(() => {
        result.current.toggleBlock('h-1')
      })
      act(() => {
        result.current.toggleBlock('h-2')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(true)
      expect(result.current.expandedBlocks.has('h-2')).toBe(true)

      act(() => {
        result.current.toggleBlock('h-1')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(false)
      expect(result.current.expandedBlocks.has('h-2')).toBe(true)
    })
  })

  // ── handleDayPress ───────────────────────────────────────────

  describe('handleDayPress', () => {
    it('should early return for future days', async () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ isFuture: true, count: 1 }))
      })

      expect(result.current.detail).toBeNull()
    })

    it('should early return for non-current-month days', async () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ isCurrentMonth: false, count: 1 }))
      })

      expect(result.current.detail).toBeNull()
    })

    it('should toggle detail off when pressing the same day', async () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      const day = makeDay({ count: 0 })

      // Premier appui : ouvrir
      await act(async () => {
        await result.current.handleDayPress(day)
      })
      expect(result.current.detail).not.toBeNull()
      expect(result.current.detail?.dateKey).toBe('2026-03-15')

      // Second appui : fermer
      await act(async () => {
        await result.current.handleDayPress(day)
      })
      expect(result.current.detail).toBeNull()
    })

    it('should set empty sessions for day with count 0', async () => {
      const { result } = renderHook(() => useCalendarDayDetail([], 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 0 }))
      })

      expect(result.current.detail).toEqual(
        expect.objectContaining({
          dateKey: '2026-03-15',
          count: 0,
          sessions: [],
        }),
      )
    })

    it('should build session blocks with sets and exercises', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const endTime = new Date(2026, 2, 15, 11, 0) // 60 min

      const histories = [
        mockHistory({
          id: 'h-1',
          startTime,
          endTime,
          sessionId: 'sess-1',
          deletedAt: null,
        }),
      ]

      const sessionObj = mockSession({ id: 'sess-1', name: 'Push Day', programId: 'prog-1' })
      const programObj = mockProgram({ id: 'prog-1', name: 'PPL' })
      const exerciseObj = mockExercise({ id: 'exo-1', name: 'Bench Press' })

      const sets = [
        mockSet({ id: 'set-1', historyId: 'h-1', exerciseId: 'exo-1', setOrder: 1, weight: 80, reps: 10, isPr: false }),
        mockSet({ id: 'set-2', historyId: 'h-1', exerciseId: 'exo-1', setOrder: 2, weight: 85, reps: 8, isPr: true }),
      ]

      setupDatabaseMock({
        sessions: makeQueryMock([sessionObj]),
        programs: makeQueryMock([programObj]),
        sets: makeQueryMock(sets),
        exercises: makeQueryMock([exerciseObj]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      expect(result.current.detail).not.toBeNull()
      expect(result.current.detail?.count).toBe(1)
      expect(result.current.detail?.sessions).toHaveLength(1)

      const block = result.current.detail?.sessions[0]
      expect(block?.historyId).toBe('h-1')
      expect(block?.programName).toBe('PPL')
      expect(block?.sessionName).toBe('Push Day')
      expect(block?.durationMin).toBe(60)
      expect(block?.exercises).toHaveLength(1)
      expect(block?.exercises[0].exerciseName).toBe('Bench Press')
      expect(block?.exercises[0].sets).toHaveLength(2)
      expect(block?.exercises[0].sets[0].setOrder).toBe(1)
      expect(block?.exercises[0].sets[1].setOrder).toBe(2)
      expect(block?.exercises[0].sets[1].isPr).toBe(true)
    })

    it('should handle sets with null exerciseId (unknown exercise)', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const histories = [
        mockHistory({
          id: 'h-1',
          startTime,
          endTime: null,
          sessionId: 'sess-1',
          deletedAt: null,
        }),
      ]

      const sessionObj = mockSession({ id: 'sess-1', name: 'Session', programId: 'prog-1' })
      const programObj = mockProgram({ id: 'prog-1', name: 'Program' })

      // Set with null exerciseId
      const setWithNullExercise = mockSet({
        id: 'set-1',
        historyId: 'h-1',
        exerciseId: '',
        setOrder: 1,
        weight: 50,
        reps: 10,
        isPr: false,
      })
      // Override exerciseId to simulate null
      Object.defineProperty(setWithNullExercise, 'exerciseId', { value: null, writable: true })

      setupDatabaseMock({
        sessions: makeQueryMock([sessionObj]),
        programs: makeQueryMock([programObj]),
        sets: makeQueryMock([setWithNullExercise]),
        exercises: makeQueryMock([]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      expect(result.current.detail?.sessions).toHaveLength(1)
      const block = result.current.detail?.sessions[0]
      expect(block?.durationMin).toBeNull() // endTime is null
      expect(block?.exercises).toHaveLength(1)
      // Should use fallback name from translations
      expect(block?.exercises[0].exerciseName).toBe('Exercice inconnu')
    })

    it('should handle history with no sessionId', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const histories = [
        mockHistory({
          id: 'h-1',
          startTime,
          endTime: null,
          deletedAt: null,
        }),
      ]
      // Override sessionId to null
      Object.defineProperty(histories[0], 'sessionId', { value: null, writable: true })

      setupDatabaseMock({
        sessions: makeQueryMock([]),
        programs: makeQueryMock([]),
        sets: makeQueryMock([]),
        exercises: makeQueryMock([]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      expect(result.current.detail?.sessions).toHaveLength(1)
      expect(result.current.detail?.sessions[0].programName).toBe('')
      expect(result.current.detail?.sessions[0].sessionName).toBe('')
    })

    it('should skip deleted histories when filtering', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const histories = [
        mockHistory({
          id: 'h-1',
          startTime,
          deletedAt: new Date(), // deleted
          sessionId: 'sess-1',
        }),
        mockHistory({
          id: 'h-2',
          startTime,
          deletedAt: null,
          sessionId: 'sess-2',
        }),
      ]

      const sessionObj = mockSession({ id: 'sess-2', name: 'Valid', programId: 'prog-1' })
      const programObj = mockProgram({ id: 'prog-1', name: 'Prog' })

      setupDatabaseMock({
        sessions: makeQueryMock([sessionObj]),
        programs: makeQueryMock([programObj]),
        sets: makeQueryMock([]),
        exercises: makeQueryMock([]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 2 }))
      })

      // Only h-2 should be in the result (h-1 is deleted)
      expect(result.current.detail?.sessions).toHaveLength(1)
      expect(result.current.detail?.sessions[0].historyId).toBe('h-2')
    })

    it('should group multiple sets by exercise', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const endTime = new Date(2026, 2, 15, 10, 30)

      const histories = [
        mockHistory({ id: 'h-1', startTime, endTime, sessionId: 'sess-1', deletedAt: null }),
      ]

      const exercise1 = mockExercise({ id: 'exo-1', name: 'Squat' })
      const exercise2 = mockExercise({ id: 'exo-2', name: 'Leg Press' })

      const sets = [
        mockSet({ id: 'set-1', historyId: 'h-1', exerciseId: 'exo-1', setOrder: 2, weight: 100, reps: 5 }),
        mockSet({ id: 'set-2', historyId: 'h-1', exerciseId: 'exo-1', setOrder: 1, weight: 80, reps: 8 }),
        mockSet({ id: 'set-3', historyId: 'h-1', exerciseId: 'exo-2', setOrder: 1, weight: 120, reps: 10 }),
      ]

      setupDatabaseMock({
        sessions: makeQueryMock([mockSession({ id: 'sess-1', programId: 'prog-1' })]),
        programs: makeQueryMock([mockProgram({ id: 'prog-1' })]),
        sets: makeQueryMock(sets),
        exercises: makeQueryMock([exercise1, exercise2]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      const block = result.current.detail?.sessions[0]
      expect(block?.exercises).toHaveLength(2)

      const squatExercise = block?.exercises.find(e => e.exerciseName === 'Squat')
      expect(squatExercise?.sets).toHaveLength(2)
      // Sets should be sorted by setOrder
      expect(squatExercise?.sets[0].setOrder).toBe(1)
      expect(squatExercise?.sets[1].setOrder).toBe(2)
    })

    it('should handle database errors gracefully', async () => {
      const startTime = new Date(2026, 2, 15, 10, 0)
      const histories = [
        mockHistory({ id: 'h-1', startTime, deletedAt: null, sessionId: 'sess-1' }),
      ]

      ;(database.get as jest.Mock).mockImplementation(() => {
        throw new Error('Database error')
      })

      // Suppress console.error in __DEV__ mode
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      // detail should remain null (error was caught)
      expect(result.current.detail).toBeNull()

      consoleErrorSpy.mockRestore()
    })

    it('should reset expandedBlocks when selecting a new day', async () => {
      const histories = [
        mockHistory({ id: 'h-1', startTime: new Date(2026, 2, 15, 10, 0), deletedAt: null, sessionId: 'sess-1' }),
      ]

      setupDatabaseMock({
        sessions: makeQueryMock([mockSession({ id: 'sess-1', programId: 'prog-1' })]),
        programs: makeQueryMock([mockProgram({ id: 'prog-1' })]),
        sets: makeQueryMock([]),
        exercises: makeQueryMock([]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      // Expand a block
      act(() => {
        result.current.toggleBlock('h-1')
      })
      expect(result.current.expandedBlocks.has('h-1')).toBe(true)

      // Press a new day
      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      // expandedBlocks should be reset
      expect(result.current.expandedBlocks.size).toBe(0)
    })

    it('should compute zero duration when endTime equals startTime', async () => {
      const sameTime = new Date(2026, 2, 15, 10, 0)
      const histories = [
        mockHistory({ id: 'h-1', startTime: sameTime, endTime: sameTime, deletedAt: null, sessionId: 'sess-1' }),
      ]

      setupDatabaseMock({
        sessions: makeQueryMock([mockSession({ id: 'sess-1', programId: 'prog-1' })]),
        programs: makeQueryMock([mockProgram({ id: 'prog-1' })]),
        sets: makeQueryMock([]),
        exercises: makeQueryMock([]),
      })

      const { result } = renderHook(() => useCalendarDayDetail(histories, 'fr-FR'))

      await act(async () => {
        await result.current.handleDayPress(makeDay({ count: 1 }))
      })

      // 0 minutes rounds to 0, which is not > 0, so durationMin should be null
      expect(result.current.detail?.sessions[0].durationMin).toBeNull()
    })
  })
})
