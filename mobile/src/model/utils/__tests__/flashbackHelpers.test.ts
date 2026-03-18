import { computeFlashback } from '../flashbackHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeHistory(daysAgo: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `h-${daysAgo}`,
    startTime: new Date(Date.now() - daysAgo * DAY_MS),
    deletedAt: null,
    isAbandoned: false,
    ...overrides,
  } as never
}

function makeSet(historyId: string, weight = 100, reps = 10) {
  return {
    history: { id: historyId },
    weight,
    reps,
  } as never
}

describe('computeFlashback', () => {
  it('retourne null si aucun historique', () => {
    expect(computeFlashback([], [], 1)).toBeNull()
  })

  it('retourne null si pas de séance à 1 mois (±3j)', () => {
    // séance il y a 10 jours seulement
    const h = makeHistory(10)
    expect(computeFlashback([h], [], 1)).toBeNull()
  })

  it('retourne null si pas de séance à 3 mois (±3j)', () => {
    const h = makeHistory(10)
    expect(computeFlashback([h], [], 3)).toBeNull()
  })

  it('flashback 1 mois trouve la séance dans la fenêtre ±3j', () => {
    // séance il y a 30 jours (pile dans la fenêtre)
    const h = makeHistory(30)
    const s = makeSet('h-30', 80, 10)
    const result = computeFlashback([h], [s], 1)
    expect(result).not.toBeNull()
    expect(result!.sessions).toBe(1)
    expect(result!.volumeKg).toBe(800)
  })

  it('flashback 3 mois trouve la séance dans la fenêtre ±3j', () => {
    // séance il y a 90 jours
    const h = makeHistory(90)
    const s = makeSet('h-90', 60, 12)
    const result = computeFlashback([h], [s], 3)
    expect(result).not.toBeNull()
    expect(result!.sessions).toBe(1)
    expect(result!.volumeKg).toBe(720)
  })

  it('calcule le volume correct avec plusieurs sets', () => {
    const h = makeHistory(29) // dans la fenêtre 30±3
    const s1 = makeSet('h-29', 100, 10)
    const s2 = makeSet('h-29', 50, 20)
    const result = computeFlashback([h], [s1, s2], 1)
    expect(result).not.toBeNull()
    expect(result!.volumeKg).toBe(2000) // 1000 + 1000
  })

  it('exclut les séances abandonnées', () => {
    const h = makeHistory(30, { isAbandoned: true })
    const s = makeSet('h-30', 100, 10)
    expect(computeFlashback([h], [s], 1)).toBeNull()
  })

  it('exclut les séances soft-deleted', () => {
    const h = makeHistory(30, { deletedAt: new Date() })
    const s = makeSet('h-30', 100, 10)
    expect(computeFlashback([h], [s], 1)).toBeNull()
  })

  it('compte plusieurs séances dans la fenêtre', () => {
    const h1 = makeHistory(29)
    const h2 = makeHistory(31)
    const s1 = makeSet('h-29', 100, 10)
    const s2 = makeSet('h-31', 80, 8)
    const result = computeFlashback([h1, h2], [s1, s2], 1)
    expect(result).not.toBeNull()
    expect(result!.sessions).toBe(2)
    expect(result!.volumeKg).toBe(1640) // 1000 + 640
  })
})
