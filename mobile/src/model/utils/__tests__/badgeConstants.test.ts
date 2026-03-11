/**
 * Tests for badgeConstants.ts — BADGES_LIST
 */
import { BADGES_LIST } from '../badgeConstants'

describe('BADGES_LIST', () => {
  it('contains badges', () => {
    expect(BADGES_LIST.length).toBeGreaterThan(0)
  })

  it('each badge has required fields', () => {
    for (const badge of BADGES_LIST) {
      expect(typeof badge.id).toBe('string')
      expect(badge.id.length).toBeGreaterThan(0)
      expect(typeof badge.icon).toBe('string')
      expect(typeof badge.category).toBe('string')
      expect(typeof badge.threshold).toBe('number')
      expect(badge.threshold).toBeGreaterThan(0)
    }
  })

  it('has no duplicate IDs', () => {
    const ids = BADGES_LIST.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all badge categories', () => {
    const categories = new Set(BADGES_LIST.map(b => b.category))
    expect(categories).toContain('sessions')
    expect(categories).toContain('tonnage')
    expect(categories).toContain('streak')
    expect(categories).toContain('level')
    expect(categories).toContain('pr')
    expect(categories).toContain('session_volume')
    expect(categories).toContain('exercises')
  })
})
