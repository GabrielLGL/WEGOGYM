import { computeTrainingDensity, formatDensity } from '../trainingDensityHelpers'

describe('computeTrainingDensity', () => {
  it('retourne 0 si aucun set', () => {
    const result = computeTrainingDensity([], Date.now() - 60000)
    expect(result.totalVolume).toBe(0)
    expect(result.currentDensity).toBe(0)
  })

  it('densité = totalVolume / elapsedMinutes', () => {
    const sets = [{ weight: 100, reps: 10 }] // volume = 1000
    // 10 minutes ago
    const startTime = Date.now() - 10 * 60000
    const result = computeTrainingDensity(sets, startTime)
    expect(result.totalVolume).toBe(1000)
    // ≈ 100 kg/min (10 min elapsed)
    expect(result.currentDensity).toBeCloseTo(100, -1)
    expect(result.elapsedMinutes).toBeCloseTo(10, 0)
  })

  it('elapsedMinutes minimum 1', () => {
    const sets = [{ weight: 100, reps: 10 }]
    // Start dans le futur → elapsed serait négatif → clamp à 1
    const result = computeTrainingDensity(sets, Date.now() + 60000)
    expect(result.elapsedMinutes).toBe(1)
  })

  it('comparison faster quand densité actuelle > 10% de la précédente', () => {
    const currentSets = [{ weight: 100, reps: 10 }] // 1000
    const previousSets = [{ weight: 50, reps: 10 }] // 500
    // Même durée → current density ≈ double de previous
    const startTime = Date.now() - 10 * 60000
    const result = computeTrainingDensity(currentSets, startTime, previousSets, 10)
    expect(result.comparison).toBe('faster')
  })

  it('comparison slower quand densité actuelle < -10% de la précédente', () => {
    const currentSets = [{ weight: 50, reps: 10 }] // 500
    const previousSets = [{ weight: 100, reps: 10 }] // 1000
    const startTime = Date.now() - 10 * 60000
    const result = computeTrainingDensity(currentSets, startTime, previousSets, 10)
    expect(result.comparison).toBe('slower')
  })

  it('comparison similar quand densités proches', () => {
    const currentSets = [{ weight: 100, reps: 10 }] // 1000
    const previousSets = [{ weight: 100, reps: 10 }] // 1000
    const startTime = Date.now() - 10 * 60000
    const result = computeTrainingDensity(currentSets, startTime, previousSets, 10)
    expect(result.comparison).toBe('similar')
  })

  it('comparison null sans données précédentes', () => {
    const result = computeTrainingDensity([{ weight: 100, reps: 10 }], Date.now() - 60000)
    expect(result.comparison).toBeNull()
    expect(result.previousDensity).toBeNull()
  })
})

describe('formatDensity', () => {
  it('retourne "X kg/min"', () => {
    expect(formatDensity(123.7)).toBe('124 kg/min')
    expect(formatDensity(0)).toBe('0 kg/min')
  })
})
