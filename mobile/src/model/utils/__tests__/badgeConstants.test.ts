/**
 * Tests for badgeConstants.ts — BADGES_LIST, getBadgeById, BADGE_CATEGORY_LABELS
 */
import { BADGES_LIST, getBadgeById, BADGE_CATEGORY_LABELS, type BadgeCategory } from '../badgeConstants'

describe('BADGES_LIST', () => {
  it('contains badges', () => {
    expect(BADGES_LIST.length).toBeGreaterThan(0)
  })

  it('each badge has required fields', () => {
    for (const badge of BADGES_LIST) {
      expect(typeof badge.id).toBe('string')
      expect(badge.id.length).toBeGreaterThan(0)
      expect(typeof badge.title).toBe('string')
      expect(typeof badge.icon).toBe('string')
      expect(typeof badge.description).toBe('string')
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

describe('getBadgeById', () => {
  it('returns the badge for a valid ID', () => {
    const badge = getBadgeById('sessions_1')
    expect(badge).toBeDefined()
    expect(badge!.id).toBe('sessions_1')
    expect(badge!.category).toBe('sessions')
  })

  it('returns undefined for an unknown ID', () => {
    expect(getBadgeById('nonexistent')).toBeUndefined()
  })
})

describe('BADGE_CATEGORY_LABELS', () => {
  it('has a label for each category', () => {
    const categories: BadgeCategory[] = [
      'sessions', 'tonnage', 'streak', 'level', 'pr', 'session_volume', 'exercises',
    ]
    for (const cat of categories) {
      expect(typeof BADGE_CATEGORY_LABELS[cat]).toBe('string')
      expect(BADGE_CATEGORY_LABELS[cat].length).toBeGreaterThan(0)
    }
  })
})
