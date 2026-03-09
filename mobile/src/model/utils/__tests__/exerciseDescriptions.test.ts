/**
 * Tests for exerciseDescriptions.ts — EXERCISE_DESCRIPTIONS + seedExerciseDescriptions
 */

import { EXERCISE_DESCRIPTIONS, seedExerciseDescriptions } from '../exerciseDescriptions'
import { mockDatabase } from './testFactories'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

describe('EXERCISE_DESCRIPTIONS', () => {
  it('is a non-empty object', () => {
    expect(Object.keys(EXERCISE_DESCRIPTIONS).length).toBeGreaterThan(0)
  })

  it('each entry has animationKey and description strings', () => {
    for (const [_name, data] of Object.entries(EXERCISE_DESCRIPTIONS)) {
      expect(typeof data.animationKey).toBe('string')
      expect(data.animationKey.length).toBeGreaterThan(0)
      expect(typeof data.description).toBe('string')
      expect(data.description.length).toBeGreaterThan(0)
    }
  })

  it('has no duplicate animationKeys', () => {
    const keys = Object.values(EXERCISE_DESCRIPTIONS).map(d => d.animationKey)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('contains expected muscle groups', () => {
    const names = Object.keys(EXERCISE_DESCRIPTIONS)
    expect(names).toContain('Développé Couché Barre')
    expect(names).toContain('Tractions')
    expect(names).toContain('Squat Arrière')
    expect(names).toContain('Curl Haltères')
    expect(names).toContain('Crunch')
  })
})

describe('seedExerciseDescriptions', () => {
  it('returns 0 when no exercises match', async () => {
    const mockDb = mockDatabase()

    const count = await seedExerciseDescriptions(mockDb)
    expect(count).toBe(0)
    expect(mockDb.write).not.toHaveBeenCalled()
  })

  it('returns 0 when all exercises already have descriptions', async () => {
    const exercises = [
      { name: 'Développé Couché Barre', animationKey: 'bench_press_barbell', description: 'already set' },
      { name: 'Unknown Exercise', animationKey: '', description: '' },
    ]
    const mockDb = mockDatabase({
      get: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue(exercises),
        }),
      }),
    })

    const count = await seedExerciseDescriptions(mockDb)
    expect(count).toBe(0)
  })

  it('updates exercises missing animationKey or description', async () => {
    const updatedFields: Record<string, string>[] = []
    const exercises = [
      {
        name: 'Développé Couché Barre',
        animationKey: '',
        description: '',
        prepareUpdate: jest.fn((fn: (e: Record<string, string>) => void) => {
          const e = { animationKey: '', description: '' }
          fn(e)
          updatedFields.push(e)
          return 'update-op'
        }),
      },
    ]
    const mockDb = mockDatabase({
      get: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue(exercises),
        }),
      }),
    })

    const count = await seedExerciseDescriptions(mockDb)
    expect(count).toBe(1)
    expect(mockDb.write).toHaveBeenCalledTimes(1)
    expect(updatedFields[0].animationKey).toBe('bench_press_barbell')
    expect(updatedFields[0].description.length).toBeGreaterThan(0)
  })

  it('does not overwrite existing animationKey', async () => {
    const updatedFields: Record<string, string>[] = []
    const exercises = [
      {
        name: 'Tractions',
        animationKey: 'existing_key',
        description: '',
        prepareUpdate: jest.fn((fn: (e: Record<string, string>) => void) => {
          const e = { animationKey: 'existing_key', description: '' }
          fn(e)
          updatedFields.push(e)
          return 'update-op'
        }),
      },
    ]
    const mockDb = mockDatabase({
      get: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue(exercises),
        }),
      }),
    })

    await seedExerciseDescriptions(mockDb)
    // animationKey should NOT be overwritten
    expect(updatedFields[0].animationKey).toBe('existing_key')
  })
})
