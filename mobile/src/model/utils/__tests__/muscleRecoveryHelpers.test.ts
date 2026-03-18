import { computeMuscleRecovery, getRecoveryColor } from '../muscleRecoveryHelpers'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

function makeSet(exerciseId: string, weight: number, reps: number, hoursAgo: number) {
  return {
    weight,
    reps,
    exerciseId,
    createdAt: new Date(Date.now() - hoursAgo * HOUR_MS),
  }
}

const exercises = [
  { id: 'ex1', muscles: ['Pecs', 'Triceps'] },
  { id: 'ex2', muscles: ['Dos', 'Biceps'] },
  { id: 'ex3', muscles: ['Quadriceps'] },
]

describe('computeMuscleRecovery', () => {
  it('retourne un tableau vide si aucune séance (aucun muscle sollicité)', () => {
    const result = computeMuscleRecovery([], exercises)
    expect(result).toEqual([])
  })

  it('récupération < 100% juste après entraînement', () => {
    // Sets il y a 1 heure → récupération très faible
    const sets = [
      makeSet('ex1', 100, 10, 1),
      makeSet('ex1', 100, 10, 1),
    ]
    const result = computeMuscleRecovery(sets, exercises)
    const pecs = result.find(e => e.muscle === 'Pecs')!
    expect(pecs).toBeDefined()
    expect(pecs.recoveryPercent).toBeLessThan(100)
    expect(pecs.status).not.toBe('fresh')
  })

  it('récupération augmente avec le temps', () => {
    // Même exercice, mais à des moments différents
    const setsRecent = [makeSet('ex3', 100, 10, 2)]
    const setsOld = [makeSet('ex3', 100, 10, 60)] // 60h = 2.5 jours

    const resultRecent = computeMuscleRecovery(setsRecent, exercises)
    const resultOld = computeMuscleRecovery(setsOld, exercises)

    const quadsRecent = resultRecent.find(e => e.muscle === 'Quadriceps')!
    const quadsOld = resultOld.find(e => e.muscle === 'Quadriceps')!

    expect(quadsOld.recoveryPercent).toBeGreaterThan(quadsRecent.recoveryPercent)
  })

  it('chaque muscle est indépendant', () => {
    // ex1 = Pecs + Triceps, ex3 = Quadriceps
    const sets = [
      makeSet('ex1', 100, 10, 1), // Pecs + Triceps fatigués
      makeSet('ex3', 100, 10, 60), // Quads presque récupérés
    ]
    const result = computeMuscleRecovery(sets, exercises)
    const pecs = result.find(e => e.muscle === 'Pecs')!
    const quads = result.find(e => e.muscle === 'Quadriceps')!

    expect(pecs.recoveryPercent).toBeLessThan(quads.recoveryPercent)
  })

  it('gère les exercices multi-muscles', () => {
    // ex1 cible Pecs + Triceps
    const sets = [makeSet('ex1', 100, 10, 1)]
    const result = computeMuscleRecovery(sets, exercises)

    const pecs = result.find(e => e.muscle === 'Pecs')
    const triceps = result.find(e => e.muscle === 'Triceps')
    expect(pecs).toBeDefined()
    expect(triceps).toBeDefined()
    expect(pecs!.recoveryPercent).toBeLessThan(100)
    expect(triceps!.recoveryPercent).toBeLessThan(100)
  })

  it('ignore les sets de plus de 7 jours', () => {
    const sets = [makeSet('ex1', 100, 10, 200)] // 200h > 7 jours
    const result = computeMuscleRecovery(sets, exercises)
    // Pas d'entrée car les sets sont trop anciens
    expect(result).toEqual([])
  })
})

describe('getRecoveryColor', () => {
  const mockColors = {
    primary: '#007AFF',
    danger: '#FF3B30',
  } as any

  it('retourne la couleur correcte par statut', () => {
    expect(getRecoveryColor('fresh', mockColors)).toBe('#007AFF')
    expect(getRecoveryColor('recovered', mockColors)).toBe('#10B981')
    expect(getRecoveryColor('recovering', mockColors)).toBe('#F59E0B')
    expect(getRecoveryColor('fatigued', mockColors)).toBe('#FF3B30')
  })
})
