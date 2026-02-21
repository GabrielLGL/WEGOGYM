// Mock WatermelonDB AVANT les imports — évite l'initialisation de SQLiteAdapter (JSI)
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

import Exercise from '../Exercise'
import History from '../History'
import PerformanceLog from '../PerformanceLog'
import Program from '../Program'
import Session from '../Session'
import SessionExercise from '../SessionExercise'
import Set from '../Set'
import User from '../User'

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
      sessions = [] as Array<{ id: string; name: string; position: number }>,
      sessionExercises = [] as Array<{
        position: number
        setsTarget: number
        repsTarget: string
        weightTarget: number
        exercise: { fetch: jest.Mock }
      }>,
    } = {}) => {
      const mockCreate = jest.fn().mockImplementation(
        async (fn: (r: Record<string, unknown>) => void) => {
          const record: Record<string, unknown> = {
            id: 'new-id',
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
        get: jest.fn().mockImplementation((table: string) => {
          if (table === 'programs') {
            return {
              query: jest.fn().mockReturnValue({
                fetchCount: jest.fn().mockResolvedValue(programCount),
              }),
              create: mockCreate,
            }
          }
          if (table === 'sessions') {
            return { create: mockCreate }
          }
          if (table === 'session_exercises') {
            return {
              query: jest.fn().mockReturnValue({
                fetch: jest.fn().mockResolvedValue(sessionExercises),
              }),
              create: mockCreate,
            }
          }
          return { create: mockCreate }
        }),
      }

      return { mockDB, mockCreate }
    }

    it('crée un nouveau programme nommé "[Nom] (Copie)" à la position courante', async () => {
      const { mockDB, mockCreate } = buildMockDB({ programCount: 3 })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue([]),
      }

      await program.duplicate()

      expect(mockDB.write).toHaveBeenCalledTimes(1)
      // Only 1 create: the new program (no sessions)
      expect(mockCreate).toHaveBeenCalledTimes(1)
      const createCallback = mockCreate.mock.calls[0][0]
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
      const { mockDB, mockCreate } = buildMockDB({ sessions: mockSessions })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 2 sessions = 3 creates (no session_exercises mock returned)
      expect(mockCreate).toHaveBeenCalledTimes(3)
    })

    it('duplique les exercices de chaque session', async () => {
      const mockExercise = { id: 'ex-1' }
      const mockSE = {
        position: 0,
        setsTarget: 3,
        repsTarget: '10',
        weightTarget: 60,
        exercise: { fetch: jest.fn().mockResolvedValue(mockExercise) },
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]
      const { mockDB, mockCreate } = buildMockDB({
        sessions: mockSessions,
        sessionExercises: [mockSE],
      })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 1 session + 1 session_exercise = 3 creates
      expect(mockCreate).toHaveBeenCalledTimes(3)
    })

    it("n'inclut pas un session_exercise si exercise.fetch retourne null", async () => {
      const mockSENull = {
        position: 0,
        setsTarget: 3,
        repsTarget: '10',
        weightTarget: 60,
        exercise: { fetch: jest.fn().mockResolvedValue(null) },
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]
      const { mockDB, mockCreate } = buildMockDB({
        sessions: mockSessions,
        sessionExercises: [mockSENull],
      })

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'PPL'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // 1 program + 1 session = 2 creates (no session_exercise because exercise is null)
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('copie correctement les champs setsTarget, repsTarget, weightTarget', async () => {
      const mockExercise = { id: 'ex-1' }
      const mockSE = {
        position: 2,
        setsTarget: 4,
        repsTarget: '8-12',
        weightTarget: 80,
        exercise: { fetch: jest.fn().mockResolvedValue(mockExercise) },
      }
      const mockSessions = [{ id: 'sess-1', name: 'Push', position: 0 }]

      let seCreateCallback: ((r: Record<string, unknown>) => void) | null = null
      const mockCreate = jest.fn().mockImplementation(
        async (fn: (r: Record<string, unknown>) => void) => {
          seCreateCallback = fn
          const record: Record<string, unknown> = {
            id: 'new-id',
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
        get: jest.fn().mockImplementation((table: string) => {
          if (table === 'programs') {
            return {
              query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(1) }),
              create: mockCreate,
            }
          }
          if (table === 'sessions') return { create: mockCreate }
          if (table === 'session_exercises') {
            return {
              query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockSE]) }),
              create: mockCreate,
            }
          }
          return { create: mockCreate }
        }),
      }

      const program = Object.create(Program.prototype) as Program
      ;(program as unknown as Record<string, unknown>).name = 'Test'
      ;(program as unknown as Record<string, unknown>).database = mockDB
      ;(program as unknown as Record<string, unknown>).sessions = {
        fetch: jest.fn().mockResolvedValue(mockSessions),
      }

      await program.duplicate()

      // The last create call should be for the session_exercise
      const lastCallRecord: Record<string, unknown> = {
        session: { set: jest.fn() },
        exercise: { set: jest.fn() },
      }
      if (seCreateCallback) (seCreateCallback as (r: Record<string, unknown>) => void)(lastCallRecord)
      expect(lastCallRecord.position).toBe(2)
      expect(lastCallRecord.setsTarget).toBe(4)
      expect(lastCallRecord.repsTarget).toBe('8-12')
      expect(lastCallRecord.weightTarget).toBe(80)
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
