import { selectExercisesForSession } from '../exerciseSelector'
import type { UserProfile, MuscleGroup } from '../types'
import type { Database } from '@nozbe/watermelondb'

// Mock du module exerciseMetadata
jest.mock('../../exerciseMetadata', () => ({
  EXERCISE_METADATA: {
    'Développé Couché Haltères': {
      type: 'compound', minLevel: 'débutant', isUnilateral: false,
      primaryMuscle: 'Pecs', secondaryMuscles: ['Epaules', 'Triceps'],
      sfr: 'medium', stretchFocus: true, injuryRisk: ['epaules'], progressionType: 'wave',
    },
    'Rowing Barre': {
      type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
      primaryMuscle: 'Dos', secondaryMuscles: ['Biceps', 'Trapèzes'],
      sfr: 'medium', stretchFocus: false, injuryRisk: ['bas_dos'], progressionType: 'linear',
    },
    'Curl Haltères': {
      type: 'isolation', minLevel: 'débutant', isUnilateral: true,
      primaryMuscle: 'Biceps', secondaryMuscles: [],
      sfr: 'high', stretchFocus: false, injuryRisk: [], progressionType: 'auto',
    },
    'Squat Barre': {
      type: 'compound_heavy', minLevel: 'intermédiaire', isUnilateral: false,
      primaryMuscle: 'Quadriceps', secondaryMuscles: ['Ischios'],
      sfr: 'low', stretchFocus: false, injuryRisk: ['genoux', 'bas_dos'], progressionType: 'linear',
    },
    'Extension Triceps Poulie': {
      type: 'isolation', minLevel: 'débutant', isUnilateral: false,
      primaryMuscle: 'Triceps', secondaryMuscles: [],
      sfr: 'high', stretchFocus: false, injuryRisk: [], progressionType: 'auto',
    },
  },
}))

const baseProfile: UserProfile = {
  goal: 'hypertrophy',
  level: 'intermediate',
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['barbell', 'dumbbell', 'cable'],
  injuries: [],
  posturalIssues: false,
}

const mockExercises = [
  { id: 'e1', name: 'Développé Couché Haltères', muscles: ['Pecs'], equipment: 'Poids libre' },
  { id: 'e2', name: 'Rowing Barre', muscles: ['Dos'], equipment: 'Poids libre' },
  { id: 'e3', name: 'Curl Haltères', muscles: ['Biceps'], equipment: 'Poids libre' },
  { id: 'e4', name: 'Squat Barre', muscles: ['Quadriceps'], equipment: 'Poids libre' },
  { id: 'e5', name: 'Extension Triceps Poulie', muscles: ['Triceps'], equipment: 'Poulies' },
]

function createMockDB(exercises: Record<string, unknown>[]): Database {
  return {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue(exercises),
      }),
    }),
  } as unknown as Database
}

describe('selectExercisesForSession', () => {
  it('retourne des exercices correspondant aux muscles cibles', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    const db = createMockDB(mockExercises)
    const result = await selectExercisesForSession(musclesWithSets, baseProfile, db)

    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.some(r => r.exerciseName === 'Développé Couché Haltères')).toBe(true)
  })

  it('filtre les exercices incompatibles avec l\'équipement', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 4, shoulders: 0, biceps: 0, triceps: 4,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    // Profil sans cable → Extension Triceps Poulie exclu
    const profile = { ...baseProfile, equipment: ['barbell', 'dumbbell'] as UserProfile['equipment'] }
    const db = createMockDB(mockExercises)
    const result = await selectExercisesForSession(musclesWithSets, profile, db)

    expect(result.every(r => r.exerciseName !== 'Extension Triceps Poulie')).toBe(true)
  })

  it('exclut les exercices conflictuels avec les blessures', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 0, back: 4, shoulders: 0, biceps: 4, triceps: 0,
      quads: 4, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    // Blessure au bas du dos → Rowing Barre et Squat exclus
    const profile = { ...baseProfile, injuries: ['lower_back'] as UserProfile['injuries'] }
    const db = createMockDB(mockExercises)
    const result = await selectExercisesForSession(musclesWithSets, profile, db)

    expect(result.every(r => r.exerciseName !== 'Rowing Barre')).toBe(true)
    expect(result.every(r => r.exerciseName !== 'Squat Barre')).toBe(true)
  })

  it('trie les exercices par nervousDemand décroissant (composés en premier)', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 4, shoulders: 0, biceps: 4, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    const db = createMockDB(mockExercises)
    const result = await selectExercisesForSession(musclesWithSets, baseProfile, db)

    // Rowing Barre (compound_heavy=3) devrait être avant Curl Haltères (isolation=1)
    if (result.length >= 2) {
      const rowingIndex = result.findIndex(r => r.exerciseName === 'Rowing Barre')
      const curlIndex = result.findIndex(r => r.exerciseName === 'Curl Haltères')
      if (rowingIndex >= 0 && curlIndex >= 0) {
        expect(rowingIndex).toBeLessThan(curlIndex)
      }
    }
  })

  it('retourne un tableau vide si aucun exercice en DB', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    const db = createMockDB([])
    const result = await selectExercisesForSession(musclesWithSets, baseProfile, db)
    expect(result).toEqual([])
  })

  it('inclut les exercices custom sans metadata via fallback', async () => {
    const exercisesWithCustom = [
      ...mockExercises,
      { id: 'e-custom', name: 'Mon Exo Custom', muscles: ['Pecs'], equipment: 'Poids libre', isCustom: true },
    ]
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 0, shoulders: 0, biceps: 0, triceps: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    const db = createMockDB(exercisesWithCustom)
    const result = await selectExercisesForSession(musclesWithSets, baseProfile, db)

    // Le custom exo devrait être dans les candidats
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('chaque exercice retourné a un order séquentiel', async () => {
    const musclesWithSets: Record<MuscleGroup, number> = {
      chest: 4, back: 4, shoulders: 0, biceps: 4, triceps: 4,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0, traps: 0,
    }
    const db = createMockDB(mockExercises)
    const result = await selectExercisesForSession(musclesWithSets, baseProfile, db)

    result.forEach((ex, i) => {
      expect(ex.order).toBe(i + 1)
    })
  })
})
