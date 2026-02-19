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
