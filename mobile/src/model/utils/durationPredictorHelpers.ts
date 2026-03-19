/**
 * Duration Predictor — Estime la durée d'une séance basé sur l'historique
 *
 * Calcul éphémère (pas de DB), utilise les histories passées de la même session.
 */

export interface DurationPrediction {
  estimatedMinutes: number
  confidence: 'high' | 'medium' | 'low'
  basedOnSessions: number
  breakdown: string
  range: { min: number; max: number }
}

interface HistoryLike {
  startTime: Date | number
  endTime: Date | number | null
  sessionId: string
  deletedAt: Date | null
  isAbandoned: boolean
}

const MIN_DURATION = 10
const MAX_DURATION = 180
const DEFAULT_MINUTES_PER_EXERCISE = 8

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function toMinutes(start: Date | number, end: Date | number): number {
  const s = typeof start === 'number' ? start : start.getTime()
  const e = typeof end === 'number' ? end : end.getTime()
  return (e - s) / 60000
}

export function predictSessionDuration(
  exerciseCount: number,
  histories: HistoryLike[],
  sessionId: string,
): DurationPrediction {
  // Filter valid completed histories for this session
  const valid = histories.filter(
    h =>
      h.sessionId === sessionId &&
      h.deletedAt === null &&
      !h.isAbandoned &&
      h.endTime !== null,
  )

  const durations = valid
    .map(h => toMinutes(h.startTime, h.endTime!))
    .filter(d => d >= MIN_DURATION && d <= MAX_DURATION)

  if (durations.length === 0) {
    // Low confidence — estimation par défaut basée sur le nombre d'exercices
    const estimate = clamp(exerciseCount * DEFAULT_MINUTES_PER_EXERCISE, MIN_DURATION, MAX_DURATION)
    return {
      estimatedMinutes: Math.round(estimate),
      confidence: 'low',
      basedOnSessions: 0,
      breakdown: `~${DEFAULT_MINUTES_PER_EXERCISE} min/exercice`,
      range: {
        min: Math.round(clamp(estimate * 0.7, MIN_DURATION, MAX_DURATION)),
        max: Math.round(clamp(estimate * 1.3, MIN_DURATION, MAX_DURATION)),
      },
    }
  }

  // Weighted average — recent sessions count more
  const weights = durations.map((_, i) => i + 1)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const weightedAvg = durations.reduce((sum, d, i) => sum + d * weights[i], 0) / totalWeight

  const estimate = clamp(Math.round(weightedAvg), MIN_DURATION, MAX_DURATION)
  const min = Math.round(clamp(Math.min(...durations) * 0.9, MIN_DURATION, MAX_DURATION))
  const max = Math.round(clamp(Math.max(...durations) * 1.1, MIN_DURATION, MAX_DURATION))

  const confidence: DurationPrediction['confidence'] = durations.length >= 3 ? 'high' : 'medium'

  return {
    estimatedMinutes: estimate,
    confidence,
    basedOnSessions: durations.length,
    breakdown: `${durations.length} séance${durations.length > 1 ? 's' : ''} précédente${durations.length > 1 ? 's' : ''}`,
    range: { min, max },
  }
}
