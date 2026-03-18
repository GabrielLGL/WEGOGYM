import { computeWorkoutSummary, formatTimeAgo } from '../workoutSummaryHelpers'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

function makeHistory(
  id: string,
  daysAgo: number,
  opts: { isAbandoned?: boolean; completedAt?: Date | null; durationMin?: number } = {},
) {
  const start = new Date(Date.now() - daysAgo * DAY_MS)
  const durationMin = opts.durationMin ?? 60
  const end = opts.completedAt !== undefined
    ? opts.completedAt
    : new Date(start.getTime() + durationMin * 60_000)
  return {
    id,
    startedAt: start,
    completedAt: end,
    isAbandoned: opts.isAbandoned ?? false,
    sessionId: 'sess1',
  }
}

function makeSet(historyId: string, exerciseId: string, weight: number, reps: number, isPr = false) {
  return { historyId, exerciseId, weight, reps, isPr }
}

const exercises = [{ id: 'ex1', name: 'Développé couché' }, { id: 'ex2', name: 'Squat' }]
const sessions = [{ id: 'sess1', name: 'Push', programId: 'prog1' }]
const programs = [{ id: 'prog1', name: 'PPL' }]

describe('computeWorkoutSummary', () => {
  it('retourne null si aucune history', () => {
    const result = computeWorkoutSummary([], [], exercises, sessions, programs, 'fr')
    expect(result).toBeNull()
  })

  it('sélectionne la dernière séance complétée (tri par startedAt)', () => {
    const histories = [
      makeHistory('h1', 3),
      makeHistory('h2', 1), // plus récente
    ]
    const sets = [
      makeSet('h1', 'ex1', 100, 10),
      makeSet('h2', 'ex1', 80, 10),
    ]
    const result = computeWorkoutSummary(histories, sets, exercises, sessions, programs, 'fr')
    expect(result).not.toBeNull()
    expect(result!.totalVolume).toBe(800) // sets de h2
  })

  it('calcule le volume correctement (weight * reps)', () => {
    const histories = [makeHistory('h1', 1)]
    const sets = [
      makeSet('h1', 'ex1', 100, 10), // 1000
      makeSet('h1', 'ex2', 60, 8),   // 480
    ]
    const result = computeWorkoutSummary(histories, sets, exercises, sessions, programs, 'fr')
    expect(result!.totalVolume).toBe(1480)
  })

  it('calcule la durée en minutes', () => {
    const histories = [makeHistory('h1', 1, { durationMin: 45 })]
    const sets = [makeSet('h1', 'ex1', 100, 10)]
    const result = computeWorkoutSummary(histories, sets, exercises, sessions, programs, 'fr')
    expect(result!.durationMinutes).toBe(45)
  })

  it('exclut les séances abandonnées', () => {
    const histories = [
      makeHistory('h1', 1, { isAbandoned: true }),
    ]
    const sets = [makeSet('h1', 'ex1', 100, 10)]
    const result = computeWorkoutSummary(histories, sets, exercises, sessions, programs, 'fr')
    expect(result).toBeNull()
  })

  it('retourne null si la dernière séance n\'a pas de sets', () => {
    const histories = [makeHistory('h1', 1)]
    const result = computeWorkoutSummary(histories, [], exercises, sessions, programs, 'fr')
    expect(result).toBeNull()
  })

  it('compte les PRs', () => {
    const histories = [makeHistory('h1', 1)]
    const sets = [
      makeSet('h1', 'ex1', 100, 10, true),
      makeSet('h1', 'ex1', 100, 10, false),
      makeSet('h1', 'ex2', 60, 8, true),
    ]
    const result = computeWorkoutSummary(histories, sets, exercises, sessions, programs, 'fr')
    expect(result!.prsHit).toBe(2)
  })
})

describe('formatTimeAgo', () => {
  it('retourne des chaînes lisibles en français', () => {
    const now = new Date()
    // 30 minutes ago
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60_000)
    expect(formatTimeAgo(thirtyMinAgo, 'fr')).toMatch(/il y a \d+min/)

    // 5 hours ago
    const fiveHoursAgo = new Date(now.getTime() - 5 * HOUR_MS)
    expect(formatTimeAgo(fiveHoursAgo, 'fr')).toBe('il y a 5h')

    // yesterday
    const yesterday = new Date(now.getTime() - DAY_MS)
    expect(formatTimeAgo(yesterday, 'fr')).toBe('hier')

    // 3 days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * DAY_MS)
    expect(formatTimeAgo(threeDaysAgo, 'fr')).toBe('il y a 3j')
  })

  it('retourne des chaînes lisibles en anglais', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - DAY_MS)
    expect(formatTimeAgo(yesterday, 'en')).toBe('yesterday')

    const threeDaysAgo = new Date(now.getTime() - 3 * DAY_MS)
    expect(formatTimeAgo(threeDaysAgo, 'en')).toBe('3d ago')
  })
})
