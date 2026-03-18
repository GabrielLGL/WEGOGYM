import { computeMotivation } from '../motivationHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(daysAgo: number) {
  return {
    startTime: new Date(Date.now() - daysAgo * DAY_MS),
  } as any
}

describe('computeMotivation', () => {
  it('retourne null si moins de 3 séances', () => {
    expect(computeMotivation([])).toBeNull()
    expect(computeMotivation([makeHistory(1)])).toBeNull()
    expect(computeMotivation([makeHistory(1), makeHistory(3)])).toBeNull()
  })

  it('retourne null si séances très récentes (pas de retard)', () => {
    // 3 séances tous les 3 jours, dernière hier → pas de retard
    const histories = [makeHistory(1), makeHistory(4), makeHistory(7)]
    const result = computeMotivation(histories)
    // daysSince=1, avg=3 → 1 < 3 → null
    expect(result).toBeNull()
  })

  it('détecte returning_after_long si absence > 2x la moyenne', () => {
    // Séances tous les 3 jours en moyenne, mais dernière il y a 10 jours
    const histories = [makeHistory(10), makeHistory(13), makeHistory(16), makeHistory(19)]
    const result = computeMotivation(histories)
    // avg=3, daysSince=10, 10 >= 3*2=6 → returning_after_long
    expect(result).not.toBeNull()
    expect(result!.context).toBe('returning_after_long')
  })

  it('détecte slight_drop si absence entre 1.5x et 2x la moyenne', () => {
    // avg=4 jours, dernière il y a 7 jours → 7 >= 4*1.5=6, 7 < 4*2=8
    const histories = [makeHistory(7), makeHistory(11), makeHistory(15), makeHistory(19)]
    const result = computeMotivation(histories)
    expect(result).not.toBeNull()
    expect(result!.context).toBe('slight_drop')
  })

  it('détecte keep_going si absence >= avg - 0.5', () => {
    // avg=3, dernière il y a 3 jours → 3 >= 3-0.5=2.5, 3 < 3*1.5=4.5
    const histories = [makeHistory(3), makeHistory(6), makeHistory(9), makeHistory(12)]
    const result = computeMotivation(histories)
    expect(result).not.toBeNull()
    expect(result!.context).toBe('keep_going')
  })

  it('inclut daysSinceLastWorkout et avgDaysBetweenWorkouts', () => {
    const histories = [makeHistory(10), makeHistory(13), makeHistory(16), makeHistory(19)]
    const result = computeMotivation(histories)
    expect(result).not.toBeNull()
    expect(result!.daysSinceLastWorkout).toBeGreaterThanOrEqual(0)
    expect(result!.avgDaysBetweenWorkouts).toBeGreaterThan(0)
  })

  it('ignore les séances avec date invalide', () => {
    const invalid = { startTime: new Date('invalid') } as any
    const histories = [invalid, makeHistory(10), makeHistory(13)]
    // Seulement 2 valides → null
    expect(computeMotivation(histories)).toBeNull()
  })
})
