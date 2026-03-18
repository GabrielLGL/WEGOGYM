import { computeVolumeDistribution } from '../volumeDistributionHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(
  exerciseId: string,
  weight: number,
  reps: number,
  daysAgo = 0,
) {
  return {
    id: `set-${Math.random()}`,
    exerciseId,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  } as any
}

function makeExercise(id: string, muscles: string[]) {
  return { id, muscles } as any
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
    const sets = [makeSet('ex1', 0, 10)]
    const exercises = [makeExercise('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.entries).toEqual([])
    expect(result.totalVolume).toBe(0)
  })

  it('calcule la distribution correcte par muscle', () => {
    const sets = [
      makeSet('ex1', 100, 10), // 1000
      makeSet('ex2', 50, 10),  // 500
    ]
    const exercises = [
      makeExercise('ex1', ['Pectoraux']),
      makeExercise('ex2', ['Dos']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.totalVolume).toBe(1500)
    expect(result.entries).toHaveLength(2)
    expect(result.dominantMuscle).toBe('Pectoraux')
    expect(result.weakestMuscle).toBe('Dos')
  })

  it('les pourcentages somment à ~100%', () => {
    const sets = [
      makeSet('ex1', 100, 10),
      makeSet('ex2', 50, 10),
      makeSet('ex3', 80, 5),
    ]
    const exercises = [
      makeExercise('ex1', ['Pectoraux']),
      makeExercise('ex2', ['Dos']),
      makeExercise('ex3', ['Épaules']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    const totalPct = result.entries.reduce((s, e) => s + e.percentage, 0)
    // Arrondi peut causer ±1
    expect(totalPct).toBeGreaterThanOrEqual(99)
    expect(totalPct).toBeLessThanOrEqual(101)
  })

  it('répartit le volume pour exercices multi-muscles', () => {
    const sets = [makeSet('ex1', 100, 10)] // volume = 1000
    const exercises = [makeExercise('ex1', ['Pectoraux', 'Triceps'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.totalVolume).toBe(1000)
    // 500 par muscle
    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].volume).toBe(500)
    expect(result.entries[1].volume).toBe(500)
  })

  it('filtre par période', () => {
    const sets = [
      makeSet('ex1', 100, 10, 10), // 10 jours → dans les 30j
      makeSet('ex1', 100, 10, 60), // 60 jours → hors 30j
    ]
    const exercises = [makeExercise('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, 30)
    expect(result.totalVolume).toBe(1000) // seulement le set récent
  })

  it('ignore les sets sans exercice correspondant', () => {
    const sets = [makeSet('unknown', 100, 10)]
    const exercises = [makeExercise('ex1', ['Pectoraux'])]
    const result = computeVolumeDistribution(sets, exercises, null)
    expect(result.entries).toEqual([])
    expect(result.totalVolume).toBe(0)
  })

  it('calcule un balanceScore', () => {
    const sets = [
      makeSet('ex1', 100, 10),
      makeSet('ex2', 100, 10),
    ]
    const exercises = [
      makeExercise('ex1', ['Pectoraux']),
      makeExercise('ex2', ['Dos']),
    ]
    const result = computeVolumeDistribution(sets, exercises, null)
    // Parfaitement équilibré → score élevé
    expect(result.balanceScore).toBeGreaterThanOrEqual(90)
  })
})
