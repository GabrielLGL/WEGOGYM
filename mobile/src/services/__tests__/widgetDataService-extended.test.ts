/**
 * Extended tests for widgetDataService — buildWidgetData + findNextWorkout
 * Covers uncovered lines: 28-35, 92-123, 141-146
 */
import { buildWidgetData } from '../widgetDataService'
import { mockUser, mockSession, mockHistory, mockDatabase } from '../../model/utils/__tests__/testFactories'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('react-native-android-widget', () => ({
  requestWidgetUpdate: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../../widgets/KoreWidget', () => ({
  KoreWidget: () => null,
}))

// ── Helpers pour construire un mock database flexible ────────────

type QueryResult = {
  fetch?: jest.Mock
  fetchCount?: jest.Mock
}

function buildMockDatabase(
  collectionResults: Record<string, QueryResult[]>,
) {
  const callCounters: Record<string, number> = {}

  const db = mockDatabase({
    get: jest.fn().mockImplementation((name: string) => {
      if (!callCounters[name]) callCounters[name] = 0
      const results = collectionResults[name] ?? []
      const idx = callCounters[name]
      callCounters[name] = idx + 1
      const result = results[idx] ?? results[results.length - 1] ?? {
        fetch: jest.fn().mockResolvedValue([]),
        fetchCount: jest.fn().mockResolvedValue(0),
      }
      return {
        query: jest.fn().mockReturnValue(result),
      }
    }),
  })

  return db
}

describe('widgetDataService — buildWidgetData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return default values when no user or sessions exist', async () => {
    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([]) }],
      sessions: [{ fetch: jest.fn().mockResolvedValue([]) }],
    })

    const result = await buildWidgetData(db)

    expect(result.streak).toBe(0)
    expect(result.streakTarget).toBe(3)
    expect(result.level).toBe(1)
    expect(result.nextWorkoutName).toBeNull()
    expect(result.nextWorkoutExerciseCount).toBe(0)
    expect(result.lastUpdated).toBeGreaterThan(0)
  })

  it('should use user values for streak, streakTarget, and level', async () => {
    const user = mockUser({
      currentStreak: 5,
      streakTarget: 7,
      level: 12,
    })

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([]) }],
      sessions: [{ fetch: jest.fn().mockResolvedValue([]) }],
    })

    const result = await buildWidgetData(db)

    expect(result.streak).toBe(5)
    expect(result.streakTarget).toBe(7)
    expect(result.level).toBe(12)
  })

  it('should find next workout from last completed history (modulo wrap)', async () => {
    const user = mockUser({ currentStreak: 2, level: 3 })
    const lastHistory = mockHistory({
      id: 'h-1',
      sessionId: 'sess-2',
      endTime: new Date(),
    })
    const lastSession = mockSession({ id: 'sess-2', programId: 'prog-1', position: 1 })

    // Programme avec 3 sessions : position 0, 1, 2
    // Derniere session = position 1, donc next = position 2
    const programSessions = [
      mockSession({ id: 'sess-1', programId: 'prog-1', name: 'Push', position: 0 }),
      mockSession({ id: 'sess-2', programId: 'prog-1', name: 'Pull', position: 1 }),
      mockSession({ id: 'sess-3', programId: 'prog-1', name: 'Legs', position: 2 }),
    ]

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([lastHistory]) }],
      sessions: [
        // 1st call: find session by id (lastHistory.sessionId)
        { fetch: jest.fn().mockResolvedValue([lastSession]) },
        // 2nd call: find program sessions
        { fetch: jest.fn().mockResolvedValue(programSessions) },
      ],
      session_exercises: [
        { fetchCount: jest.fn().mockResolvedValue(4) },
      ],
    })

    const result = await buildWidgetData(db)

    expect(result.nextWorkoutName).toBe('Legs')
    expect(result.nextWorkoutExerciseCount).toBe(4)
  })

  it('should wrap around to first session when last session is at end', async () => {
    const user = mockUser({ currentStreak: 1, level: 2 })
    const lastHistory = mockHistory({
      id: 'h-1',
      sessionId: 'sess-3',
      endTime: new Date(),
    })
    const lastSession = mockSession({ id: 'sess-3', programId: 'prog-1', position: 2 })

    // 3 sessions, last was position 2, next = (2+1) % 3 = 0
    const programSessions = [
      mockSession({ id: 'sess-1', programId: 'prog-1', name: 'Push', position: 0 }),
      mockSession({ id: 'sess-2', programId: 'prog-1', name: 'Pull', position: 1 }),
      mockSession({ id: 'sess-3', programId: 'prog-1', name: 'Legs', position: 2 }),
    ]

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([lastHistory]) }],
      sessions: [
        { fetch: jest.fn().mockResolvedValue([lastSession]) },
        { fetch: jest.fn().mockResolvedValue(programSessions) },
      ],
      session_exercises: [
        { fetchCount: jest.fn().mockResolvedValue(5) },
      ],
    })

    const result = await buildWidgetData(db)

    expect(result.nextWorkoutName).toBe('Push')
    expect(result.nextWorkoutExerciseCount).toBe(5)
  })

  it('should fallback to first session of any program when no last history session', async () => {
    const user = mockUser()
    const lastHistory = mockHistory({
      id: 'h-1',
      sessionId: 'sess-missing',
      endTime: new Date(),
    })

    const fallbackSession = mockSession({ id: 'sess-fb', name: 'Fallback Session', position: 0 })

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([lastHistory]) }],
      sessions: [
        // 1st call: find session by lastHistory.sessionId → not found
        { fetch: jest.fn().mockResolvedValue([]) },
        // 2nd call: fallback → first session of any program
        { fetch: jest.fn().mockResolvedValue([fallbackSession]) },
      ],
      session_exercises: [
        { fetchCount: jest.fn().mockResolvedValue(3) },
      ],
    })

    const result = await buildWidgetData(db)

    expect(result.nextWorkoutName).toBe('Fallback Session')
    expect(result.nextWorkoutExerciseCount).toBe(3)
  })

  it('should fallback to first session when program has no sessions', async () => {
    const user = mockUser()
    const lastHistory = mockHistory({
      id: 'h-1',
      sessionId: 'sess-1',
      endTime: new Date(),
    })
    const lastSession = mockSession({ id: 'sess-1', programId: 'prog-1', position: 0 })

    const fallbackSession = mockSession({ id: 'sess-fb', name: 'Only Session', position: 0 })

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([lastHistory]) }],
      sessions: [
        // 1st call: last session lookup
        { fetch: jest.fn().mockResolvedValue([lastSession]) },
        // 2nd call: program sessions → empty
        { fetch: jest.fn().mockResolvedValue([]) },
        // 3rd call: fallback
        { fetch: jest.fn().mockResolvedValue([fallbackSession]) },
      ],
      session_exercises: [
        { fetchCount: jest.fn().mockResolvedValue(2) },
      ],
    })

    const result = await buildWidgetData(db)

    expect(result.nextWorkoutName).toBe('Only Session')
    expect(result.nextWorkoutExerciseCount).toBe(2)
  })

  it('should return null nextWorkout when no sessions exist at all', async () => {
    const user = mockUser()

    const db = buildMockDatabase({
      users: [{ fetch: jest.fn().mockResolvedValue([user]) }],
      histories: [{ fetch: jest.fn().mockResolvedValue([]) }],
      sessions: [
        // fallback: no sessions
        { fetch: jest.fn().mockResolvedValue([]) },
      ],
    })

    const result = await buildWidgetData(db)

    expect(result.nextWorkoutName).toBeNull()
    expect(result.nextWorkoutExerciseCount).toBe(0)
  })
})
