import { computeWeeklyGoals, getWeekStart } from '../weeklyGoalsHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(id: string, date: Date) {
  return { id, startTime: date, deletedAt: null, isAbandoned: false }
}

function makeSet(weight: number, reps: number, historyId: string) {
  return { weight, reps, historyId }
}

/** Retourne une date dans la semaine courante (lundi + offset jours) */
function thisWeekDate(dayOffset = 0): Date {
  const monday = getWeekStart(new Date())
  return new Date(monday.getTime() + dayOffset * DAY_MS + 3600000) // +1h pour être dans la journée
}

describe('getWeekStart', () => {
  it('retourne un lundi', () => {
    const result = getWeekStart(new Date())
    expect(result.getDay()).toBe(1) // 1 = lundi
  })

  it('retourne le même jour si on est déjà lundi', () => {
    // Trouver un lundi
    const d = new Date(2026, 2, 16) // 16 mars 2026 est un lundi
    const result = getWeekStart(d)
    expect(result.getDate()).toBe(16)
  })

  it('retourne le lundi précédent pour un dimanche', () => {
    const d = new Date(2026, 2, 22) // 22 mars 2026 est un dimanche
    const result = getWeekStart(d)
    expect(result.getDate()).toBe(16) // lundi 16 mars
  })

  it('met les heures à 00:00:00', () => {
    const d = new Date(2026, 2, 18, 14, 30, 45)
    const result = getWeekStart(d)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })
})

describe('computeWeeklyGoals', () => {
  it('retourne 0 sessions et 0 volume si aucune donnée cette semaine', () => {
    const result = computeWeeklyGoals([], [], 'fr')
    expect(result.sessionsCount).toBe(0)
    expect(result.volumeKg).toBe(0)
    expect(result.sessionsPct).toBe(0)
    expect(result.volumePct).toBe(0)
  })

  it('compte les sessions correctement', () => {
    const histories = [
      makeHistory('h1', thisWeekDate(0)),
      makeHistory('h2', thisWeekDate(1)),
    ]
    const result = computeWeeklyGoals(histories, [], 'fr')
    expect(result.sessionsCount).toBe(2)
  })

  it('calcule le volume (weight * reps)', () => {
    const histories = [makeHistory('h1', thisWeekDate(0))]
    const sets = [
      makeSet(100, 10, 'h1'), // 1000
      makeSet(80, 8, 'h1'),   // 640
    ]
    const result = computeWeeklyGoals(histories, sets, 'fr')
    expect(result.volumeKg).toBe(1640)
  })

  it('cap les pourcentages à 100', () => {
    const histories = [
      makeHistory('h1', thisWeekDate(0)),
      makeHistory('h2', thisWeekDate(1)),
      makeHistory('h3', thisWeekDate(2)),
      makeHistory('h4', thisWeekDate(3)),
      makeHistory('h5', thisWeekDate(4)),
    ]
    // 5 sessions pour un target de 4 → > 100%
    const result = computeWeeklyGoals(histories, [], 'fr', 4)
    expect(result.sessionsPct).toBe(100)
  })

  it('exclut les séances supprimées et abandonnées', () => {
    const histories = [
      makeHistory('h1', thisWeekDate(0)),
      { id: 'h2', startTime: thisWeekDate(1), deletedAt: new Date(), isAbandoned: false },
      { id: 'h3', startTime: thisWeekDate(2), deletedAt: null, isAbandoned: true },
    ]
    const result = computeWeeklyGoals(histories, [], 'fr')
    expect(result.sessionsCount).toBe(1)
  })

  it('daysRemaining est entre 0 et 7', () => {
    const result = computeWeeklyGoals([], [], 'fr')
    expect(result.daysRemaining).toBeGreaterThanOrEqual(0)
    expect(result.daysRemaining).toBeLessThanOrEqual(7)
  })

  it('completed est true quand les deux objectifs sont atteints', () => {
    const histories = Array.from({ length: 5 }, (_, i) =>
      makeHistory(`h${i}`, thisWeekDate(i % 5)),
    )
    // Gros volume pour dépasser le target
    const sets = histories.map(h => makeSet(500, 100, h.id)) // 50000 kg chacun
    const result = computeWeeklyGoals(histories, sets, 'fr', 4, 20000)
    expect(result.completed).toBe(true)
  })
})
