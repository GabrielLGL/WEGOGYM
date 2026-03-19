import type BodyMeasurement from '../models/BodyMeasurement'

export type BodyCompPeriod = 30 | 90 | 180

export type BodyCompMetricKey = 'weight' | 'waist' | 'hips' | 'chest' | 'arms'

export type TrendDirection = 'up' | 'down' | 'stable'

export interface BodyCompTrend {
  metric: BodyCompMetricKey
  dataPoints: number[]
  current: number
  previous: number
  delta: number
  deltaPercent: number
  trend: TrendDirection
  hasData: boolean
}

const METRIC_KEYS: BodyCompMetricKey[] = ['weight', 'waist', 'hips', 'chest', 'arms']

export function computeBodyCompTrends(
  measurements: BodyMeasurement[],
  periodDays: BodyCompPeriod,
): BodyCompTrend[] {
  const cutoff = Date.now() - periodDays * 86400000
  const filtered = measurements.filter(m => m.date >= cutoff)

  const trends: BodyCompTrend[] = METRIC_KEYS.map(metric => {
    const dataPoints = filtered
      .map(m => m[metric])
      .filter((v): v is number => v !== null && v !== undefined && v !== 0)
      .reverse() // oldest first for sparkline

    if (dataPoints.length < 2) {
      return {
        metric,
        dataPoints,
        current: dataPoints[dataPoints.length - 1] ?? 0,
        previous: 0,
        delta: 0,
        deltaPercent: 0,
        trend: 'stable' as TrendDirection,
        hasData: false,
      }
    }

    const current = dataPoints[dataPoints.length - 1]
    const previous = dataPoints[0]
    const delta = current - previous
    const deltaPercent = previous !== 0 ? (delta / previous) * 100 : 0
    const trend: TrendDirection =
      Math.abs(deltaPercent) > 1 ? (delta > 0 ? 'up' : 'down') : 'stable'

    return { metric, dataPoints, current, previous, delta, deltaPercent, trend, hasData: true }
  })

  // Metrics with data first
  return trends.sort((a, b) => (a.hasData === b.hasData ? 0 : a.hasData ? -1 : 1))
}
