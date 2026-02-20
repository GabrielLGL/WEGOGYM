// Mock the database to avoid SQLiteAdapter JSI initialization in test environment
jest.mock('../../index', () => ({ database: { get: jest.fn() } }))

import {
  parseNumericInput,
  parseIntegerInput,
  filterExercises,
  searchExercises,
  filterAndSearchExercises,
  getExerciseStatsFromSets,
  importPresetProgram,
  markOnboardingCompleted,
  formatRelativeDate,
  buildExerciseStatsFromData,
  getMaxWeightForExercise,
  completeWorkoutHistory,
  updateHistoryNote,
  createWorkoutHistory,
  saveWorkoutSet,
  getLastPerformanceForExercise,
  importGeneratedPlan,
  importGeneratedSession,
} from '../databaseHelpers'
import { database } from '../../index'
import Exercise from '../../models/Exercise'
import type { PresetProgram } from '../../onboardingPrograms'

const mockGet = database.get as jest.Mock

// Mock Exercise objects for testing
const createMockExercise = (
  id: string,
  name: string,
  muscles: string[],
  equipment: string
): Partial<Exercise> => ({
  id,
  name,
  muscles,
  equipment,
})

describe('databaseHelpers', () => {
  describe('parseNumericInput', () => {
    it('should parse valid numeric strings', () => {
      expect(parseNumericInput('10')).toBe(10)
      expect(parseNumericInput('3.5')).toBe(3.5)
      expect(parseNumericInput('0')).toBe(0)
      expect(parseNumericInput('-5')).toBe(-5)
    })

    it('should return fallback for invalid inputs', () => {
      expect(parseNumericInput('abc')).toBe(0)
      expect(parseNumericInput('')).toBe(0)
      expect(parseNumericInput('  ')).toBe(0)
    })

    it('should use custom fallback', () => {
      expect(parseNumericInput('abc', 10)).toBe(10)
      expect(parseNumericInput('', -1)).toBe(-1)
    })

    it('should handle numeric strings with leading/trailing spaces', () => {
      expect(parseNumericInput('  10  ')).toBe(10)
      expect(parseNumericInput(' 3.5 ')).toBe(3.5)
    })
  })

  describe('parseIntegerInput', () => {
    it('should parse valid integer strings', () => {
      expect(parseIntegerInput('10')).toBe(10)
      expect(parseIntegerInput('0')).toBe(0)
      expect(parseIntegerInput('-5')).toBe(-5)
    })

    it('should truncate decimal values', () => {
      expect(parseIntegerInput('3.9')).toBe(3)
      expect(parseIntegerInput('10.1')).toBe(10)
    })

    it('should return fallback for invalid inputs', () => {
      expect(parseIntegerInput('abc')).toBe(0)
      expect(parseIntegerInput('')).toBe(0)
      expect(parseIntegerInput('  ')).toBe(0)
    })

    it('should use custom fallback', () => {
      expect(parseIntegerInput('abc', 1)).toBe(1)
      expect(parseIntegerInput('', -1)).toBe(-1)
    })
  })

  describe('filterExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux', 'Triceps'], 'Poids libre'),
      createMockExercise('2', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('3', 'Leg press', ['Quadriceps', 'Fessiers'], 'Machine'),
      createMockExercise('4', 'Pompes', ['Pectoraux', 'Triceps'], 'Poids du corps'),
    ] as Exercise[]

    it('should return all exercises when no filters applied', () => {
      const filtered = filterExercises(mockExercises)
      expect(filtered.length).toBe(4)
    })

    it('should filter by muscle', () => {
      const filtered = filterExercises(mockExercises, 'Pectoraux')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '4'])
    })

    it('should filter by equipment', () => {
      const filtered = filterExercises(mockExercises, null, 'Poids libre')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should filter by both muscle and equipment', () => {
      const filtered = filterExercises(mockExercises, 'Pectoraux', 'Poids libre')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should return empty array when no matches', () => {
      const filtered = filterExercises(mockExercises, 'Dorsaux', 'Machine')
      expect(filtered.length).toBe(0)
    })

    it('should handle null/undefined filters', () => {
      expect(filterExercises(mockExercises, null, null).length).toBe(4)
      expect(filterExercises(mockExercises, undefined, undefined).length).toBe(4)
    })
  })

  describe('searchExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux'], 'Poids libre'),
      createMockExercise('2', 'Développé militaire', ['Épaules'], 'Poids libre'),
      createMockExercise('3', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('4', 'LEG PRESS', ['Quadriceps'], 'Machine'),
    ] as Exercise[]

    it('should return all exercises for empty query', () => {
      expect(searchExercises(mockExercises, '').length).toBe(4)
      expect(searchExercises(mockExercises, '   ').length).toBe(4)
    })

    it('should search case-insensitively', () => {
      const filtered = searchExercises(mockExercises, 'développé')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should match partial names', () => {
      const filtered = searchExercises(mockExercises, 'curl')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('3')
    })

    it('should handle uppercase queries', () => {
      const filtered = searchExercises(mockExercises, 'LEG')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('4')
    })

    it('should return empty array when no matches', () => {
      const filtered = searchExercises(mockExercises, 'squat')
      expect(filtered.length).toBe(0)
    })
  })

  describe('filterAndSearchExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux', 'Triceps'], 'Poids libre'),
      createMockExercise('2', 'Développé incliné', ['Pectoraux'], 'Poids libre'),
      createMockExercise('3', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('4', 'Pompes', ['Pectoraux', 'Triceps'], 'Poids du corps'),
    ] as Exercise[]

    it('should return all exercises when no options provided', () => {
      const filtered = filterAndSearchExercises(mockExercises, {})
      expect(filtered.length).toBe(4)
    })

    it('should apply muscle filter only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
      })
      expect(filtered.length).toBe(3)
    })

    it('should apply equipment filter only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        equipment: 'Poids libre',
      })
      expect(filtered.length).toBe(3)
    })

    it('should apply search query only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        searchQuery: 'développé',
      })
      expect(filtered.length).toBe(2)
    })

    it('should combine all filters', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
        equipment: 'Poids libre',
        searchQuery: 'développé',
      })
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should apply filters in correct order (filter then search)', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
        searchQuery: 'curl', // Should match nothing (curl is for Biceps)
      })
      expect(filtered.length).toBe(0)
    })

    it('should handle null filters', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: null,
        equipment: null,
        searchQuery: '',
      })
      expect(filtered.length).toBe(4)
    })
  })

  describe('getExerciseStatsFromSets', () => {
    // Helpers pour créer des mocks WatermelonDB
    const mkSet = (
      id: string,
      historyId: string,
      exerciseId: string,
      weight: number,
      reps: number,
      setOrder: number
    ) => ({
      id,
      history: { id: historyId },
      exercise: { id: exerciseId },
      weight,
      reps,
      setOrder,
    })

    const mkHistory = (id: string, startTime: Date, sessionId: string) => ({
      id,
      startTime,
      session: { id: sessionId },
    })

    const mkSession = (id: string, name: string) => ({ id, name })

    // Fabrique de mock query chain
    const makeQueryChain = (fetchResult: unknown[]) => ({
      query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(fetchResult) }),
    })

    afterEach(() => {
      mockGet.mockReset()
    })

    it('cas nominal : 2 sets dans 2 histories différentes → 2 stats triées par date', async () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-02-01')

      const mockSets = [
        mkSet('s1', 'h1', 'e1', 80, 8, 1),
        mkSet('s2', 'h2', 'e1', 90, 6, 1),
      ]
      const mockHistories = [
        mkHistory('h2', date2, 'sess1'),
        mkHistory('h1', date1, 'sess1'),
      ]
      const mockSessions = [mkSession('sess1', 'PPL Push')]

      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') return makeQueryChain(mockSets)
        if (table === 'histories') return makeQueryChain(mockHistories)
        if (table === 'sessions') return makeQueryChain(mockSessions)
        return makeQueryChain([])
      })

      const stats = await getExerciseStatsFromSets('e1')

      expect(stats).toHaveLength(2)
      // Tri ASC : h1 (jan) avant h2 (fev)
      expect(stats[0].historyId).toBe('h1')
      expect(stats[0].startTime).toEqual(date1)
      expect(stats[0].sessionName).toBe('PPL Push')
      expect(stats[1].historyId).toBe('h2')
      expect(stats[1].startTime).toEqual(date2)
    })

    it('cas poids max : 3 sets dans la même history → maxWeight = 70', async () => {
      const mockSets = [
        mkSet('s1', 'h1', 'e1', 60, 10, 1),
        mkSet('s2', 'h1', 'e1', 70, 8, 2),
        mkSet('s3', 'h1', 'e1', 65, 6, 3),
      ]
      const mockHistories = [mkHistory('h1', new Date('2024-01-15'), 'sess1')]
      const mockSessions = [mkSession('sess1', 'Full Body')]

      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') return makeQueryChain(mockSets)
        if (table === 'histories') return makeQueryChain(mockHistories)
        if (table === 'sessions') return makeQueryChain(mockSessions)
        return makeQueryChain([])
      })

      const stats = await getExerciseStatsFromSets('e1')

      expect(stats).toHaveLength(1)
      expect(stats[0].maxWeight).toBe(70)
      expect(stats[0].sets).toHaveLength(3)
      // Sets triés par setOrder
      expect(stats[0].sets[0].setOrder).toBe(1)
      expect(stats[0].sets[1].setOrder).toBe(2)
      expect(stats[0].sets[2].setOrder).toBe(3)
    })

    it('cas history soft-deleted : exclue des résultats', async () => {
      const mockSets = [
        mkSet('s1', 'h1', 'e1', 80, 8, 1),
        mkSet('s2', 'h2', 'e1', 90, 6, 1),
      ]
      // La query histories avec Q.where('deleted_at', null) ne retourne que h1
      const mockHistories = [mkHistory('h1', new Date('2024-01-01'), 'sess1')]
      const mockSessions = [mkSession('sess1', 'Séance A')]

      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') return makeQueryChain(mockSets)
        if (table === 'histories') return makeQueryChain(mockHistories)
        if (table === 'sessions') return makeQueryChain(mockSessions)
        return makeQueryChain([])
      })

      const stats = await getExerciseStatsFromSets('e1')

      expect(stats).toHaveLength(1)
      expect(stats[0].historyId).toBe('h1')
    })

    it('cas aucun set : retourne tableau vide', async () => {
      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') return makeQueryChain([])
        return makeQueryChain([])
      })

      const stats = await getExerciseStatsFromSets('e1')

      expect(stats).toEqual([])
    })
  })

  describe('importPresetProgram', () => {
    const mockBatch = jest.fn().mockResolvedValue(undefined)

    const minimalPreset: PresetProgram = {
      name: 'Test PPL',
      description: 'Test',
      sessions: [
        {
          name: 'Push',
          exercises: [
            { exerciseName: 'Développé Couché Barre', setsTarget: 3, repsTarget: '8-10', weightTarget: 60 },
            { exerciseName: 'Exercice Inexistant', setsTarget: 2, repsTarget: '10', weightTarget: 0 },
          ],
        },
      ],
    }

    const mockExercise = { id: 'exo1', name: 'Développé Couché Barre' }

    beforeEach(() => {
      mockBatch.mockClear()
      ;(database as unknown as { batch: jest.Mock }).batch = mockBatch
      ;(database as unknown as { write: jest.Mock }).write = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb())
    })

    afterEach(() => {
      mockGet.mockReset()
    })

    it('prépare le programme, la séance et les exercices trouvés en batch', async () => {
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        return record
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockExercise]) }) }
        }
        if (table === 'programs') {
          return {
            query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return { query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }), prepareCreate: mockPrepareCreate }
      })

      await importPresetProgram(minimalPreset)

      // database.batch doit avoir été appelé avec les records préparés
      expect(mockBatch).toHaveBeenCalledTimes(1)
      // 1 programme + 1 session + 1 exercice trouvé (l'inexistant est ignoré)
      expect(mockBatch.mock.calls[0].length).toBe(3)
    })

    it('ignore silencieusement un exercice introuvable sans crash', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = { id: 'new-id', program: { set: jest.fn() }, session: { set: jest.fn() }, exercise: { set: jest.fn() } }
        cb(record)
        return record
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
        }
        return { query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }), prepareCreate: mockPrepareCreate }
      })

      await importPresetProgram(minimalPreset)

      // console.warn pour les 2 exercices introuvables
      expect(warnSpy).toHaveBeenCalled()
      // 1 programme + 1 session seulement (pas de session_exercises)
      expect(mockBatch.mock.calls[0].length).toBe(2)
      warnSpy.mockRestore()
    })
  })

  // ─── Pure functions ───────────────────────────────────────────────────────

  describe('formatRelativeDate', () => {
    it('should return "aujourd\'hui" for a date less than 24h ago', () => {
      const now = new Date()
      expect(formatRelativeDate(now)).toBe("aujourd'hui")
    })

    it('should return "aujourd\'hui" for a date 23h ago', () => {
      const almostYesterday = new Date(Date.now() - 23 * 3600 * 1000)
      expect(formatRelativeDate(almostYesterday)).toBe("aujourd'hui")
    })

    it('should return "hier" for a date 25h ago', () => {
      const yesterday = new Date(Date.now() - 25 * 3600 * 1000)
      expect(formatRelativeDate(yesterday)).toBe('hier')
    })

    it('should return "il y a N jours" for a date N days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000)
      expect(formatRelativeDate(threeDaysAgo)).toBe('il y a 3 jours')
    })

    it('should return "il y a 7 jours" for a week-old date', () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
      expect(formatRelativeDate(weekAgo)).toBe('il y a 7 jours')
    })
  })

  describe('buildExerciseStatsFromData', () => {
    const mkSet = (histId: string, w: number, r: number, order: number) => ({
      id: `s-${histId}-${order}`,
      history: { id: histId },
      weight: w,
      reps: r,
      setOrder: order,
    })
    const mkHistory = (id: string, startTime: Date, sessId: string) => ({
      id,
      startTime,
      session: { id: sessId },
    })
    const mkSession = (id: string, name: string) => ({ id, name })

    it('should return empty array when sets is empty', () => {
      expect(buildExerciseStatsFromData([], [], [])).toEqual([])
    })

    it('should build stat for a single history with multiple sets', () => {
      const date = new Date('2024-03-01')
      const sets = [mkSet('h1', 80, 8, 1), mkSet('h1', 85, 6, 2)]
      const histories = [mkHistory('h1', date, 'sess1')]
      const sessions = [mkSession('sess1', 'Push A')]

      const stats = buildExerciseStatsFromData(
        sets as any, histories as any, sessions as any
      )

      expect(stats).toHaveLength(1)
      expect(stats[0].historyId).toBe('h1')
      expect(stats[0].maxWeight).toBe(85)
      expect(stats[0].sessionName).toBe('Push A')
      expect(stats[0].startTime).toEqual(date)
      expect(stats[0].sets).toHaveLength(2)
    })

    it('should sort sets by setOrder within a history', () => {
      const sets = [mkSet('h1', 70, 6, 3), mkSet('h1', 80, 8, 1), mkSet('h1', 75, 7, 2)]
      const histories = [mkHistory('h1', new Date(), 'sess1')]
      const sessions = [mkSession('sess1', 'Leg Day')]

      const stats = buildExerciseStatsFromData(sets as any, histories as any, sessions as any)

      expect(stats[0].sets[0].setOrder).toBe(1)
      expect(stats[0].sets[1].setOrder).toBe(2)
      expect(stats[0].sets[2].setOrder).toBe(3)
    })

    it('should sort multiple histories by startTime ASC', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-03-01')
      const sets = [mkSet('h1', 60, 10, 1), mkSet('h2', 80, 8, 1)]
      const histories = [mkHistory('h2', date2, 'sess1'), mkHistory('h1', date1, 'sess1')]
      const sessions = [mkSession('sess1', 'Full Body')]

      const stats = buildExerciseStatsFromData(sets as any, histories as any, sessions as any)

      expect(stats).toHaveLength(2)
      expect(stats[0].historyId).toBe('h1') // date1 comes first
      expect(stats[1].historyId).toBe('h2')
    })

    it('should use empty sessionName when session is not found', () => {
      const sets = [mkSet('h1', 60, 10, 1)]
      const histories = [mkHistory('h1', new Date(), 'missing-sess')]
      const sessions: ReturnType<typeof mkSession>[] = []

      const stats = buildExerciseStatsFromData(sets as any, histories as any, sessions as any)

      expect(stats[0].sessionName).toBe('')
    })

    it('should skip history entries that have no matching sets', () => {
      const sets = [mkSet('h1', 60, 10, 1)]
      const histories = [mkHistory('h1', new Date(), 'sess1'), mkHistory('h2', new Date(), 'sess1')]
      const sessions = [mkSession('sess1', 'Test')]

      const stats = buildExerciseStatsFromData(sets as any, histories as any, sessions as any)

      expect(stats).toHaveLength(1) // h2 has no sets, skipped
      expect(stats[0].historyId).toBe('h1')
    })
  })

  // ─── DB-dependent functions ───────────────────────────────────────────────

  describe('getMaxWeightForExercise', () => {
    afterEach(() => mockGet.mockReset())

    it('should return 0 when no sets exist', async () => {
      mockGet.mockReturnValue({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
      })

      const result = await getMaxWeightForExercise('exo-1', 'hist-exclude')
      expect(result).toBe(0)
    })

    it('should return the maximum weight across all sets', async () => {
      const mockSets = [{ weight: 60 }, { weight: 80 }, { weight: 70 }]
      mockGet.mockReturnValue({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(mockSets) }),
      })

      const result = await getMaxWeightForExercise('exo-1', 'hist-exclude')
      expect(result).toBe(80)
    })

    it('should return the single set weight when only one set exists', async () => {
      mockGet.mockReturnValue({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([{ weight: 55 }]) }),
      })

      const result = await getMaxWeightForExercise('exo-1', 'hist-exclude')
      expect(result).toBe(55)
    })
  })

  describe('completeWorkoutHistory', () => {
    afterEach(() => mockGet.mockReset())

    it('should find history and update its endTime', async () => {
      const endTimestamp = Date.now()
      const captured: Record<string, unknown> = {}
      const mockUpdate = jest.fn().mockImplementation(async (fn: (h: Record<string, unknown>) => void) => {
        fn(captured)
      })
      const mockFind = jest.fn().mockResolvedValue({ update: mockUpdate })
      const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn())

      ;(database as unknown as { write: jest.Mock }).write = mockWrite
      mockGet.mockReturnValue({ find: mockFind })

      await completeWorkoutHistory('hist-1', endTimestamp)

      expect(mockFind).toHaveBeenCalledWith('hist-1')
      expect(mockUpdate).toHaveBeenCalled()
      expect(captured.endTime).toEqual(new Date(endTimestamp))
    })
  })

  describe('updateHistoryNote', () => {
    afterEach(() => mockGet.mockReset())

    it('should find history and update its note', async () => {
      const captured: Record<string, unknown> = {}
      const mockUpdate = jest.fn().mockImplementation(async (fn: (h: Record<string, unknown>) => void) => {
        fn(captured)
      })
      const mockFind = jest.fn().mockResolvedValue({ update: mockUpdate })
      const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn())

      ;(database as unknown as { write: jest.Mock }).write = mockWrite
      mockGet.mockReturnValue({ find: mockFind })

      await updateHistoryNote('hist-1', 'Super séance !')

      expect(mockFind).toHaveBeenCalledWith('hist-1')
      expect(captured.note).toBe('Super séance !')
    })
  })

  describe('createWorkoutHistory', () => {
    afterEach(() => mockGet.mockReset())

    it('should create a history with correct startTime and session link', async () => {
      const startTime = Date.now()
      const mockSession = { id: 'sess-1' }
      const mockHistoryRecord = { id: 'new-hist', session: { set: jest.fn() }, startTime: null }

      const mockCreate = jest.fn().mockImplementation(async (fn: (r: typeof mockHistoryRecord) => void) => {
        fn(mockHistoryRecord)
        return mockHistoryRecord
      })
      const mockSessionFind = jest.fn().mockResolvedValue(mockSession)

      mockGet.mockImplementation((table: string) => {
        if (table === 'sessions') return { find: mockSessionFind }
        if (table === 'histories') return { create: mockCreate }
        return {}
      })

      const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<unknown>) => fn())
      ;(database as unknown as { write: jest.Mock }).write = mockWrite

      const result = await createWorkoutHistory('sess-1', startTime)

      expect(mockSessionFind).toHaveBeenCalledWith('sess-1')
      expect(mockCreate).toHaveBeenCalled()
      expect(mockHistoryRecord.startTime).toEqual(new Date(startTime))
      expect(result).toBe(mockHistoryRecord)
    })

    it('should use Date.now() as default startTime', async () => {
      const before = Date.now()
      const mockSession = { id: 'sess-1' }
      const captured: Record<string, unknown> = { session: { set: jest.fn() } }

      const mockCreate = jest.fn().mockImplementation(async (fn: (r: Record<string, unknown>) => void) => {
        fn(captured)
        return captured
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'sessions') return { find: jest.fn().mockResolvedValue(mockSession) }
        if (table === 'histories') return { create: mockCreate }
        return {}
      })

      const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<unknown>) => fn())
      ;(database as unknown as { write: jest.Mock }).write = mockWrite

      await createWorkoutHistory('sess-1')
      const after = Date.now()

      const capturedTime = (captured.startTime as Date).getTime()
      expect(capturedTime).toBeGreaterThanOrEqual(before)
      expect(capturedTime).toBeLessThanOrEqual(after)
    })
  })

  describe('saveWorkoutSet', () => {
    afterEach(() => mockGet.mockReset())

    it('should create a set with all correct fields', async () => {
      const mockHistory = { id: 'hist-1' }
      const mockExercise = { id: 'exo-1' }
      const captured: Record<string, unknown> = {
        history: { set: jest.fn() },
        exercise: { set: jest.fn() },
      }

      const mockCreate = jest.fn().mockImplementation(async (fn: (r: typeof captured) => void) => {
        fn(captured)
        return captured
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'histories') return { find: jest.fn().mockResolvedValue(mockHistory) }
        if (table === 'exercises') return { find: jest.fn().mockResolvedValue(mockExercise) }
        if (table === 'sets') return { create: mockCreate }
        return {}
      })

      const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<unknown>) => fn())
      ;(database as unknown as { write: jest.Mock }).write = mockWrite

      await saveWorkoutSet({
        historyId: 'hist-1',
        exerciseId: 'exo-1',
        weight: 80,
        reps: 10,
        setOrder: 2,
        isPr: true,
      })

      expect(mockCreate).toHaveBeenCalled()
      expect(captured.weight).toBe(80)
      expect(captured.reps).toBe(10)
      expect(captured.setOrder).toBe(2)
      expect(captured.isPr).toBe(true)
    })
  })

  describe('getLastPerformanceForExercise', () => {
    afterEach(() => mockGet.mockReset())

    it('should return null when no sets exist', async () => {
      mockGet.mockReturnValue({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
      })

      const result = await getLastPerformanceForExercise('exo-1', 'hist-exclude')
      expect(result).toBeNull()
    })

    it('should return performance stats for the most recent history', async () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-02-01') // most recent

      const mockSets = [
        { id: 's1', history: { id: 'h1' }, weight: 60, reps: 10 },
        { id: 's2', history: { id: 'h2' }, weight: 80, reps: 8 },
        { id: 's3', history: { id: 'h2' }, weight: 85, reps: 6 },
      ]
      const hist1 = { id: 'h1', startTime: date1 }
      const hist2 = { id: 'h2', startTime: date2 }

      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') {
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(mockSets) }) }
        }
        if (table === 'histories') {
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([hist1, hist2]) }) }
        }
        return {}
      })

      const result = await getLastPerformanceForExercise('exo-1', 'hist-exclude')

      expect(result).not.toBeNull()
      expect(result!.maxWeight).toBe(85) // max of h2 sets
      expect(result!.setsCount).toBe(2) // 2 sets in h2
      expect(result!.avgReps).toBe(7) // (8 + 6) / 2 = 7
      expect(result!.date).toEqual(date2)
    })

    it('should return null when sets exist but histories fetch returns empty', async () => {
      // This simulates a case where sets exist but their histories are all null/not found
      // In practice this means recentSets would be empty
      const mockSets = [
        { id: 's1', history: { id: 'h1' }, weight: 60, reps: 10 },
      ]

      mockGet.mockImplementation((table: string) => {
        if (table === 'sets') {
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(mockSets) }) }
        }
        if (table === 'histories') {
          // query retourne vide : histories supprimées physiquement → guard histories.length === 0 → null
          return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
        }
        return {}
      })

      const result = await getLastPerformanceForExercise('exo-1', 'hist-exclude')
      // recentSets would be empty (no sets have history.id === 'h-other')
      expect(result).toBeNull()
    })
  })

  describe('importGeneratedPlan', () => {
    const mockBatch = jest.fn().mockResolvedValue(undefined)

    const minimalPlan = {
      name: 'Plan PPL IA',
      sessions: [
        {
          name: 'Push',
          exercises: [
            { exerciseName: 'Développé Couché Barre', setsTarget: 3, repsTarget: '8-10', weightTarget: 60 },
            { exerciseName: 'Exercice Inexistant IA', setsTarget: 2, repsTarget: '10', weightTarget: 0 },
          ],
        },
        {
          name: 'Pull',
          exercises: [
            { exerciseName: 'Tractions', setsTarget: 4, repsTarget: '6-8', weightTarget: 0 },
          ],
        },
      ],
    }

    const mockExerciseCouche = { id: 'exo1', name: 'Développé Couché Barre' }
    const mockExerciseTractions = { id: 'exo2', name: 'Tractions' }

    beforeEach(() => {
      mockBatch.mockClear()
      ;(database as unknown as { batch: jest.Mock }).batch = mockBatch
      ;(database as unknown as { write: jest.Mock }).write = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb())
    })

    afterEach(() => {
      mockGet.mockReset()
    })

    it('importe un plan complet avec exercises existantes en batch unique', async () => {
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        return record
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue([mockExerciseCouche, mockExerciseTractions]),
            }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]), fetchCount: jest.fn().mockResolvedValue(0) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      const result = await importGeneratedPlan(minimalPlan)

      // database.batch doit avoir été appelé une seule fois
      expect(mockBatch).toHaveBeenCalledTimes(1)
      // Le résultat est le programme créé
      expect(result).toBeDefined()
    })

    it('crée un exercice custom via prepareCreate pour les exercices introuvables', async () => {
      const createdRecords: Record<string, unknown>[] = []
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          name: '',
          isCustom: false,
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        createdRecords.push(record)
        return record
      })

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          // Aucun exercice connu en DB — tous seront créés custom
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]), fetchCount: jest.fn().mockResolvedValue(2) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      await importGeneratedPlan(minimalPlan)

      // batch doit avoir été appelé
      expect(mockBatch).toHaveBeenCalledTimes(1)
      // Des records custom ont été créés (isCustom = true)
      const customExercises = createdRecords.filter(r => r.isCustom === true)
      expect(customExercises.length).toBeGreaterThan(0)
    })

    it('utilise la correspondance insensible à la casse pour trouver les exercices', async () => {
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          name: '',
          isCustom: false,
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        return record
      })

      // Exercice en DB avec casse différente
      const exerciceCaseDiff = { id: 'exo-case', name: 'développé couché barre' }

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([exerciceCaseDiff]) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]), fetchCount: jest.fn().mockResolvedValue(0) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      // Ne doit pas crasher — la correspondance lowercase trouve l'exercice
      await expect(importGeneratedPlan({
        name: 'Plan Test Casse',
        sessions: [{
          name: 'Séance Test',
          exercises: [{ exerciseName: 'Développé Couché Barre', setsTarget: 3, repsTarget: '8', weightTarget: 60 }],
        }],
      })).resolves.toBeDefined()
    })
  })

  describe('importGeneratedSession', () => {
    const mockBatch = jest.fn().mockResolvedValue(undefined)

    const genSession = {
      name: 'Push IA',
      exercises: [
        { exerciseName: 'Développé Couché Barre', setsTarget: 3, repsTarget: '8-10', weightTarget: 60 },
        { exerciseName: 'Exercice Custom Nouveau', setsTarget: 2, repsTarget: '12', weightTarget: 0 },
      ],
    }

    beforeEach(() => {
      mockBatch.mockClear()
      ;(database as unknown as { batch: jest.Mock }).batch = mockBatch
      ;(database as unknown as { write: jest.Mock }).write = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb())
    })

    afterEach(() => {
      mockGet.mockReset()
    })

    it('importe une séance dans un programme existant en un seul batch', async () => {
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          name: '',
          isCustom: false,
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        return record
      })

      const mockProgram = { id: 'prog-1', name: 'Mon Programme' }
      const mockExercise = { id: 'exo1', name: 'Développé Couché Barre' }

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockExercise]) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return { find: jest.fn().mockResolvedValue(mockProgram) }
        }
        if (table === 'sessions') {
          return {
            query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(2) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      const result = await importGeneratedSession(genSession, 'prog-1')

      expect(mockBatch).toHaveBeenCalledTimes(1)
      expect(result).toBeDefined()
    })

    it('crée les exercices custom introuvables en DB lors de l\'import de séance', async () => {
      const createdRecords: Record<string, unknown>[] = []
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          name: '',
          isCustom: false,
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        createdRecords.push(record)
        return record
      })

      const mockProgram = { id: 'prog-1' }

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return { find: jest.fn().mockResolvedValue(mockProgram) }
        }
        if (table === 'sessions') {
          return {
            query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      await importGeneratedSession(genSession, 'prog-1')

      // Des exercices custom doivent avoir été créés
      const customExercises = createdRecords.filter(r => r.isCustom === true)
      expect(customExercises.length).toBeGreaterThan(0)
    })

    it('positionne la séance après les séances existantes (sessionCount)', async () => {
      const capturedSessions: Record<string, unknown>[] = []
      const mockPrepareCreate = jest.fn().mockImplementation(cb => {
        const record: Record<string, unknown> = {
          id: 'new-id',
          name: '',
          position: -1,
          isCustom: false,
          program: { set: jest.fn() },
          session: { set: jest.fn() },
          exercise: { set: jest.fn() },
        }
        cb(record)
        capturedSessions.push(record)
        return record
      })

      const mockProgram = { id: 'prog-1' }
      const mockExercise = { id: 'exo1', name: 'Développé Couché Barre' }
      const EXISTING_SESSION_COUNT = 3

      mockGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockExercise]) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        if (table === 'programs') {
          return { find: jest.fn().mockResolvedValue(mockProgram) }
        }
        if (table === 'sessions') {
          return {
            query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(EXISTING_SESSION_COUNT) }),
            prepareCreate: mockPrepareCreate,
          }
        }
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
          prepareCreate: mockPrepareCreate,
        }
      })

      await importGeneratedSession(
        { name: 'Séance Simple', exercises: [{ exerciseName: 'Développé Couché Barre', setsTarget: 3, repsTarget: '8', weightTarget: 60 }] },
        'prog-1'
      )

      // La première session créée doit avoir position = EXISTING_SESSION_COUNT
      const sessionRecord = capturedSessions.find(r => r.name === 'Séance Simple')
      expect(sessionRecord?.position).toBe(EXISTING_SESSION_COUNT)
    })
  })

  describe('markOnboardingCompleted', () => {
    afterEach(() => {
      mockGet.mockReset()
    })

    it('met onboardingCompleted à true pour le premier utilisateur', async () => {
      const mockUpdate = jest.fn().mockImplementation(cb => {
        const user: Record<string, unknown> = { onboardingCompleted: false }
        cb(user)
        return Promise.resolve(user)
      })
      const mockUser = { onboardingCompleted: false, update: mockUpdate }

      const mockWrite = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb())
      ;(database as unknown as { write: jest.Mock }).write = mockWrite

      mockGet.mockImplementation(() => ({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockUser]) }),
      }))

      await markOnboardingCompleted()

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      // Vérifie que le callback a bien setté onboardingCompleted = true
      const callbackArg = mockUpdate.mock.calls[0][0]
      const fakeUser: Record<string, unknown> = {}
      callbackArg(fakeUser)
      expect(fakeUser.onboardingCompleted).toBe(true)
    })

    it('ne plante pas si aucun utilisateur en DB', async () => {
      const mockWrite = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb())
      ;(database as unknown as { write: jest.Mock }).write = mockWrite

      mockGet.mockImplementation(() => ({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
      }))

      await expect(markOnboardingCompleted()).resolves.toBeUndefined()
    })
  })
})
