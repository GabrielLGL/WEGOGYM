import { computeTitles } from '../titlesHelpers'

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    bestStreak: 0,
    totalPrs: 0,
    totalTonnage: 0,
    level: 1,
    ...overrides,
  } as never
}

describe('computeTitles', () => {
  it('retourne 15 titres', () => {
    const result = computeTitles(makeUser(), 0, 0)
    expect(result).toHaveLength(15)
  })

  it('tous verrouillés si aucune donnée', () => {
    const result = computeTitles(makeUser(), 0, 0)
    expect(result.every(t => !t.unlocked)).toBe(true)
  })

  it('débloque first_steps avec 1 séance', () => {
    const result = computeTitles(makeUser(), 1, 0)
    const firstSteps = result.find(t => t.id === 'first_steps')!
    expect(firstSteps.unlocked).toBe(true)
  })

  it('débloque regular avec bestStreak >= 4', () => {
    const result = computeTitles(makeUser({ bestStreak: 4 }), 0, 0)
    const regular = result.find(t => t.id === 'regular')!
    expect(regular.unlocked).toBe(true)
  })

  it('débloque iron_will avec bestStreak >= 12', () => {
    const result = computeTitles(makeUser({ bestStreak: 12 }), 0, 0)
    const ironWill = result.find(t => t.id === 'iron_will')!
    expect(ironWill.unlocked).toBe(true)
  })

  it('débloque veteran avec 50 séances', () => {
    const result = computeTitles(makeUser(), 50, 0)
    const veteran = result.find(t => t.id === 'veteran')!
    expect(veteran.unlocked).toBe(true)
  })

  it('débloque centurion avec 100 séances', () => {
    const result = computeTitles(makeUser(), 100, 0)
    const centurion = result.find(t => t.id === 'centurion')!
    expect(centurion.unlocked).toBe(true)
  })

  it('débloque pr_hunter avec 10 PRs', () => {
    const result = computeTitles(makeUser({ totalPrs: 10 }), 0, 0)
    const prHunter = result.find(t => t.id === 'pr_hunter')!
    expect(prHunter.unlocked).toBe(true)
  })

  it('débloque tonnage_lifter avec 10000 kg', () => {
    const result = computeTitles(makeUser({ totalTonnage: 10000 }), 0, 0)
    const lifter = result.find(t => t.id === 'tonnage_lifter')!
    expect(lifter.unlocked).toBe(true)
  })

  it('débloque explorer avec 20 exercices distincts', () => {
    const result = computeTitles(makeUser(), 0, 20)
    const explorer = result.find(t => t.id === 'explorer')!
    expect(explorer.unlocked).toBe(true)
  })

  it('débloque level_10 / level_25 / level_50 / elite selon le niveau', () => {
    const result = computeTitles(makeUser({ level: 75 }), 0, 0)
    expect(result.find(t => t.id === 'level_10')!.unlocked).toBe(true)
    expect(result.find(t => t.id === 'level_25')!.unlocked).toBe(true)
    expect(result.find(t => t.id === 'level_50')!.unlocked).toBe(true)
    expect(result.find(t => t.id === 'elite')!.unlocked).toBe(true)
  })

  it('chaque titre a un icon défini', () => {
    const result = computeTitles(makeUser(), 0, 0)
    for (const title of result) {
      expect(title.icon).toBeDefined()
      expect(title.icon.length).toBeGreaterThan(0)
    }
  })

  it('ne débloque pas les titres si conditions non atteintes', () => {
    const result = computeTitles(makeUser({ level: 9, bestStreak: 3, totalPrs: 9, totalTonnage: 9999 }), 49, 19)
    expect(result.find(t => t.id === 'level_10')!.unlocked).toBe(false)
    expect(result.find(t => t.id === 'regular')!.unlocked).toBe(false)
    expect(result.find(t => t.id === 'pr_hunter')!.unlocked).toBe(false)
    expect(result.find(t => t.id === 'tonnage_lifter')!.unlocked).toBe(false)
    expect(result.find(t => t.id === 'veteran')!.unlocked).toBe(false)
    expect(result.find(t => t.id === 'explorer')!.unlocked).toBe(false)
  })
})
