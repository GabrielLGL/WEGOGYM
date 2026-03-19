import { computePersonalChallenges } from '../personalChallengesHelpers'
import { mockUser } from './testFactories'

describe('computePersonalChallenges', () => {
  it('génère des challenges même avec zéro données', () => {
    const user = mockUser()
    const result = computePersonalChallenges(user, 0)
    expect(result.length).toBeGreaterThan(0)
  })

  it('retourne exactement 12 challenges (un par définition)', () => {
    const user = mockUser()
    const result = computePersonalChallenges(user, 0)
    expect(result.length).toBe(12)
  })

  it('chaque challenge a une progression entre 0 et 1', () => {
    const user = mockUser({ totalTonnage: 100000, totalPrs: 50, bestStreak: 10, level: 20 })
    const result = computePersonalChallenges(user, 75)
    for (const c of result) {
      expect(c.progress).toBeGreaterThanOrEqual(0)
      expect(c.progress).toBeLessThanOrEqual(1)
    }
  })

  it('marque completed quand progression >= 1', () => {
    const user = mockUser({ totalTonnage: 2000000, totalPrs: 600, bestStreak: 30, level: 60 })
    const result = computePersonalChallenges(user, 300)
    const completed = result.filter(c => c.completed)
    expect(completed.length).toBeGreaterThan(0)
    for (const c of completed) {
      expect(c.progress).toBe(1) // clampé à 1
    }
  })

  it('trie non-complétés en premier par progression décroissante', () => {
    const user = mockUser({ totalTonnage: 40000, totalPrs: 20, bestStreak: 3, level: 10 })
    const result = computePersonalChallenges(user, 40)
    const incomplete = result.filter(c => !c.completed)
    for (let i = 1; i < incomplete.length; i++) {
      expect(incomplete[i - 1].progress).toBeGreaterThanOrEqual(incomplete[i].progress)
    }
  })

  it('les challenges complétés sont après les non-complétés', () => {
    const user = mockUser({ totalTonnage: 100000, totalPrs: 30, bestStreak: 5, level: 55 })
    const result = computePersonalChallenges(user, 120)
    const firstCompleted = result.findIndex(c => c.completed)
    if (firstCompleted >= 0) {
      // Tous les éléments après le premier complété sont aussi complétés
      for (let i = firstCompleted; i < result.length; i++) {
        expect(result[i].completed).toBe(true)
      }
    }
  })

  it('chaque challenge a un id, icon, unit et difficulty', () => {
    const user = mockUser()
    const result = computePersonalChallenges(user, 0)
    for (const c of result) {
      expect(c.id).toBeTruthy()
      expect(c.icon).toBeTruthy()
      expect(c.unit).toBeTruthy()
      expect(['easy', 'medium', 'hard', 'legendary']).toContain(c.difficulty)
    }
  })
})
