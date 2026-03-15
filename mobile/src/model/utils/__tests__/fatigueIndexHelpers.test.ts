import { computeFatigueIndex } from '../fatigueIndexHelpers'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function makeSet(daysAgo: number, weight = 100, reps = 10) {
  return { weight, reps, createdAt: new Date(Date.now() - daysAgo * DAY_MS) }
}

function makeHistory(daysAgo: number) {
  return {
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    deletedAt: null as Date | null,
    isAbandoned: false,
  }
}

describe('computeFatigueIndex', () => {
  it('retourne index 0 et zone recovery si aucun set', () => {
    const result = computeFatigueIndex([], [])
    expect(result.index).toBe(0)
    expect(result.zone).toBe('recovery')
    expect(result.weeklyVolume).toBe(0)
  })

  it('détecte zone optimal pour charge équilibrée', () => {
    // 8 semaines de sets réguliers (1 set/semaine, même charge)
    const sets = Array.from({ length: 8 }, (_, w) => makeSet(w * 7 + 1))
    const histories = Array.from({ length: 8 }, (_, w) => makeHistory(w * 7 + 1))
    const result = computeFatigueIndex(sets, histories)
    // Acute ≈ Chronic → ratio ≈ 1.0 → zone optimal
    expect(result.zone).toBe('optimal')
    expect(result.index).toBeCloseTo(50, 0)
  })

  it('détecte zone overreaching si volume récent très élevé vs moyenne', () => {
    // 7 sets cette semaine vs 1 set/semaine les 7 semaines précédentes
    const recentSets = Array.from({ length: 7 }, (_, d) => makeSet(d, 100, 10))
    const oldSets = Array.from({ length: 7 }, (_, w) => makeSet((w + 1) * 7 + 1, 100, 10))
    const result = computeFatigueIndex([...recentSets, ...oldSets], [])
    // ratio ≈ 7 / 1 = 7 → bien > 1.5 → overreaching
    expect(result.zone).toBe('overreaching')
  })

  it('détecte zone recovery si aucun set cette semaine', () => {
    // Tous les sets datent d'il y a > 7 jours
    const sets = Array.from({ length: 8 }, (_, w) => makeSet((w + 1) * 7 + 1))
    const result = computeFatigueIndex(sets, [])
    expect(result.zone).toBe('recovery')
    expect(result.weeklyVolume).toBe(0)
  })

  it('exclut les séances soft-deleted et abandonnées du compte de sessions', () => {
    const deleted = { createdAt: new Date(), deletedAt: new Date(), isAbandoned: false }
    const abandoned = { createdAt: new Date(), deletedAt: null, isAbandoned: true }
    const active = makeHistory(1)
    const result = computeFatigueIndex([], [deleted, abandoned, active])
    expect(result.sessionsThisWeek).toBe(1)
  })

  it('clamp index entre 0 et 100', () => {
    // Ratio très élevé
    const recentSets = Array.from({ length: 100 }, (_, d) => makeSet(d % 7, 100, 10))
    const result = computeFatigueIndex(recentSets, [])
    expect(result.index).toBeLessThanOrEqual(100)
    expect(result.index).toBeGreaterThanOrEqual(0)
  })
})
