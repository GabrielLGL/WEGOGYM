import { computeSetQuality } from '../setQualityHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSetInput(
  exerciseId: string,
  historyId: string,
  weight: number,
  reps: number,
  daysAgo = 0,
) {
  return {
    weight,
    reps,
    exerciseId,
    historyId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }
}

const exercises = [
  { id: 'ex1', name: 'Développé couché' },
  { id: 'ex2', name: 'Squat' },
]

describe('computeSetQuality', () => {
  it('retourne null si aucun set', () => {
    const result = computeSetQuality([], exercises, null)
    expect(result).toBeNull()
  })

  it('retourne null si moins de 5 sets par exercice', () => {
    const sets = [
      makeSetInput('ex1', 'h1', 100, 10),
      makeSetInput('ex1', 'h1', 100, 10),
      makeSetInput('ex1', 'h1', 100, 10),
    ]
    const result = computeSetQuality(sets, exercises, null)
    expect(result).toBeNull()
  })

  it('grade A pour des sets très consistants', () => {
    // 6 sets identiques → variance nulle → score élevé
    const sets = Array.from({ length: 6 }, (_, i) =>
      makeSetInput('ex1', `h${i}`, 100, 10),
    )
    const result = computeSetQuality(sets, exercises, null)
    expect(result).not.toBeNull()
    expect(result!.entries[0].grade).toBe('A')
    expect(result!.entries[0].repConsistency).toBe(100)
  })

  it('grade D pour des sets très inconsistants', () => {
    // 6 sets avec poids et reps très variés
    const sets = [
      makeSetInput('ex1', 'h1', 20, 3),
      makeSetInput('ex1', 'h2', 100, 20),
      makeSetInput('ex1', 'h3', 50, 1),
      makeSetInput('ex1', 'h4', 200, 15),
      makeSetInput('ex1', 'h5', 10, 25),
      makeSetInput('ex1', 'h6', 150, 2),
    ]
    const result = computeSetQuality(sets, exercises, null)
    expect(result).not.toBeNull()
    expect(result!.entries[0].grade).toBe('D')
  })

  it('détecte les drop sets (poids décroissant dans une même history)', () => {
    // 5 sets dans la même history avec poids décroissant
    const sets = [
      makeSetInput('ex1', 'h1', 100, 10),
      makeSetInput('ex1', 'h1', 80, 10),
      makeSetInput('ex1', 'h1', 60, 10),
      makeSetInput('ex1', 'h1', 40, 10),
      makeSetInput('ex1', 'h1', 20, 10),
    ]
    const result = computeSetQuality(sets, exercises, null)
    expect(result).not.toBeNull()
    expect(result!.entries[0].dropSetsDetected).toBeGreaterThan(0)
  })

  it('repConsistency est dans [0, 100]', () => {
    const sets = Array.from({ length: 8 }, (_, i) =>
      makeSetInput('ex1', `h${i}`, 100, 5 + i * 3),
    )
    const result = computeSetQuality(sets, exercises, null)
    expect(result).not.toBeNull()
    const entry = result!.entries[0]
    expect(entry.repConsistency).toBeGreaterThanOrEqual(0)
    expect(entry.repConsistency).toBeLessThanOrEqual(100)
  })

  it('filtre par période', () => {
    // 3 sets récents + 7 sets anciens (> 30 jours)
    const recentSets = Array.from({ length: 3 }, (_, i) =>
      makeSetInput('ex1', `h${i}`, 100, 10, i),
    )
    const oldSets = Array.from({ length: 7 }, (_, i) =>
      makeSetInput('ex1', `h${i + 10}`, 50, 5, 60 + i),
    )
    const allSets = [...recentSets, ...oldSets]

    // Avec période de 30 jours → seulement 3 récents (< 5 minimum) → null
    const result30 = computeSetQuality(allSets, exercises, 30)
    expect(result30).toBeNull()

    // Sans filtre → 10 sets → résultat non null
    const resultAll = computeSetQuality(allSets, exercises, null)
    expect(resultAll).not.toBeNull()
  })

  it('mostConsistent et leastConsistent sont remplis avec 2+ exercices', () => {
    const sets1 = Array.from({ length: 6 }, (_, i) =>
      makeSetInput('ex1', `h${i}`, 100, 10),
    )
    const sets2 = Array.from({ length: 6 }, (_, i) =>
      makeSetInput('ex2', `h${i + 10}`, 50 + i * 30, 5 + i * 5),
    )
    const result = computeSetQuality([...sets1, ...sets2], exercises, null)
    expect(result).not.toBeNull()
    expect(result!.mostConsistent).toBeTruthy()
    expect(result!.leastConsistent).toBeTruthy()
    expect(result!.mostConsistent).not.toBe(result!.leastConsistent)
  })
})
