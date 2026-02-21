// Mock database avant les imports
jest.mock('../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

import { BASIC_EXERCISES, seedExercises } from '../seed'
import { database } from '../index'

describe('seed — BASIC_EXERCISES', () => {
  it('est un tableau non vide', () => {
    expect(Array.isArray(BASIC_EXERCISES)).toBe(true)
    expect(BASIC_EXERCISES.length).toBeGreaterThan(0)
  })

  it('contient au moins 40 exercices', () => {
    expect(BASIC_EXERCISES.length).toBeGreaterThanOrEqual(40)
  })

  it('chaque exercice a un name, muscles et equipment', () => {
    BASIC_EXERCISES.forEach(ex => {
      expect(typeof ex.name).toBe('string')
      expect(ex.name.length).toBeGreaterThan(0)
      expect(Array.isArray(ex.muscles)).toBe(true)
      expect(ex.muscles.length).toBeGreaterThan(0)
      expect(typeof ex.equipment).toBe('string')
    })
  })

  it('contient des exercices de pecs', () => {
    const pecs = BASIC_EXERCISES.filter(ex => ex.muscles.includes('Pecs'))
    expect(pecs.length).toBeGreaterThan(0)
  })

  it('contient des exercices de dos', () => {
    const dos = BASIC_EXERCISES.filter(ex => ex.muscles.includes('Dos'))
    expect(dos.length).toBeGreaterThan(0)
  })

  it('contient des exercices poids du corps', () => {
    const bodyweight = BASIC_EXERCISES.filter(ex => ex.equipment === 'Poids du corps')
    expect(bodyweight.length).toBeGreaterThan(0)
  })

  it('tous les exercices ont des noms uniques', () => {
    const names = BASIC_EXERCISES.map(ex => ex.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('contient le Développé Couché Barre', () => {
    const found = BASIC_EXERCISES.find(ex => ex.name === 'Développé Couché Barre')
    expect(found).toBeDefined()
    expect(found?.muscles).toContain('Pecs')
  })
})

describe('seed — seedExercises', () => {
  const mockGet = database.get as jest.Mock
  const mockWrite = database.write as jest.Mock
  const mockBatch = database.batch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockWrite.mockImplementation((fn: () => Promise<void>) => fn())
  })

  it('crée les exercices manquants et appelle database.batch', async () => {
    const mockPrepareCreate = jest.fn().mockImplementation((fn: (e: Record<string, unknown>) => void) => {
      const e: Record<string, unknown> = {}
      fn(e)
      return e
    })
    const mockFetchCount = jest.fn()
      .mockResolvedValueOnce(1)  // user count > 0 → pas de création user
      .mockResolvedValue(0)       // exercise count = 0 → tous à créer

    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({ fetchCount: mockFetchCount }),
      create: jest.fn(),
      prepareCreate: mockPrepareCreate,
    })

    await seedExercises()

    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockBatch).toHaveBeenCalledTimes(1)
    expect(mockPrepareCreate).toHaveBeenCalled()
  })

  it('ne crée pas les exercices déjà présents en DB', async () => {
    const mockPrepareCreate = jest.fn().mockReturnValue({})
    const mockFetchCount = jest.fn().mockResolvedValue(1)  // tout existe déjà

    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({ fetchCount: mockFetchCount }),
      create: jest.fn(),
      prepareCreate: mockPrepareCreate,
    })

    await seedExercises()

    expect(mockBatch).not.toHaveBeenCalled()
    expect(mockPrepareCreate).not.toHaveBeenCalled()
  })

  it("crée l'utilisateur si userCount est 0", async () => {
    const mockUsersCreate = jest.fn().mockImplementation((fn: (u: Record<string, unknown>) => void) => {
      const u: Record<string, unknown> = {}
      fn(u)
    })
    const mockUsers = {
      query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
      create: mockUsersCreate,
      prepareCreate: jest.fn().mockReturnValue({}),
    }
    const mockExercises = {
      query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
      create: jest.fn(),
      prepareCreate: jest.fn().mockReturnValue({}),
    }

    mockGet.mockImplementation((table: string) => {
      if (table === 'users') return mockUsers
      return mockExercises
    })

    await seedExercises()

    expect(mockUsersCreate).toHaveBeenCalledTimes(1)
  })

  it("ne crée pas l'utilisateur si userCount > 0", async () => {
    const mockUsersCreate = jest.fn()
    const mockUsers = {
      query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
      create: mockUsersCreate,
      prepareCreate: jest.fn().mockReturnValue({}),
    }
    const mockExercises = {
      query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
      create: jest.fn(),
      prepareCreate: jest.fn().mockReturnValue({}),
    }

    mockGet.mockImplementation((table: string) => {
      if (table === 'users') return mockUsers
      return mockExercises
    })

    await seedExercises()

    expect(mockUsersCreate).not.toHaveBeenCalled()
  })

  it('gère silencieusement une erreur DB sans throw', async () => {
    mockGet.mockImplementation(() => { throw new Error('DB error') })

    await expect(seedExercises()).resolves.toBeUndefined()
  })
})
