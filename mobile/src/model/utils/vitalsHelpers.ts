/**
 * vitalsHelpers.ts — HRV and Resting HR scoring based on personal trend
 *
 * Uses smoothed 3-day moving average vs 30-day baseline.
 * Threshold: ±1 standard deviation (personalized per user).
 */

export interface VitalsInput {
  date: number
  restingHr: number | null
  hrvRmssd: number | null
}

export interface VitalsScore {
  /** 0-100 */
  score: number
  restingHr: number | null
  hrvRmssd: number | null
  /** Trend vs 30-day baseline: 'up' | 'stable' | 'down' */
  hrvTrend: 'up' | 'stable' | 'down' | null
  hrTrend: 'up' | 'stable' | 'down' | null
}

/**
 * Compute vitals score from recent records.
 * Returns null if insufficient data.
 */
export function computeVitalsScore(records: VitalsInput[]): VitalsScore | null {
  if (records.length < 3) return null

  // Sort by date ascending
  const sorted = [...records].sort((a, b) => a.date - b.date)

  const hrvScore = computeHrvComponent(sorted)
  const hrScore = computeHrComponent(sorted)

  // Combine: if both available, average. If only one, use it.
  let score: number
  if (hrvScore != null && hrScore != null) {
    score = Math.round(hrvScore.score * 0.6 + hrScore.score * 0.4)
  } else if (hrvScore != null) {
    score = Math.round(hrvScore.score)
  } else if (hrScore != null) {
    score = Math.round(hrScore.score)
  } else {
    return null
  }

  const latest = sorted[sorted.length - 1]

  return {
    score,
    restingHr: latest.restingHr,
    hrvRmssd: latest.hrvRmssd,
    hrvTrend: hrvScore?.trend ?? null,
    hrTrend: hrScore?.trend ?? null,
  }
}

interface ComponentResult {
  score: number
  trend: 'up' | 'stable' | 'down'
}

/**
 * HRV score: higher HRV = better recovery
 * Compare 3-day moving avg vs 30-day mean ± 1 std dev
 */
function computeHrvComponent(sorted: VitalsInput[]): ComponentResult | null {
  const values = sorted.map(r => r.hrvRmssd).filter((v): v is number => v != null)
  if (values.length < 3) return null

  const recent3 = values.slice(-3)
  const smoothed = recent3.reduce((s, v) => s + v, 0) / recent3.length

  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)

  // Avoid division by zero
  const threshold = Math.max(stdDev, 1)

  let trend: 'up' | 'stable' | 'down'
  let score: number

  if (smoothed > mean + threshold) {
    trend = 'up'
    score = 85 // Well recovered
  } else if (smoothed >= mean - threshold) {
    trend = 'stable'
    // Linear interpolation within the normal range
    const position = (smoothed - (mean - threshold)) / (2 * threshold)
    score = 50 + position * 25 // 50-75
  } else {
    trend = 'down'
    score = 30 // Fatigued
  }

  return { score, trend }
}

/**
 * Resting HR score: lower HR = better recovery (inverse logic)
 * Compare 3-day moving avg vs 30-day mean ± 1 std dev
 */
function computeHrComponent(sorted: VitalsInput[]): ComponentResult | null {
  const values = sorted.map(r => r.restingHr).filter((v): v is number => v != null)
  if (values.length < 3) return null

  const recent3 = values.slice(-3)
  const smoothed = recent3.reduce((s, v) => s + v, 0) / recent3.length

  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)

  const threshold = Math.max(stdDev, 1)

  let trend: 'up' | 'stable' | 'down'
  let score: number

  // Inverse: lower HR = better
  if (smoothed < mean - threshold) {
    trend = 'down' // HR down = good
    score = 85
  } else if (smoothed <= mean + threshold) {
    trend = 'stable'
    const position = ((mean + threshold) - smoothed) / (2 * threshold)
    score = 50 + position * 25
  } else {
    trend = 'up' // HR up = fatigued
    score = 30
  }

  return { score, trend }
}
