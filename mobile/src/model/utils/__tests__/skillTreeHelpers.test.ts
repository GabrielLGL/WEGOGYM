import { computeSkillTree } from '../skillTreeHelpers'

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    totalPrs: 0,
    totalTonnage: 0,
    bestStreak: 0,
    ...overrides,
  } as never
}

const mockColors = {
  primary: '#007AFF',
  warning: '#FF9500',
  danger: '#FF3B30',
  textSecondary: '#8E8E93',
} as never

describe('computeSkillTree', () => {
  it('retourne 4 branches', () => {
    const result = computeSkillTree(makeUser(), 0, mockColors)
    expect(result).toHaveLength(4)
    const ids = result.map(b => b.id)
    expect(ids).toEqual(['force', 'endurance', 'mobilite', 'regularite'])
  })

  it('tout verrouillé si aucune donnée', () => {
    const result = computeSkillTree(makeUser(), 0, mockColors)
    for (const branch of result) {
      expect(branch.progress).toBe(0)
      expect(branch.nodes.every(n => !n.unlocked)).toBe(true)
    }
  })

  it('débloque les nœuds force selon totalPrs', () => {
    const result = computeSkillTree(makeUser({ totalPrs: 10 }), 0, mockColors)
    const force = result.find(b => b.id === 'force')!
    // seuils : 1, 5, 10, 25, 50, 100 → 3 débloqués (1, 5, 10)
    const unlocked = force.nodes.filter(n => n.unlocked)
    expect(unlocked).toHaveLength(3)
    expect(force.progress).toBeCloseTo(3 / 6)
  })

  it('débloque les nœuds endurance selon totalTonnage', () => {
    const result = computeSkillTree(makeUser({ totalTonnage: 30000 }), 0, mockColors)
    const endurance = result.find(b => b.id === 'endurance')!
    // seuils : 1000, 5000, 25000, 100000, 500000 → 3 débloqués
    const unlocked = endurance.nodes.filter(n => n.unlocked)
    expect(unlocked).toHaveLength(3)
  })

  it('débloque les nœuds mobilité selon exercices distincts', () => {
    const result = computeSkillTree(makeUser(), 15, mockColors)
    const mobilite = result.find(b => b.id === 'mobilite')!
    // seuils : 5, 10, 20, 30, 50 → 2 débloqués (5, 10)
    const unlocked = mobilite.nodes.filter(n => n.unlocked)
    expect(unlocked).toHaveLength(2)
    expect(mobilite.nextThreshold).toBe(20)
  })

  it('débloque les nœuds régularité selon bestStreak', () => {
    const result = computeSkillTree(makeUser({ bestStreak: 16 }), 0, mockColors)
    const regularite = result.find(b => b.id === 'regularite')!
    // seuils : 2, 4, 8, 16, 30, 52 → 4 débloqués
    const unlocked = regularite.nodes.filter(n => n.unlocked)
    expect(unlocked).toHaveLength(4)
  })

  it('progression entre 0 et 1', () => {
    const result = computeSkillTree(makeUser({ totalPrs: 999, totalTonnage: 999999, bestStreak: 999 }), 999, mockColors)
    for (const branch of result) {
      expect(branch.progress).toBeGreaterThanOrEqual(0)
      expect(branch.progress).toBeLessThanOrEqual(1)
    }
  })

  it('nextThreshold = -1 si tous débloqués', () => {
    const result = computeSkillTree(makeUser({ totalPrs: 999 }), 0, mockColors)
    const force = result.find(b => b.id === 'force')!
    expect(force.nextThreshold).toBe(-1)
    expect(force.progress).toBe(1)
  })
})
