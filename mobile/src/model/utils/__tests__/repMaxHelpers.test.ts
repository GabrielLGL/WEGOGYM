import {
  computeRepMax,
  getBestRepMax,
  getRepMaxHistory,
  getSubMaxEstimates,
} from '../repMaxHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(daysAgo: number, weight: number, reps: number) {
  return { weight, reps, createdAt: new Date(Date.now() - daysAgo * DAY_MS) }
}

describe('computeRepMax', () => {
  it('retourne le poids directement si reps <= 1', () => {
    const result = computeRepMax(100, 1)
    expect(result.epley).toBe(100)
    expect(result.brzycki).toBe(100)
  })

  it('calcule Epley et Brzycki pour un set typique', () => {
    const result = computeRepMax(100, 10)
    // Epley: 100 * (1 + 10/30) = 133.33
    expect(result.epley).toBeCloseTo(133.33, 1)
    // Brzycki: 100 * (36 / (37 - 10)) = 133.33
    expect(result.brzycki).toBeCloseTo(133.33, 1)
  })

  it('calcule correctement pour 5 reps', () => {
    const result = computeRepMax(100, 5)
    // Epley: 100 * (1 + 5/30) = 116.67
    expect(result.epley).toBeCloseTo(116.67, 1)
    // Brzycki: 100 * (36 / 32) = 112.5
    expect(result.brzycki).toBeCloseTo(112.5, 1)
  })
})

describe('getBestRepMax', () => {
  it('retourne null si aucun set', () => {
    expect(getBestRepMax([])).toBeNull()
  })

  it('retourne null si tous les sets ont poids <= 0', () => {
    expect(getBestRepMax([{ weight: 0, reps: 10 }])).toBeNull()
  })

  it('retourne null si reps > 15', () => {
    expect(getBestRepMax([{ weight: 100, reps: 20 }])).toBeNull()
  })

  it('retourne le meilleur 1RM estimé pour un set typique', () => {
    const result = getBestRepMax([{ weight: 100, reps: 10 }])
    expect(result).not.toBeNull()
    // avg of Epley(133.33) and Brzycki(133.33) = 133
    expect(result!.estimated1RM).toBe(133)
    expect(result!.bestWeight).toBe(100)
    expect(result!.bestReps).toBe(10)
  })

  it('choisit le set avec le meilleur 1RM estimé', () => {
    const result = getBestRepMax([
      { weight: 80, reps: 10 },
      { weight: 120, reps: 3 },
      { weight: 60, reps: 15 },
    ])
    expect(result).not.toBeNull()
    // 120x3 donne le meilleur 1RM
    expect(result!.bestWeight).toBe(120)
    expect(result!.bestReps).toBe(3)
  })

  it('calcule les sous-max (3RM, 5RM) correctement', () => {
    const result = getBestRepMax([{ weight: 100, reps: 1 }])
    expect(result).not.toBeNull()
    // 1RM direct = 100
    expect(result!.estimated1RM).toBe(100)
    expect(result!.estimated3RM).toBe(93) // 100 * 0.93
    expect(result!.estimated5RM).toBe(87) // 100 * 0.87
  })
})

describe('getRepMaxHistory', () => {
  it('retourne un tableau vide si aucun set', () => {
    expect(getRepMaxHistory([])).toEqual([])
  })

  it('retourne un tableau vide si sets sans createdAt', () => {
    expect(getRepMaxHistory([{ weight: 100, reps: 10 }])).toEqual([])
  })

  it('retourne historique trié par semaine', () => {
    const sets = [
      makeSet(1, 100, 10),
      makeSet(8, 90, 10),
      makeSet(15, 80, 10),
    ]
    const result = getRepMaxHistory(sets)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // Trié chronologiquement
    for (let i = 1; i < result.length; i++) {
      expect(result[i].weekLabel >= result[i - 1].weekLabel).toBe(true)
    }
  })

  it('garde le meilleur 1RM par semaine', () => {
    const sets = [
      makeSet(1, 100, 10), // ~133
      makeSet(1, 80, 10),  // ~107
    ]
    const result = getRepMaxHistory(sets)
    expect(result.length).toBe(1)
    expect(result[0].estimated1RM).toBe(133) // le meilleur
  })

  it('limite à 12 semaines max', () => {
    const sets = Array.from({ length: 20 }, (_, i) => makeSet(i * 7, 100, 10))
    const result = getRepMaxHistory(sets)
    expect(result.length).toBeLessThanOrEqual(12)
  })

  it('ignore les sets avec reps > 15', () => {
    const sets = [makeSet(1, 100, 20)]
    expect(getRepMaxHistory(sets)).toEqual([])
  })
})

describe('getSubMaxEstimates', () => {
  it('retourne les estimations sous-max à partir du 1RM', () => {
    const result = getSubMaxEstimates(100)
    expect(result['3RM']).toBe(93)
    expect(result['5RM']).toBe(87)
    expect(result['8RM']).toBe(80)
    expect(result['10RM']).toBe(75)
  })

  it('retourne 0 pour un 1RM de 0', () => {
    const result = getSubMaxEstimates(0)
    expect(result['3RM']).toBe(0)
    expect(result['5RM']).toBe(0)
  })
})
