/**
 * Tests for exerciseStatsUtils.ts — buildRecapExercises (lines 196-230)
 */
import { buildRecapExercises } from '../exerciseStatsUtils'
import { database } from '../../index'
import { mockSessionExercise } from './testFactories'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
  },
}))

const mockGet = database.get as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

function makeSE(id: string, setsTarget: number) {
  return mockSessionExercise({
    id,
    setsTarget,
    exercise: {
      id: `exo-${id}`,
      fetch: jest.fn().mockResolvedValue({
        id: `exo-${id}`,
        name: `Exercise ${id}`,
        muscles: ['Pecs'],
      }),
    },
  })
}

describe('buildRecapExercises', () => {
  beforeEach(() => {
    // Mock getMaxWeightForExercise (called internally via database.get('sets').query)
    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    })
  })

  it('returns empty array when no sessionExercises', async () => {
    const result = await buildRecapExercises([], {}, 'h1')
    expect(result).toEqual([])
  })

  it('skips exercises with no validated sets', async () => {
    const se = makeSE('se1', 3)
    const result = await buildRecapExercises([se], {}, 'h1')
    expect(result).toEqual([])
  })

  it('builds recap for exercise with validated sets', async () => {
    const se = makeSE('se1', 3)
    const validatedSets = {
      'se1_1': { reps: 10, weight: 80, isPr: false },
      'se1_2': { reps: 8, weight: 90, isPr: false },
    }

    const result = await buildRecapExercises([se], validatedSets, 'h1')

    expect(result).toHaveLength(1)
    expect(result[0].exerciseName).toBe('Exercise se1')
    expect(result[0].setsValidated).toBe(2)
    expect(result[0].setsTarget).toBe(3)
    expect(result[0].currMaxWeight).toBe(90)
    expect(result[0].sets).toEqual([
      { reps: 10, weight: 80 },
      { reps: 8, weight: 90 },
    ])
    expect(result[0].muscles).toEqual(['Pecs'])
  })

  it('skips exercise when exercise.fetch returns null', async () => {
    const se = mockSessionExercise({
      id: 'se1',
      setsTarget: 2,
      exercise: { id: 'se1', fetch: jest.fn().mockResolvedValue(null) },
    })
    const validatedSets = {
      'se1_1': { reps: 10, weight: 80, isPr: false },
    }

    const result = await buildRecapExercises([se], validatedSets, 'h1')
    expect(result).toEqual([])
  })

  it('handles multiple exercises', async () => {
    const se1 = makeSE('se1', 2)
    const se2 = makeSE('se2', 2)
    const validatedSets = {
      'se1_1': { reps: 10, weight: 80, isPr: false },
      'se2_1': { reps: 8, weight: 60, isPr: false },
      'se2_2': { reps: 6, weight: 70, isPr: false },
    }

    const result = await buildRecapExercises([se1, se2], validatedSets, 'h1')
    expect(result).toHaveLength(2)
    expect(result[0].setsValidated).toBe(1)
    expect(result[1].setsValidated).toBe(2)
  })

  it('gets prevMaxWeight from getMaxWeightForExercise', async () => {
    // Mock to return sets with a max weight of 100
    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([{ weight: 100 }, { weight: 80 }]),
      }),
    })

    const se = makeSE('se1', 2)
    const validatedSets = { 'se1_1': { reps: 10, weight: 90, isPr: false } }

    const result = await buildRecapExercises([se], validatedSets, 'h1')
    expect(result[0].prevMaxWeight).toBe(100)
  })
})
