import { computeBodyCompTrends } from '../bodyCompTrendsHelpers'
import { mockBodyMeasurement } from './testFactories'

const DAY_MS = 24 * 60 * 60 * 1000

function makeMeasurement(
  daysAgo: number,
  overrides: Partial<Record<'weight' | 'waist' | 'hips' | 'chest' | 'arms', number | null>> = {},
) {
  return mockBodyMeasurement({
    date: Date.now() - daysAgo * DAY_MS,
    weight: overrides.weight ?? 80,
    waist: overrides.waist ?? 85,
    hips: overrides.hips ?? null,
    chest: overrides.chest ?? null,
    arms: overrides.arms ?? null,
  })
}

describe('computeBodyCompTrends', () => {
  it('retourne toutes les métriques sans données si aucune mesure', () => {
    const result = computeBodyCompTrends([], 30)
    expect(result).toHaveLength(5) // weight, waist, hips, chest, arms
    for (const t of result) {
      expect(t.hasData).toBe(false)
      expect(t.trend).toBe('stable')
    }
  })

  it('retourne hasData=false si une seule mesure', () => {
    const measurements = [makeMeasurement(5)]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend).toBeDefined()
    expect(weightTrend!.hasData).toBe(false)
  })

  it('détecte tendance up si poids augmente > 1%', () => {
    const measurements = [
      makeMeasurement(5, { weight: 85 }),  // récent en premier
      makeMeasurement(20, { weight: 80 }), // ancien en dernier
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend!.hasData).toBe(true)
    expect(weightTrend!.trend).toBe('up')
    expect(weightTrend!.current).toBe(85)
    expect(weightTrend!.previous).toBe(80)
  })

  it('détecte tendance down si poids diminue > 1%', () => {
    const measurements = [
      makeMeasurement(5, { weight: 80 }),  // récent en premier
      makeMeasurement(20, { weight: 90 }), // ancien en dernier
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend!.trend).toBe('down')
  })

  it('détecte tendance stable si delta <= 1%', () => {
    const measurements = [
      makeMeasurement(5, { weight: 80.5 }), // récent en premier
      makeMeasurement(20, { weight: 80 }),   // ancien en dernier
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend!.trend).toBe('stable')
  })

  it('ignore les mesures hors période', () => {
    const measurements = [
      makeMeasurement(5, { weight: 85 }),  // récent en premier
      makeMeasurement(20, { weight: 80 }),
      makeMeasurement(60, { weight: 70 }), // hors 30j
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend!.previous).toBe(80) // pas 70
  })

  it('gère les valeurs nulles (pas de hips par ex)', () => {
    const measurements = [
      makeMeasurement(20, { weight: 80, hips: null }),
      makeMeasurement(5, { weight: 85, hips: null }),
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const hipsTrend = result.find(t => t.metric === 'hips')
    expect(hipsTrend!.hasData).toBe(false)
  })

  it('les métriques avec données apparaissent en premier', () => {
    const measurements = [
      makeMeasurement(20, { weight: 80, waist: 85 }),
      makeMeasurement(5, { weight: 85, waist: 83 }),
    ]
    const result = computeBodyCompTrends(measurements, 30)
    // weight et waist ont des données → en premier
    const withData = result.filter(t => t.hasData)
    const withoutData = result.filter(t => !t.hasData)
    expect(withData.length).toBe(2)
    expect(withoutData.length).toBe(3)
    // Les 2 premiers ont hasData=true
    expect(result[0].hasData).toBe(true)
    expect(result[1].hasData).toBe(true)
  })

  it('calcule le delta et deltaPercent', () => {
    const measurements = [
      makeMeasurement(5, { weight: 90 }),  // récent en premier
      makeMeasurement(20, { weight: 80 }), // ancien en dernier
    ]
    const result = computeBodyCompTrends(measurements, 30)
    const weightTrend = result.find(t => t.metric === 'weight')
    expect(weightTrend!.delta).toBe(10)
    expect(weightTrend!.deltaPercent).toBeCloseTo(12.5, 1) // 10/80 * 100
  })
})
