/**
 * sleepHelpers.ts — Sleep quality scoring based on personal trend (14-day average)
 *
 * Philosophy: no fixed thresholds — compare tonight to the user's own baseline.
 * Sessions < 3h are excluded from scoring (stored as naps).
 */

export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor'

export interface SleepInput {
  date: number
  durationMinutes: number
  deepMinutes: number | null
  lightMinutes: number | null
  remMinutes: number | null
  awakeMinutes: number | null
}

export interface SleepScore {
  /** 0-100 */
  score: number
  quality: SleepQuality
  durationMinutes: number
  deepMinutes: number | null
  lightMinutes: number | null
  remMinutes: number | null
  awakeMinutes: number | null
}

const MIN_SLEEP_MINUTES = 180 // 3h — below this is a nap, excluded from score

/**
 * Filter out naps (< 3h) from scoring
 */
function scorableSessions(records: SleepInput[]): SleepInput[] {
  return records.filter(r => r.durationMinutes >= MIN_SLEEP_MINUTES)
}

/**
 * Get the most recent night's sleep (scorable sessions only)
 */
export function getLastNightSleep(records: SleepInput[]): SleepInput | null {
  const valid = scorableSessions(records)
  if (valid.length === 0) return null
  return valid.reduce((latest, r) => r.date > latest.date ? r : latest)
}

/**
 * Compute sleep quality based on personal 14-day trend.
 * Returns null if no scorable sleep data.
 */
export function computeSleepScore(records: SleepInput[]): SleepScore | null {
  const valid = scorableSessions(records)
  if (valid.length === 0) return null

  const tonight = getLastNightSleep(valid)
  if (!tonight) return null

  // Build 14-day baseline (excluding tonight)
  const fourteenDaysAgo = Date.now() - 14 * 86400000
  const baseline = valid.filter(r =>
    r.date >= fourteenDaysAgo && r.date !== tonight.date
  )

  let score: number

  if (baseline.length < 3) {
    // Not enough baseline data — use absolute thresholds as fallback
    score = getAbsoluteScore(tonight)
  } else {
    score = getTrendScore(tonight, baseline)
  }

  return {
    score: Math.round(score),
    quality: getQualityFromScore(score),
    durationMinutes: tonight.durationMinutes,
    deepMinutes: tonight.deepMinutes,
    lightMinutes: tonight.lightMinutes,
    remMinutes: tonight.remMinutes,
    awakeMinutes: tonight.awakeMinutes,
  }
}

/**
 * Score based on personal trend (compare to 14-day average)
 */
function getTrendScore(tonight: SleepInput, baseline: SleepInput[]): number {
  const avgDuration = baseline.reduce((s, r) => s + r.durationMinutes, 0) / baseline.length

  // Duration component (0-70 points)
  const durationRatio = tonight.durationMinutes / avgDuration
  let durationScore: number
  if (durationRatio >= 1.1) durationScore = 70       // 10%+ above average
  else if (durationRatio >= 0.95) durationScore = 60  // around average
  else if (durationRatio >= 0.85) durationScore = 45  // slightly below
  else durationScore = 25                              // well below

  // Deep sleep component (0-30 points) — if available
  let deepScore = 15 // neutral default
  if (tonight.deepMinutes != null && tonight.durationMinutes > 0) {
    const deepPct = tonight.deepMinutes / tonight.durationMinutes
    if (deepPct >= 0.25) deepScore = 30       // >25% deep = excellent
    else if (deepPct >= 0.15) deepScore = 20  // 15-25% = good
    else if (deepPct >= 0.10) deepScore = 10  // 10-15% = fair
    else deepScore = 5                         // <10% = poor
  }

  return durationScore + deepScore
}

/**
 * Fallback: absolute score when < 3 nights of baseline
 */
function getAbsoluteScore(tonight: SleepInput): number {
  const hours = tonight.durationMinutes / 60

  let durationScore: number
  if (hours >= 8) durationScore = 70
  else if (hours >= 7) durationScore = 60
  else if (hours >= 6) durationScore = 40
  else durationScore = 20

  let deepScore = 15
  if (tonight.deepMinutes != null && tonight.durationMinutes > 0) {
    const deepPct = tonight.deepMinutes / tonight.durationMinutes
    if (deepPct >= 0.25) deepScore = 30
    else if (deepPct >= 0.15) deepScore = 20
    else if (deepPct >= 0.10) deepScore = 10
    else deepScore = 5
  }

  return durationScore + deepScore
}

function getQualityFromScore(score: number): SleepQuality {
  if (score >= 75) return 'excellent'
  if (score >= 55) return 'good'
  if (score >= 35) return 'fair'
  return 'poor'
}
