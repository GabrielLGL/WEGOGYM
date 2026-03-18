import { computePRPrediction } from '../prPredictionHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makePRSet(daysAgo: number, weight: number, reps: number) {
  return {
    isPr: true,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  } as never
}

function makeNormalSet(daysAgo: number, weight: number, reps: number) {
  return {
    isPr: false,
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  } as never
}

describe('computePRPrediction', () => {
  it('retourne null si aucun set', () => {
    expect(computePRPrediction([])).toBeNull()
  })

  it('retourne null si un seul PR (pas de tendance)', () => {
    const sets = [makePRSet(10, 100, 5)]
    expect(computePRPrediction(sets)).toBeNull()
  })

  it('retourne null si sets sans PR', () => {
    const sets = [makeNormalSet(10, 100, 5), makeNormalSet(5, 110, 5)]
    expect(computePRPrediction(sets)).toBeNull()
  })

  it('calcule une prédiction avec 2 PRs en progression', () => {
    const sets = [
      makePRSet(30, 80, 5),   // 1RM ≈ 93.3
      makePRSet(1, 100, 5),   // 1RM ≈ 116.7
    ]
    const result = computePRPrediction(sets)
    expect(result).not.toBeNull()
    expect(result!.currentBest1RM).toBeGreaterThan(100)
    expect(result!.targetWeight).toBeGreaterThan(result!.currentBest1RM)
    expect(result!.dataPoints).toBe(2)
    expect(result!.confidence).toBe('low')
  })

  it('prédiction > dernier PR avec tendance positive', () => {
    const sets = [
      makePRSet(60, 60, 8),
      makePRSet(30, 80, 6),
      makePRSet(1, 100, 5),
    ]
    const result = computePRPrediction(sets)
    expect(result).not.toBeNull()
    expect(result!.predicted1RM).toBeGreaterThan(result!.currentBest1RM)
    expect(result!.confidence).toBe('medium')
  })

  it('weeklyGainRate positif même avec tendance nulle (fallback 0.5)', () => {
    // Même PR aux deux dates → pente nulle → fallback
    const sets = [
      makePRSet(30, 100, 5),
      makePRSet(1, 100, 5),
    ]
    const result = computePRPrediction(sets)
    expect(result).not.toBeNull()
    expect(result!.weeklyGainRate).toBeGreaterThan(0)
  })

  it('confidence high avec >= 6 PRs', () => {
    const sets = Array.from({ length: 6 }, (_, i) =>
      makePRSet(60 - i * 10, 80 + i * 5, 5),
    )
    const result = computePRPrediction(sets)
    expect(result).not.toBeNull()
    expect(result!.confidence).toBe('high')
    expect(result!.dataPoints).toBe(6)
  })

  it('targetWeight arrondi à 2.5 kg', () => {
    const sets = [
      makePRSet(30, 80, 5),
      makePRSet(1, 100, 5),
    ]
    const result = computePRPrediction(sets)
    expect(result!.targetWeight % 2.5).toBe(0)
  })
})
