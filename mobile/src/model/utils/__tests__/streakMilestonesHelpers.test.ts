import { computeStreakMilestones } from '../streakMilestonesHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(daysAgo: number, isAbandoned = false) {
  return {
    startedAt: new Date(Date.now() - daysAgo * DAY_MS),
    isAbandoned,
  }
}

const labels: Record<number, string> = {
  3: '3 jours',
  7: '1 semaine',
  14: '2 semaines',
  30: '1 mois',
  60: '2 mois',
  100: '100 jours',
  200: '200 jours',
  365: '1 an',
}

describe('computeStreakMilestones', () => {
  it('retourne streak 0 si aucune history', () => {
    const result = computeStreakMilestones([], labels)
    expect(result.currentStreak).toBe(0)
    expect(result.milestones.every(m => !m.reached)).toBe(true)
  })

  it('calcule le streak correct avec 1 jour de gap toléré', () => {
    // Entraînement aujourd'hui, il y a 2 jours, il y a 3 jours (gap de 1 toléré)
    const histories = [
      makeHistory(0), // aujourd'hui
      makeHistory(2), // avant-hier (gap de 1 jour)
      makeHistory(3), // il y a 3 jours
    ]
    const result = computeStreakMilestones(histories, labels)
    expect(result.currentStreak).toBe(3)
  })

  it('milestones atteints sont marqués reached=true', () => {
    // Streak de 8 jours consécutifs (aujourd'hui → il y a 7 jours)
    const histories = Array.from({ length: 8 }, (_, i) => makeHistory(i))
    const result = computeStreakMilestones(histories, labels)
    expect(result.currentStreak).toBe(8)

    const m3 = result.milestones.find(m => m.days === 3)!
    const m7 = result.milestones.find(m => m.days === 7)!
    const m14 = result.milestones.find(m => m.days === 14)!
    expect(m3.reached).toBe(true)
    expect(m7.reached).toBe(true)
    expect(m14.reached).toBe(false)
  })

  it('nextMilestone = premier non-atteint', () => {
    // Streak de 4 jours → milestone 3 atteint, next = 7
    const histories = Array.from({ length: 4 }, (_, i) => makeHistory(i))
    const result = computeStreakMilestones(histories, labels)
    expect(result.nextMilestone).not.toBeNull()
    expect(result.nextMilestone!.days).toBe(7)
  })

  it('progressToNext est dans [0, 100]', () => {
    const histories = Array.from({ length: 5 }, (_, i) => makeHistory(i))
    const result = computeStreakMilestones(histories, labels)
    expect(result.progressToNext).toBeGreaterThanOrEqual(0)
    expect(result.progressToNext).toBeLessThanOrEqual(100)
  })

  it('contient 8 milestones prédéfinis (3, 7, 14, 30, 60, 100, 200, 365)', () => {
    const result = computeStreakMilestones([], labels)
    expect(result.milestones).toHaveLength(8)
    const days = result.milestones.map(m => m.days)
    expect(days).toEqual([3, 7, 14, 30, 60, 100, 200, 365])
  })

  it('streak compte les jours d entrainement, pas les jours calendrier totaux', () => {
    // Lundi, mercredi, jeudi (mardi = repos toléré) → streak = 3 (pas 4)
    const histories = [
      makeHistory(0), // aujourd'hui (jeudi)
      makeHistory(1), // mercredi
      makeHistory(3), // lundi (mardi = repos)
    ]
    const result = computeStreakMilestones(histories, labels)
    expect(result.currentStreak).toBe(3)
  })

  it('exclut les séances abandonnées du calcul', () => {
    const histories = [
      makeHistory(0),             // aujourd'hui
      makeHistory(1, true),       // hier — abandonné
      makeHistory(2),             // avant-hier
    ]
    const result = computeStreakMilestones(histories, labels)
    // Jour 0 et jour 2 → gap de 2 jours sans le jour 1 → streak = 2 (gap toléré)
    expect(result.currentStreak).toBe(2)
  })
})
