import { computePlateauAnalysis } from '../plateauHelpers'
import { DAY_MS } from '../../constants'
import type WorkoutSet from '../../models/Set'

const NOW = 1_740_000_000_000 // timestamp fixe pour tests déterministes

function makeSet(weight: number, reps: number, daysAgo: number): WorkoutSet {
  return {
    weight,
    reps,
    createdAt: new Date(NOW - daysAgo * DAY_MS),
  } as unknown as WorkoutSet
}

describe('computePlateauAnalysis', () => {
  it('retourne null si moins de 5 sets', () => {
    const sets = [makeSet(100, 5, 10), makeSet(100, 5, 20), makeSet(100, 5, 30)]
    expect(computePlateauAnalysis(sets)).toBeNull()
  })

  it('retourne isPlateauing=false si progression récente', () => {
    // PR aujourd'hui → pas de plateau
    const sets = [
      makeSet(110, 5, 0),   // PR aujourd'hui
      makeSet(105, 5, 7),
      makeSet(100, 5, 14),
      makeSet(95, 5, 21),
      makeSet(90, 5, 28),
    ]
    const result = computePlateauAnalysis(sets)
    expect(result).not.toBeNull()
    expect(result!.isPlateauing).toBe(false)
  })

  it('détecte un plateau avec 3+ séances sans PR depuis 21+ jours', () => {
    // Meilleur 1RM il y a 30 jours, 3 séances après sans progression
    const sets = [
      makeSet(100, 5, 30),  // PR = 1RM ~116.7
      makeSet(95, 5, 21),   // séance 1 après PR, 1RM ~111.6
      makeSet(95, 5, 14),   // séance 2 après PR
      makeSet(95, 5, 7),    // séance 3 après PR
      makeSet(95, 5, 1),    // séance 4 après PR
    ]
    const result = computePlateauAnalysis(sets)
    expect(result).not.toBeNull()
    expect(result!.isPlateauing).toBe(true)
    expect(result!.sessionsSinceLastPR).toBeGreaterThanOrEqual(3)
    expect(result!.daysSinceLastProgress).toBeGreaterThanOrEqual(21)
  })

  it('suggère deload + vary_reps après 6+ séances en plateau', () => {
    const sets = [
      makeSet(100, 5, 60),  // PR il y a 60 jours
      makeSet(90, 5, 50),
      makeSet(90, 5, 43),
      makeSet(90, 5, 36),
      makeSet(90, 5, 29),
      makeSet(90, 5, 22),
      makeSet(90, 5, 15),
      makeSet(90, 5, 8),
    ]
    const result = computePlateauAnalysis(sets)
    expect(result).not.toBeNull()
    expect(result!.strategies).toEqual(['deload', 'vary_reps'])
  })

  it('suggère progressive + vary_reps avec 3-5 séances en plateau', () => {
    const sets = [
      makeSet(100, 5, 30),
      makeSet(95, 5, 22),
      makeSet(95, 5, 15),
      makeSet(95, 5, 8),
      makeSet(95, 5, 1),
    ]
    const result = computePlateauAnalysis(sets)
    expect(result).not.toBeNull()
    if (result!.isPlateauing) {
      expect(result!.strategies).toEqual(['progressive', 'vary_reps'])
    }
  })

  it('calcule correctement currentBest1RM avec formule Epley', () => {
    // 1RM = 100 * (1 + 5/30) = 116.67
    const sets = [
      makeSet(100, 5, 30),
      makeSet(90, 5, 21),
      makeSet(90, 5, 14),
      makeSet(90, 5, 7),
      makeSet(90, 5, 1),
    ]
    const result = computePlateauAnalysis(sets)
    expect(result).not.toBeNull()
    expect(result!.currentBest1RM).toBeCloseTo(116.67, 1)
  })
})
