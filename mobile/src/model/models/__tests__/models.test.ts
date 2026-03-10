// Mock WatermelonDB AVANT les imports — évite l'initialisation de SQLiteAdapter (JSI)
import Exercise from '../Exercise'
import History from '../History'
import PerformanceLog from '../PerformanceLog'
import Program from '../Program'
import Session from '../Session'
import SessionExercise from '../SessionExercise'
import Set from '../Set'
import User from '../User'

jest.mock('@nozbe/watermelondb', () => ({
  Model: class Model {
    static table = ''
    static associations: Record<string, unknown> = {}
    id = ''
    collections = {
      get: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
      }),
    }
    database = {
      write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => { await fn() }),
      batch: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(0) }),
        create: jest.fn().mockResolvedValue({}),
      }),
    }
    prepareDestroyPermanently = jest.fn().mockReturnValue({})
    destroyPermanently = jest.fn().mockResolvedValue(undefined)
    prepareUpdate = jest.fn()
    update = jest.fn()
    observe = jest.fn()
  },
  Q: {
    where: jest.fn(),
    sortBy: jest.fn(),
    oneOf: jest.fn().mockImplementation((values: string[]) => values),
    asc: 'asc',
    desc: 'desc',
  },
  Query: class Query {},
  Relation: class Relation {},
}))

jest.mock('@nozbe/watermelondb/decorators', () => ({
  field: () => () => {},
  text: () => () => {},
  date: () => () => {},
  readonly: () => () => {},
  relation: () => () => {},
  children: () => () => {},
}))

// --- Exercise ---

describe('Exercise', () => {
  describe('table et associations', () => {
    it('a la table "exercises"', () => {
      expect(Exercise.table).toBe('exercises')
    })

    it('a une association has_many vers session_exercises', () => {
      expect(Exercise.associations.session_exercises).toEqual({
        type: 'has_many',
        foreignKey: 'exercise_id',
      })
    })

    it('a une association has_many vers performance_logs', () => {
      expect(Exercise.associations.performance_logs).toEqual({
        type: 'has_many',
        foreignKey: 'exercise_id',
      })
    })

    it('a une association has_many vers sets', () => {
      expect(Exercise.associations.sets).toEqual({
        type: 'has_many',
        foreignKey: 'exercise_id',
      })
    })
  })

  describe('getter muscles', () => {
    it('retourne un tableau vide quand _muscles est vide', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      ;(exercise as unknown as { _muscles: string })._muscles = ''
      expect(exercise.muscles).toEqual([])
    })

    it('parse correctement un JSON valide', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      ;(exercise as unknown as { _muscles: string })._muscles = '["Pecs","Triceps"]'
      expect(exercise.muscles).toEqual(['Pecs', 'Triceps'])
    })

    it('retourne un tableau vide pour un JSON malformé', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      ;(exercise as unknown as { _muscles: string })._muscles = 'invalid-json'
      expect(exercise.muscles).toEqual([])
    })

    it('retourne un tableau vide quand _muscles est undefined', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      ;(exercise as unknown as { _muscles: string | undefined })._muscles = undefined
      expect(exercise.muscles).toEqual([])
    })
  })

  describe('setter muscles', () => {
    it('sérialise un tableau en JSON dans _muscles', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      exercise.muscles = ['Dos', 'Biceps']
      expect((exercise as unknown as { _muscles: string })._muscles).toBe('["Dos","Biceps"]')
    })

    it('sérialise un tableau vide', () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      exercise.muscles = []
      expect((exercise as unknown as { _muscles: string })._muscles).toBe('[]')
    })
  })

  describe('deleteAllAssociatedData', () => {
    it('supprime session_exercises, logs et l\'exercice en batch unique', async () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      const mockSe1 = { prepareDestroyPermanently: jest.fn().mockReturnValue('destroy-se-1') }
      const mockLog1 = { prepareDestroyPermanently: jest.fn().mockReturnValue('destroy-log-1') }
      const mockBatch = jest.fn()

      ;(exercise as unknown as Record<string, unknown>).id = 'ex-1'
      ;(exercise as unknown as Record<string, unknown>).collections = {
        get: jest.fn().mockImplementation((table: string) => ({
          query: jest.fn().mockReturnValue({
            fetch: jest.fn().mockResolvedValue(
              table === 'session_exercises' ? [mockSe1] : [mockLog1]
            ),
          }),
        })),
      }
      ;(exercise as unknown as Record<string, unknown>).database = {
        write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
        batch: mockBatch,
      }
      ;(exercise as unknown as Record<string, unknown>).prepareDestroyPermanently =
        jest.fn().mockReturnValue('destroy-self')

      await exercise.deleteAllAssociatedData()

      expect(mockBatch).toHaveBeenCalledTimes(1)
      const batchArgs = mockBatch.mock.calls[0]
      expect(batchArgs).toContain('destroy-se-1')
      expect(batchArgs).toContain('destroy-log-1')
      expect(batchArgs).toContain('destroy-self')
    })

    it("fonctionne quand il n'y a aucun lien (collections vides)", async () => {
      const exercise = Object.create(Exercise.prototype) as Exercise
      const mockBatch = jest.fn()

      ;(exercise as unknown as Record<string, unknown>).id = 'ex-2'
      ;(exercise as unknown as Record<string, unknown>).collections = {
        get: jest.fn().mockReturnValue({
          query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }),
        }),
      }
      ;(exercise as unknown as Record<string, unknown>).database = {
        write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
        batch: mockBatch,
      }
      ;(exercise as unknown as Record<string, unknown>).prepareDestroyPermanently =
        jest.fn().mockReturnValue('destroy-self')

      await exercise.deleteAllAssociatedData()

      expect(mockBatch).toHaveBeenCalledTimes(1)
      const batchArgs = mockBatch.mock.calls[0]
      expect(batchArgs).toHaveLength(1)
      expect(batchArgs).toContain('destroy-self')
    })
  })
})

// --- History ---

describe('History', () => {
  describe('table et associations', () => {
    it('a la table "histories"', () => {
      expect(History.table).toBe('histories')
    })

    it('a une association belongs_to vers sessions', () => {
      expect(History.associations.sessions).toEqual({
        type: 'belongs_to',
        key: 'session_id',
      })
    })

    it('a une association has_many vers sets', () => {
      expect(History.associations.sets).toEqual({
        type: 'has_many',
        foreignKey: 'history_id',
      })
    })
  })
})

// --- PerformanceLog ---

describe('PerformanceLog', () => {
  describe('table et associations', () => {
    it('a la table "performance_logs"', () => {
      expect(PerformanceLog.table).toBe('performance_logs')
    })

    it('a une association belongs_to vers exercises', () => {
      expect(PerformanceLog.associations.exercises).toEqual({
        type: 'belongs_to',
        key: 'exercise_id',
      })
    })
  })
})

// --- Program ---

describe('Program', () => {
  describe('table et associations', () => {
    it('a la table "programs"', () => {
      expect(Program.table).toBe('programs')
    })

    it('a une association has_many vers sessions', () => {
      expect(Program.associations.sessions).toEqual({
        type: 'has_many',
        foreignKey: 'program_id',
      })
    })
  })

  describe('duplicate', () => {
    const buildMockDB = ({
      programCount = 2,
      sessions = [] as { id: string; name: string; position: number }[],
      sessionExercises = [] as {
        position: number
        setsTarget: number
        repsTarget: string
        weightTarget: number
        exercise: { id: string }
        session: { id: string }
        supersetId: string | null
        supersetType: string | null
        supersetPosition: number | null
        setsTargetMax: number | null
        notes: string | null
        restTime: number | null
      }[],
      exercises = [] as { id: string }[],
    } = {}) => {
      const mockPrepareCreate = jest.fn().mockImplementation(
        (fn: (r: Record<string, unknown>) => void) => {
          const record: Record<string, unknown> = {
            id: `new-${Math.random().toString(36).slice(2, 6)}`,
            program: { set: jest.fn() },
            session: { set: jest.fn() },
            exercise: { set: jest.fn() },
          }
          fn(record)
          return record
        }
      )

      const mockBatch = jest.fn().mockResolvedValue(undefined)

      const mockDB = {
        write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
        batch: mockBatch,
        get: jest.fn().mockImplementation((table: string) => {
          if (table === 'programs') {
            return {
              query: jest.fn().mockReturnValue({
                fetchCount: jest.fn().mockResolvedValue(programCount),
              }),
              prepareCreate: mockPrepareCreate,
            }
          }
          if (table === 'sessions') {
            return { prepareCreate: mockPrepareCreate }
          }
          if (table === 'session_exercises') {
            return {
              query: jest.fn().mockReturnValue({
                fetch: jest.fn().mockResolvedValue(sessionExercises),
              }),
              prepareCreate: mockPrepareCreate,
            }
          }
          if (table === 'exercises') {
            return {
              query: jest.fn().mockReturnValue({
                fetch: jest.fn().mockResolvedValue(exercises),
              }),
            }
          }
          return { prepareCreate: mockPrepareCreate }
        }),
      }

      return { mockDB, mockPrepareCreate, mockBatch }
    }

    it('crée un nouveau programme nommé "[Nom] (Copie)" à la position courante', async () => {
      const { mockDB, mockPrepareCreate, mockBatch } = buildMockDB({ programCount: 3 })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue([]),
      }

      await program.duplicate()

      expect(mockDB.write).toHaveBeenCalledTimes(1)
      expect(mockBatch).toHaveBeenCalledTimes(1)
      // Only 1 prepareCreate: the new program (no sessions)
      expect(mockPrepareCreate).toHaveBeenCalledTimes(1)
      const createCallback = mockPrepareCreate.mock.calls[0][0]
      const captured: Record<string, unknown> = {}
      createCallback(captured)
      expect(captured.name).toBe('PPL (Copie)')
      expect(captured.position).toBe(3)
    })

    it('duplique les sessions du programme original', async () => {
      const mockSessions = [
        { id: 'sess-1', name: 'Push', position: 0 },
        { id: 'sess-2', name: 'Pull', position: 1 },
      ]
      const { mockDB, mockPrepareCreate } = buildMockDB({ sessions: mockSessions })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 2 sessions = 3 prepareCreates (no session_exercises)
      expect(mockPrepareCreate).toHaveBeenCalledTimes(3)
    })

    it('duplique les exercices de chaque session', async () => {
      const mockExercise = { id: 'ex-1' }
      const mockSE = {
        position: 0,
        setsTarget: 3,
        repsTarget: '10',
        weightTarget: 60,
        exercise: { id: 'ex-1' },
        session: { id: 'sess-1' },
        supersetId: null,
        supersetType: null,
        supersetPosition: null,
        setsTargetMax: null,
        notes: null,
        restTime: null,
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]
      const { mockDB, mockPrepareCreate } = buildMockDB({
        sessions: mockSessions,
        sessionExercises: [mockSE],
        exercises: [mockExercise],
      })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 1 session + 1 session_exercise = 3 prepareCreates
      expect(mockPrepareCreate).toHaveBeenCalledTimes(3)
    })

    it("n'inclut pas un session_exercise si exercise introuvable", async () => {
      const mockSE = {
        position: 0,
        setsTarget: 3,
        repsTarget: '10',
        weightTarget: 60,
        exercise: { id: 'ex-missing' },
        session: { id: 'sess-1' },
        supersetId: null,
        supersetType: null,
        supersetPosition: null,
        setsTargetMax: null,
        notes: null,
        restTime: null,
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]
      const { mockDB, mockPrepareCreate } = buildMockDB({
        sessions: mockSessions,
        sessionExercises: [mockSE],
        exercises: [], // exercise not found
      })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 1 session = 2 prepareCreates (no SE because exercise not found)
      expect(mockPrepareCreate).toHaveBeenCalledTimes(2)
    })

    it('copie correctement les champs setsTarget, repsTarget, weightTarget', async () => {
      const mockExercise = { id: 'ex-1' }
      const mockSE = {
        position: 2,
        setsTarget: 4,
        repsTarget: '8-12',
        weightTarget: 80,
        exercise: { id: 'ex-1' },
        session: { id: 'sess-1' },
        supersetId: null,
        supersetType: null,
        supersetPosition: null,
        setsTargetMax: null,
        notes: null,
        restTime: null,
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]

      const mockPrepareCreate = jest.fn().mockImplementation(
        (fn: (r: Record<string, unknown>) => void) => {
          const record: Record<string, unknown> = {
            id: `new-${Math.random().toString(36).slice(2, 6)}`,
            program: { set: jest.fn() },
            session: { set: jest.fn() },
            exercise: { set: jest.fn() },
          }
          fn(record)
          return record
        }
      )

      const mockDB = {
        write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
        batch: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockImplementation((table: string) => {
          if (table === 'programs') {
            return {
              query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
              prepareCreate: mockPrepareCreate,
            }
          }
          if (table === 'sessions') return { prepareCreate: mockPrepareCreate }
          if (table === 'session_exercises') {
            return {
              query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockSE]) }),
              prepareCreate: mockPrepareCreate,
            }
          }
          if (table === 'exercises') {
            return {
              query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockExercise]) }),
            }
          }
          return { prepareCreate: mockPrepareCreate }
        }),
      }

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'Test'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // The last prepareCreate call should be for the session_exercise
      const lastCallFn = mockPrepareCreate.mock.calls[2][0]
      const captured: Record<string, unknown> = {
        session: { set: jest.fn() },
        exercise: { set: jest.fn() },
      }
      lastCallFn(captured)
      expect(captured.position).toBe(2)
      expect(captured.setsTarget).toBe(4)
      expect(captured.repsTarget).toBe('8-12')
      expect(captured.weightTarget).toBe(80)
    })
  })
})

// --- Session ---

describe('Session', () => {
  describe('table et associations', () => {
    it('a la table "sessions"', () => {
      expect(Session.table).toBe('sessions')
    })

    it('a une association belongs_to vers programs', () => {
      expect(Session.associations.programs).toEqual({
        type: 'belongs_to',
        key: 'program_id',
      })
    })

    it('a une association has_many vers histories', () => {
      expect(Session.associations.histories).toEqual({
        type: 'has_many',
        foreignKey: 'session_id',
      })
    })

    it('a une association has_many vers session_exercises', () => {
      expect(Session.associations.session_exercises).toEqual({
        type: 'has_many',
        foreignKey: 'session_id',
      })
    })
  })
})

// --- SessionExercise ---

describe('SessionExercise', () => {
  describe('table et associations', () => {
    it('a la table "session_exercises"', () => {
      expect(SessionExercise.table).toBe('session_exercises')
    })

    it('a une association belongs_to vers sessions', () => {
      expect(SessionExercise.associations.sessions).toEqual({
        type: 'belongs_to',
        key: 'session_id',
      })
    })

    it('a une association belongs_to vers exercises', () => {
      expect(SessionExercise.associations.exercises).toEqual({
        type: 'belongs_to',
        key: 'exercise_id',
      })
    })
  })
})

// --- Set ---

describe('Set', () => {
  describe('table et associations', () => {
    it('a la table "sets"', () => {
      expect(Set.table).toBe('sets')
    })

    it('a une association belongs_to vers histories', () => {
      expect(Set.associations.histories).toEqual({
        type: 'belongs_to',
        key: 'history_id',
      })
    })

    it('a une association belongs_to vers exercises', () => {
      expect(Set.associations.exercises).toEqual({
        type: 'belongs_to',
        key: 'exercise_id',
      })
    })
  })
})

// --- User ---

describe('User', () => {
  describe('table', () => {
    it('a la table "users"', () => {
      expect(User.table).toBe('users')
    })

    it('n\'a pas d\'associations explicitement déclarées', () => {
      // User est un modèle singleton — aucune association propre définie
      // La classe hérite de Model qui initialise associations à {}
      const ownAssociations = Object.prototype.hasOwnProperty.call(User, 'associations')
      expect(ownAssociations).toBe(false)
    })
  })
})
