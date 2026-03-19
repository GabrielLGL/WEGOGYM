import { computeVolumeDistribution } from '../volumeDistributionHelpers'
import { mockSet, mockExercise } from './testFactories'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet_(
  exerciseId: string,
  weight: number,
  reps: number,
  daysAgo = 0,
) {
  return mockSet({
    id: `set-${Math.random()}`,
    exerciseId,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  })
}

function makeExercise_(id: string, muscles: string[]) {
  return mockExercise({ id, muscles })
}

describe('computeVolumeDistribution', () => {
  it('retourne résultat vide si aucun set', () => {
    const result = computeVolumeDistribution([], [], null)
    expect(result.entries).toEqual([])
    expect(result.totalVolume).toBe(0)
    expect(result.dominantMuscle).toBeNull()
    expect(result.weakestMuscle).toBeNull()
  })

  it('retourne résultat vide si volume <= 0', () => {
    const sets = [makeSet_('ex1', 0, 10)]
    const exercises = [makeExercise_('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.entries).toEqual([])
    expect(result.totalVolume).toBe(0)
  })

  it('calcule la distribution correcte par muscle', () => {
    const sets = [
      makeSet_('ex1', 100, 10), // 1000
      makeSet_('ex2', 50, 10),  // 500
    ]
    const exercises = [
      makeExercise_('ex1', ['Pectoraux']),
      makeExercise_('ex2', ['Dos']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.totalVolume).toBe(1500)
    expect(result.entries).toHaveLength(2)
    expect(result.dominantMuscle).toBe('Pectoraux')
    expect(result.weakestMuscle).toBe('Dos')
  })

  it('les pourcentages somment à ~100%', () => {
    const sets = [
      makeSet_('ex1', 100, 10),
      makeSet_('ex2', 50, 10),
      makeSet_('ex3', 80, 5),
    ]
    const exercises = [
      makeExercise_('ex1', ['Pectoraux']),
      makeExercise_('ex2', ['Dos']),
      makeExercise_('ex3', ['Épaules']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    const totalPct = result.entries.reduce((s, e) => s + e.percentage, 0)
    // Arrondi peut causer ±1
    expect(totalPct).toBeGreaterThanOrEqual(99)
    expect(totalPct).toBeLessThanOrEqual(101)
  })

  it('répartit le volume pour exercices multi-muscles', () => {
    const sets = [makeSet_('ex1', 100, 10)] // volume = 1000
    const exercises = [makeExercise_('ex1', ['Pectoraux', 'Triceps'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.totalVolume).toBe(1000)
    // 500 par muscle
    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].volume).toBe(500)
    expect(result.entries[1].volume).toBe(500)
  })

  it('filtre par période', () => {
    const sets = [
      makeSet_('ex1', 100, 10, 10), // 10 jours → dans les 30j
      makeSet_('ex1', 100, 10, 60), // 60 jours → hors 30j
    ]
    const exercises = [makeExercise_('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, 30)
    expect(result.totalVolume).toBe(1000) // seulement le set récent
  })

  it('ignore les sets sans exercice correspondant', () => {
    const sets = [makeSet_('unknown', 100, 10)]
    const exercises = [makeExercise_('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.entries).toEqual([])
    expect(result.totalVolume).toBe(0)
  })

  it('calcule un balanceScore', () => {
    const sets = [
      makeSet_('ex1', 100, 10),
      makeSet_('ex2', 100, 10),
    ]
    const exercises = [
      makeExercise_('ex1', ['Pectoraux']),
      makeExercise_('ex2', ['Dos']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    // Parfaitement équilibré → score élevé
    expect(result.balanceScore).toBeGreaterThanOrEqual(90)
  })
})
