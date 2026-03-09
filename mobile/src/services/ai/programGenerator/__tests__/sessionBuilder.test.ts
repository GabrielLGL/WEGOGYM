import { buildSession } from '../sessionBuilder'
import { PARAMS_TABLE, MAX_TOTAL_SETS_PER_SESSION } from '../tables'
import type { UserProfile, MuscleGroup, PGSessionExercise } from '../types'
import type { Database } from '@nozbe/watermelondb'

import { selectExercisesForSession } from '../exerciseSelector'

// Mock exerciseSelector pour isoler sessionBuilder
jest.mock('../exerciseSelector', () => ({
  selectExercisesForSession: jest.fn(),
}))

const mockSelectExercises = selectExercisesForSession as jest.MockedFunction<typeof selectExercisesForSession>

const baseProfile: UserProfile = {
  goal: 'hypertrophy',
  level: 'intermediate',
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['barbell', 'dumbbell'],
  injuries: [],
  posturalIssues: false,
}

const mockDB = {} as Database

const mockRawExercises: Omit<PGSessionExercise, 'params'>[] = [
  { exerciseId: 'e1', exerciseName: 'Développé Couché', musclesPrimary: ['chest'], order: 1 },
  { exerciseId: 'e2', exerciseName: 'Écarté Poulie', musclesPrimary: ['chest'], order: 2 },
  { exerciseId: 'e3', exerciseName: 'Élévations latérales', musclesPrimary: ['shoulders'], order: 3 },
  { exerciseId: 'e4', exerciseName: 'Extension Triceps', musclesPrimary: ['triceps'], order: 4 },
]

describe('buildSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSelectExercises.mockResolvedValue(mockRawExercises)
  })

  it('construit une PGGeneratedSession valide', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 3, biceps: 0, triceps: 3,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(0, musclesWithSets, baseProfile, mockDB, 'push_pull_legs')

    expect(session.dayOfWeek).toBe(1)
    expect(session.sessionType).toBe('push_pull_legs')
    expect(session.exercises.length).toBeGreaterThan(0)
    expect(session.totalSets).toBeGreaterThan(0)
    expect(session.estimatedMinutes).toBeGreaterThanOrEqual(0)
    expect(session.musclesTargeted.length).toBeGreaterThan(0)
  })

  it('totalSets ≤ MAX_TOTAL_SETS_PER_SESSION', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 8, back: 0, shoulders: 8, biceps: 0, triceps: 8,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(0, musclesWithSets, baseProfile, mockDB, 'push_pull_legs')

    expect(session.totalSets).toBeLessThanOrEqual(MAX_TOTAL_SETS_PER_SESSION)
  })

  it('chaque exercice a des params avec les bonnes valeurs selon le goal', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(0, musclesWithSets, baseProfile, mockDB, 'full_body')
    const params = PARAMS_TABLE.hypertrophy

    for (const ex of session.exercises) {
      expect(ex.params.repsMin).toBe(params.repsMin)
      expect(ex.params.repsMax).toBe(params.repsMax)
      expect(ex.params.rir).toBe(params.rir)
      expect(ex.params.tempoEccentric).toBe(params.tempoEcc)
    }
  })

  it('dayOfWeek est basé sur dayIndex + 1', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(4, musclesWithSets, baseProfile, mockDB, 'full_body')
    expect(session.dayOfWeek).toBe(5)
  })

  it('retourne une session vide si aucun exercice sélectionné', async () => {
    mockSelectExercises.mockResolvedValue([])

    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(0, musclesWithSets, baseProfile, mockDB, 'full_body')
    expect(session.exercises).toHaveLength(0)
    expect(session.totalSets).toBe(0)
  })

  it('strength goal → utilise les params strength', async () => {
    const strengthProfile = { ...baseProfile, goal: 'strength' as const }
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }

    const session = await buildSession(0, musclesWithSets, strengthProfile, mockDB, 'full_body')
    const params = PARAMS_TABLE.strength

    for (const ex of session.exercises) {
      expect(ex.params.repsMin).toBe(params.repsMin)
      expect(ex.params.repsMax).toBe(params.repsMax)
    }
  })
})
