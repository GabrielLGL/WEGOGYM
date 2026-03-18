import { computeVolumeForecast } from '../volumeForecastHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeSet(daysAgo: number, weight: number, reps: number) {
  return {
    weight,
    reps,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  } as any
}

/**
 * Crée des sets répartis sur N semaines passées (1 set/semaine).
 * Semaine 1 = la plus récente (7-13j ago), semaine N = la plus ancienne.
 */
function makeWeeklySets(weeks: number, weight = 100, reps = 10): any[] {
  return Array.from({ length: weeks }, (_, i) => {
    const daysAgo = (i + 1) * 7 + 1 // semaine i+1 dans le passé
    return makeSet(daysAgo, weight, reps)
  })
}

describe('computeVolumeForecast', () => {
  it('retourne null si aucun set', () => {
    expect(computeVolumeForecast([])).toBeNull()
  })

  it('retourne null si moins de 4 semaines de données passées', () => {
    // 3 semaines seulement
    const sets = makeWeeklySets(3)
    expect(computeVolumeForecast(sets)).toBeNull()
  })

  it('retourne une prévision avec 4+ semaines de données', () => {
    const sets = makeWeeklySets(5)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.predictedVolume).toBeGreaterThan(0)
  })

  it('la prévision ne donne pas de valeur négative (lowerBound >= 0)', () => {
    const sets = makeWeeklySets(6)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.lowerBound).toBeGreaterThanOrEqual(0)
  })

  it('contient l\'historique hebdomadaire', () => {
    const sets = makeWeeklySets(6)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.weeklyHistory.length).toBeGreaterThanOrEqual(4)
    expect(result!.weeklyHistory.length).toBeLessThanOrEqual(8)
  })

  it('détecte tendance stable si volume constant', () => {
    const sets = makeWeeklySets(6, 100, 10) // 1000 chaque semaine
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.trend).toBe('stable')
  })

  it('calcule currentWeekDay entre 1 et 7', () => {
    const sets = makeWeeklySets(5)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.currentWeekDay).toBeGreaterThanOrEqual(1)
    expect(result!.currentWeekDay).toBeLessThanOrEqual(7)
  })

  it('l\'upperBound >= predictedVolume >= lowerBound', () => {
    const sets = makeWeeklySets(6)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.upperBound).toBeGreaterThanOrEqual(result!.predictedVolume)
    expect(result!.predictedVolume).toBeGreaterThanOrEqual(result!.lowerBound)
  })

  it('inclut le pace mensuel', () => {
    const sets = makeWeeklySets(5)
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.monthlyPace).toBeDefined()
    expect(result!.monthlyPace.average).toBeGreaterThan(0)
  })

  it('ignore les sets trop anciens (> 8 semaines avant semaine courante)', () => {
    const sets = [
      ...makeWeeklySets(5),
      makeSet(100, 100, 10), // ~14 semaines ago → ignoré
    ]
    const result = computeVolumeForecast(sets)
    expect(result).not.toBeNull()
    expect(result!.weeklyHistory.length).toBeLessThanOrEqual(8)
  })
})
