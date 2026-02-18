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
