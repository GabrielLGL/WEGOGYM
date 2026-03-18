import { computeStreakHeatmap } from '../streakHeatmapHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(daysAgo: number) {
  return {
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    deletedAt: null as Date | null,
    isAbandoned: false,
  }
}

describe('computeStreakHeatmap', () => {
  it('retourne grille vide si aucune history', () => {
    const result = computeStreakHeatmap([])
    expect(result.totalWorkouts).toBe(0)
    expect(result.activeDays).toBe(0)
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it('génère 91 jours (13 semaines)', () => {
    const result = computeStreakHeatmap([])
    expect(result.days).toHaveLength(91)
  })

  it('inclut la date d\'aujourd\'hui', () => {
    const result = computeStreakHeatmap([])
    const todayEntry = result.days.find(d => d.isToday)
    expect(todayEntry).toBeDefined()
  })

  it('compte les séances et jours actifs', () => {
    const histories = [
      makeHistory(0), // aujourd'hui
      makeHistory(0), // 2e séance aujourd'hui
      makeHistory(1), // hier
    ]
    const result = computeStreakHeatmap(histories)
    expect(result.totalWorkouts).toBe(3)
    expect(result.activeDays).toBe(2)
  })

  it('calcule l\'intensité correctement (0-3)', () => {
    const histories = [
      makeHistory(1), // 1 séance hier
    ]
    const result = computeStreakHeatmap(histories)
    const yesterday = result.days.find(d => d.count === 1)
    expect(yesterday).toBeDefined()
    expect(yesterday!.intensity).toBe(1)

    // 2 séances = intensité 2
    const histories2 = [makeHistory(1), makeHistory(1)]
    const result2 = computeStreakHeatmap(histories2)
    const day = result2.days.find(d => d.count === 2)
    expect(day).toBeDefined()
    expect(day!.intensity).toBe(2)
  })

  it('intensité 3 pour 3+ séances le même jour', () => {
    const histories = [
      makeHistory(1), makeHistory(1), makeHistory(1),
    ]
    const result = computeStreakHeatmap(histories)
    const day = result.days.find(d => d.count === 3)
    expect(day).toBeDefined()
    expect(day!.intensity).toBe(3)
  })

  it('exclut les séances abandonnées', () => {
    const histories = [
      makeHistory(1),
      { createdAt: new Date(Date.now() - DAY_MS), deletedAt: null, isAbandoned: true },
    ]
    const result = computeStreakHeatmap(histories)
    expect(result.totalWorkouts).toBe(1)
  })

  it('exclut les séances soft-deleted', () => {
    const histories = [
      makeHistory(1),
      { createdAt: new Date(Date.now() - DAY_MS), deletedAt: new Date(), isAbandoned: false },
    ]
    const result = computeStreakHeatmap(histories)
    expect(result.totalWorkouts).toBe(1)
  })

  it('calcule le streak courant', () => {
    // 3 jours consécutifs incluant aujourd'hui
    const histories = [
      makeHistory(0),
      makeHistory(1),
      makeHistory(2),
    ]
    const result = computeStreakHeatmap(histories)
    expect(result.currentStreak).toBe(3)
  })

  it('streak courant = 0 si pas de séance aujourd\'hui ni hier', () => {
    const histories = [makeHistory(5)]
    const result = computeStreakHeatmap(histories)
    expect(result.currentStreak).toBe(0)
  })

  it('dates au format YYYY-MM-DD', () => {
    const result = computeStreakHeatmap([])
    for (const day of result.days) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
