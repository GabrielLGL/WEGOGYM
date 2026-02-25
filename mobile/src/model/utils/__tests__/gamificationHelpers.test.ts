import {
  xpForLevel,
  xpCumulativeForLevel,
  calculateLevel,
  xpToNextLevel,
  calculateSessionXP,
  BASE_XP_PER_SESSION,
  BONUS_XP_PER_PR,
  BONUS_XP_COMPLETION,
  getCurrentISOWeek,
  getPreviousISOWeek,
  updateStreak,
  calculateSessionTonnage,
  formatTonnage,
  detectMilestones,
} from '../gamificationHelpers'

// ─── XP & Niveaux ───────────────────────────────────────────────────────────

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0)
  })

  it('returns correct XP for level 2', () => {
    // 80 + 7*2 = 94
    expect(xpForLevel(2)).toBe(94)
  })

  it('returns correct XP for level 10', () => {
    // 80 + 7*10 = 150
    expect(xpForLevel(10)).toBe(150)
  })

  it('returns correct XP for level 100', () => {
    // 80 + 7*100 = 780
    expect(xpForLevel(100)).toBe(780)
  })
})

describe('xpCumulativeForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpCumulativeForLevel(1)).toBe(0)
  })

  it('returns xpForLevel(2) for level 2', () => {
    expect(xpCumulativeForLevel(2)).toBe(xpForLevel(2))
  })

  it('accumulates correctly for level 5', () => {
    const expected = xpForLevel(2) + xpForLevel(3) + xpForLevel(4) + xpForLevel(5)
    expect(xpCumulativeForLevel(5)).toBe(expected)
  })
})

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns level 1 for XP just below level 2', () => {
    expect(calculateLevel(xpForLevel(2) - 1)).toBe(1)
  })

  it('returns level 2 for exactly cumulative XP of level 2', () => {
    expect(calculateLevel(xpCumulativeForLevel(2))).toBe(2)
  })

  it('returns level 10 for cumulative XP of level 10', () => {
    expect(calculateLevel(xpCumulativeForLevel(10))).toBe(10)
  })

  it('returns level 25 for cumulative XP of level 25', () => {
    expect(calculateLevel(xpCumulativeForLevel(25))).toBe(25)
  })

  it('returns level 50 for cumulative XP of level 50', () => {
    expect(calculateLevel(xpCumulativeForLevel(50))).toBe(50)
  })

  it('returns level 75 for cumulative XP of level 75', () => {
    expect(calculateLevel(xpCumulativeForLevel(75))).toBe(75)
  })

  it('caps at level 100', () => {
    expect(calculateLevel(xpCumulativeForLevel(100))).toBe(100)
    expect(calculateLevel(xpCumulativeForLevel(100) + 999999)).toBe(100)
  })

  it('reaches level 100 in reasonable range (~450-550 sessions)', () => {
    const xpNeeded = xpCumulativeForLevel(100)
    // Average ~95 XP per session (80 base + occasional PR/completion bonuses)
    const estimatedSessions = xpNeeded / 95
    expect(estimatedSessions).toBeGreaterThan(350)
    expect(estimatedSessions).toBeLessThan(600)
  })
})

describe('xpToNextLevel', () => {
  it('returns 0% at start of a level', () => {
    const result = xpToNextLevel(xpCumulativeForLevel(5), 5)
    expect(result.current).toBe(0)
    expect(result.required).toBe(xpForLevel(6))
    expect(result.percentage).toBe(0)
  })

  it('returns 100% at max level', () => {
    const result = xpToNextLevel(xpCumulativeForLevel(100), 100)
    expect(result.percentage).toBe(100)
  })

  it('returns correct midpoint percentage', () => {
    const levelXp = xpCumulativeForLevel(5)
    const halfNext = Math.floor(xpForLevel(6) / 2)
    const result = xpToNextLevel(levelXp + halfNext, 5)
    expect(result.percentage).toBeGreaterThanOrEqual(45)
    expect(result.percentage).toBeLessThanOrEqual(55)
  })
})

describe('calculateSessionXP', () => {
  it('returns base XP with no bonuses', () => {
    expect(calculateSessionXP(0, false)).toBe(BASE_XP_PER_SESSION)
  })

  it('adds PR bonus', () => {
    expect(calculateSessionXP(2, false)).toBe(BASE_XP_PER_SESSION + 2 * BONUS_XP_PER_PR)
  })

  it('adds completion bonus', () => {
    expect(calculateSessionXP(0, true)).toBe(BASE_XP_PER_SESSION + BONUS_XP_COMPLETION)
  })

  it('adds both bonuses', () => {
    expect(calculateSessionXP(3, true)).toBe(
      BASE_XP_PER_SESSION + 3 * BONUS_XP_PER_PR + BONUS_XP_COMPLETION
    )
  })
})

// ─── Streak ─────────────────────────────────────────────────────────────────

describe('getCurrentISOWeek', () => {
  it('returns correct format', () => {
    const result = getCurrentISOWeek(new Date(2026, 1, 25)) // 25 Feb 2026
    expect(result).toMatch(/^\d{4}-W\d{2}$/)
  })

  it('returns W09 for Feb 25, 2026', () => {
    const result = getCurrentISOWeek(new Date(2026, 1, 25))
    expect(result).toBe('2026-W09')
  })
})

describe('getPreviousISOWeek', () => {
  it('returns previous week', () => {
    expect(getPreviousISOWeek('2026-W09')).toBe('2026-W08')
  })

  it('handles year boundary', () => {
    const result = getPreviousISOWeek('2026-W01')
    expect(result).toMatch(/^2025-W\d{2}$/)
  })
})

describe('updateStreak', () => {
  it('does nothing if same week already evaluated', () => {
    const result = updateStreak('2026-W09', 3, 5, 3, 3, '2026-W09')
    expect(result.currentStreak).toBe(3)
    expect(result.bestStreak).toBe(5)
  })

  it('does not update streak if target not met', () => {
    const result = updateStreak('2026-W08', 3, 5, 3, 2, '2026-W09')
    expect(result.currentStreak).toBe(3)
  })

  it('increments streak when target met and previous week was validated', () => {
    const result = updateStreak('2026-W08', 3, 5, 3, 3, '2026-W09')
    expect(result.currentStreak).toBe(4)
    expect(result.lastWorkoutWeek).toBe('2026-W09')
  })

  it('resets to 1 when weeks were missed', () => {
    const result = updateStreak('2026-W05', 3, 5, 3, 3, '2026-W09')
    expect(result.currentStreak).toBe(1)
    expect(result.bestStreak).toBe(5)
  })

  it('starts streak at 1 from null', () => {
    const result = updateStreak(null, 0, 0, 3, 3, '2026-W09')
    expect(result.currentStreak).toBe(1)
    expect(result.bestStreak).toBe(1)
  })

  it('updates best streak if new streak exceeds it', () => {
    const result = updateStreak('2026-W08', 5, 5, 3, 4, '2026-W09')
    expect(result.currentStreak).toBe(6)
    expect(result.bestStreak).toBe(6)
  })
})

// ─── Tonnage ────────────────────────────────────────────────────────────────

describe('calculateSessionTonnage', () => {
  it('returns 0 for empty sets', () => {
    expect(calculateSessionTonnage([])).toBe(0)
  })

  it('calculates correctly for one set', () => {
    expect(calculateSessionTonnage([{ weight: 80, reps: 10 }])).toBe(800)
  })

  it('sums multiple sets', () => {
    const sets = [
      { weight: 80, reps: 10 },
      { weight: 100, reps: 5 },
      { weight: 60, reps: 12 },
    ]
    expect(calculateSessionTonnage(sets)).toBe(800 + 500 + 720)
  })
})

describe('formatTonnage', () => {
  it('formats 0 as "0 kg"', () => {
    expect(formatTonnage(0)).toBe('0 kg')
  })

  it('formats 500 as "500 kg"', () => {
    expect(formatTonnage(500)).toBe('500 kg')
  })

  it('formats 999 as "999 kg"', () => {
    expect(formatTonnage(999)).toBe('999 kg')
  })

  it('formats 1000 as "1.0 t"', () => {
    expect(formatTonnage(1000)).toBe('1.0 t')
  })

  it('formats 32500 as "32.5 t"', () => {
    expect(formatTonnage(32500)).toBe('32.5 t')
  })
})

// ─── Milestones ─────────────────────────────────────────────────────────────

describe('detectMilestones', () => {
  it('returns empty for no milestones', () => {
    const before = { totalSessions: 5, totalTonnage: 500, level: 3 }
    const after = { totalSessions: 6, totalTonnage: 600, level: 3 }
    expect(detectMilestones(before, after)).toHaveLength(0)
  })

  it('detects level-up', () => {
    const before = { totalSessions: 5, totalTonnage: 500, level: 3 }
    const after = { totalSessions: 6, totalTonnage: 600, level: 4 }
    const milestones = detectMilestones(before, after)
    expect(milestones).toHaveLength(1)
    expect(milestones[0].type).toBe('levelup')
    expect(milestones[0].value).toBe(4)
  })

  it('detects session milestone', () => {
    const before = { totalSessions: 9, totalTonnage: 500, level: 3 }
    const after = { totalSessions: 10, totalTonnage: 600, level: 3 }
    const milestones = detectMilestones(before, after)
    expect(milestones).toHaveLength(1)
    expect(milestones[0].type).toBe('session')
    expect(milestones[0].value).toBe(10)
  })

  it('detects tonnage milestone', () => {
    const before = { totalSessions: 5, totalTonnage: 9500, level: 3 }
    const after = { totalSessions: 6, totalTonnage: 10500, level: 3 }
    const milestones = detectMilestones(before, after)
    expect(milestones).toHaveLength(1)
    expect(milestones[0].type).toBe('tonnage')
    expect(milestones[0].value).toBe(10_000)
  })

  it('detects multiple milestones at once', () => {
    const before = { totalSessions: 9, totalTonnage: 9500, level: 3 }
    const after = { totalSessions: 10, totalTonnage: 10500, level: 4 }
    const milestones = detectMilestones(before, after)
    expect(milestones).toHaveLength(3)
    expect(milestones.map(m => m.type)).toContain('levelup')
    expect(milestones.map(m => m.type)).toContain('session')
    expect(milestones.map(m => m.type)).toContain('tonnage')
  })

  it('does not re-trigger already passed milestones', () => {
    const before = { totalSessions: 11, totalTonnage: 11000, level: 5 }
    const after = { totalSessions: 12, totalTonnage: 12000, level: 5 }
    expect(detectMilestones(before, after)).toHaveLength(0)
  })
})
