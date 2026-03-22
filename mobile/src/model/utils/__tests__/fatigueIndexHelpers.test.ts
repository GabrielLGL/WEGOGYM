import { computeFatigueIndex } from '../fatigueIndexHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

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

/** Crée un historique suffisant : 4+ séances réparties sur 14+ jours */
function makeSufficientHistories() {
  return [makeHistory(1), makeHistory(7), makeHistory(14), makeHistory(21)]
}

describe('computeFatigueIndex', () => {
  it('retourne null si aucune donnée', () => {
    const result = computeFatigueIndex([], [])
    expect(result).toBeNull()
  })

  it('retourne null si moins de 4 séances', () => {
    const histories = [makeHistory(1), makeHistory(7), makeHistory(14)]
    const result = computeFatigueIndex([], histories)
    expect(result).toBeNull()
  })

  it('retourne null si historique étalé sur moins de 14 jours', () => {
    const histories = [makeHistory(1), makeHistory(3), makeHistory(5), makeHistory(10)]
    const result = computeFatigueIndex([], histories)
    expect(result).toBeNull()
  })

  it('détecte zone optimal pour charge équilibrée', () => {
    // 8 semaines de sets réguliers (1 set/semaine, même charge)
    const sets = Array.from({ length: 8 }, (_, w) => makeSet(w * 7 + 1))
    const histories = Array.from({ length: 8 }, (_, w) => makeHistory(w * 7 + 1))
    const result = computeFatigueIndex(sets, histories)
    expect(result).not.toBeNull()
    // Acute ≈ Chronic → ratio ≈ 1.0 → zone optimal
    expect(result!.zone).toBe('optimal')
    expect(result!.index).toBeCloseTo(50, 0)
  })

  it('détecte zone overreaching si volume récent très élevé vs moyenne', () => {
    // 7 sets cette semaine vs 1 set/semaine les 7 semaines précédentes
    const recentSets = Array.from({ length: 7 }, (_, d) => makeSet(d, 100, 10))
    const oldSets = Array.from({ length: 7 }, (_, w) => makeSet((w + 1) * 7 + 1, 100, 10))
    const histories = Array.from({ length: 8 }, (_, w) => makeHistory(w * 7))
    const result = computeFatigueIndex([...recentSets, ...oldSets], histories)
    expect(result).not.toBeNull()
    // ratio ≈ 7 / 1 = 7 → bien > 1.5 → overreaching
    expect(result!.zone).toBe('overreaching')
  })

  it('détecte zone recovery si aucun set cette semaine', () => {
    // Tous les sets datent d'il y a > 7 jours
    const sets = Array.from({ length: 8 }, (_, w) => makeSet((w + 1) * 7 + 1))
    const histories = Array.from({ length: 8 }, (_, w) => makeHistory((w + 1) * 7 + 1))
    const result = computeFatigueIndex(sets, histories)
    expect(result).not.toBeNull()
    expect(result!.zone).toBe('recovery')
    expect(result!.weeklyVolume).toBe(0)
  })

  it('exclut les séances soft-deleted et abandonnées du compte de sessions', () => {
    const deleted = { createdAt: new Date(), deletedAt: new Date(), isAbandoned: false }
    const abandoned = { createdAt: new Date(), deletedAt: null, isAbandoned: true }
    // Besoin de suffisamment de séances actives étalées sur 14+ jours
    const activeHistories = [makeHistory(8), makeHistory(14), makeHistory(21), makeHistory(28)]
    const result = computeFatigueIndex([], [deleted, abandoned, ...activeHistories])
    expect(result).not.toBeNull()
    expect(result!.sessionsThisWeek).toBe(0) // aucune active cette semaine
  })

  it('clamp index entre 0 et 100', () => {
    // Ratio très élevé
    const recentSets = Array.from({ length: 100 }, (_, d) => makeSet(d % 7, 100, 10))
    const histories = Array.from({ length: 8 }, (_, w) => makeHistory(w * 7))
    const result = computeFatigueIndex(recentSets, histories)
    expect(result).not.toBeNull()
    expect(result!.index).toBeLessThanOrEqual(100)
    expect(result!.index).toBeGreaterThanOrEqual(0)
  })
})
