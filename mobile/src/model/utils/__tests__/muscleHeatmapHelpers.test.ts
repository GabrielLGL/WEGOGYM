import { computeMuscleHeatmap } from '../muscleHeatmapHelpers'
import { MUSCLES_LIST } from '../../constants'

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000)

describe('computeMuscleHeatmap', () => {
  const exercises = [
    { id: 'ex1', muscles: ['Pecs', 'Triceps'] },
    { id: 'ex2', muscles: ['Dos', 'Biceps'] },
    { id: 'ex3', muscles: ['Quadriceps'] },
  ]

  it('retourne 11 entrées (tous les muscles de MUSCLES_LIST)', () => {
    const result = computeMuscleHeatmap([], exercises, 30)
    expect(result).toHaveLength(MUSCLES_LIST.length)
  })

  it('retourne tous les muscles avec volume=0 si aucun set', () => {
    const result = computeMuscleHeatmap([], exercises, 30)
    result.forEach(entry => {
      expect(entry.totalVolume).toBe(0)
      expect(entry.intensity).toBe(0)
      expect(entry.sessionCount).toBe(0)
    })
  })

  it('calcule le volume correctement (weight × reps)', () => {
    const sets = [
      { weight: 80, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(1) },
    ]
    const result = computeMuscleHeatmap(sets, exercises, 30)
    const pecs = result.find(e => e.muscle === 'Pecs')
    const triceps = result.find(e => e.muscle === 'Triceps')
    expect(pecs?.totalVolume).toBe(800)  // 80 × 10
    expect(triceps?.totalVolume).toBe(800)
  })

  it('le muscle le plus travaillé a intensity=1', () => {
    const sets = [
      { weight: 100, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(1) },
      { weight: 50, reps: 10, exerciseId: 'ex2', createdAt: daysAgo(1) },
    ]
    const result = computeMuscleHeatmap(sets, exercises, 30)
    const maxIntensity = Math.max(...result.map(e => e.intensity))
    expect(maxIntensity).toBe(1)
  })

  it('filtre les sets hors de la période', () => {
    const sets = [
      { weight: 100, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(10) },  // dans 7j : non
      { weight: 50, reps: 10, exerciseId: 'ex2', createdAt: daysAgo(2) },    // dans 7j : oui
    ]
    const result7 = computeMuscleHeatmap(sets, exercises, 7)
    const pecs7 = result7.find(e => e.muscle === 'Pecs')
    const dos7 = result7.find(e => e.muscle === 'Dos')
    expect(pecs7?.totalVolume).toBe(0)
    expect(dos7?.totalVolume).toBeGreaterThan(0)

    const result30 = computeMuscleHeatmap(sets, exercises, 30)
    const pecs30 = result30.find(e => e.muscle === 'Pecs')
    expect(pecs30?.totalVolume).toBeGreaterThan(0)
  })

  it('comptes les jours distincts (sessionCount)', () => {
    const sets = [
      { weight: 80, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(1) },
      { weight: 80, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(1) },  // même jour
      { weight: 80, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(3) },  // jour différent
    ]
    const result = computeMuscleHeatmap(sets, exercises, 30)
    const pecs = result.find(e => e.muscle === 'Pecs')
    expect(pecs?.sessionCount).toBe(2)  // 2 jours distincts
  })

  it('les muscles avec volume=0 sont en fin de liste', () => {
    const sets = [
      { weight: 100, reps: 10, exerciseId: 'ex3', createdAt: daysAgo(1) },
    ]
    const result = computeMuscleHeatmap(sets, exercises, 30)
    const lastEntry = result[result.length - 1]
    expect(lastEntry.totalVolume).toBe(0)

    const firstEntry = result[0]
    expect(firstEntry.totalVolume).toBeGreaterThan(0)
  })

  it('supporte les timestamps numériques (Date.getTime())', () => {
    const sets = [
      { weight: 80, reps: 10, exerciseId: 'ex1', createdAt: daysAgo(1).getTime() },
    ]
    const result = computeMuscleHeatmap(sets, exercises, 30)
    const pecs = result.find(e => e.muscle === 'Pecs')
    expect(pecs?.totalVolume).toBe(800)
  })
})
