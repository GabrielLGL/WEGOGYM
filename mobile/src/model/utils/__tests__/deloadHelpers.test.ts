import { computeDeloadRecommendation } from '../deloadHelpers'
import { DAY_MS } from '../../constants'

// Helper: create a history entry for a given day offset (0 = today)
function makeHistory(dayOffset: number, now: number, overrides?: { isAbandoned?: boolean; deletedAt?: number }) {
  return {
    startTime: now - dayOffset * DAY_MS + 3600_000, // +1h to be mid-day
    endTime: now - dayOffset * DAY_MS + 7200_000,
    ...overrides,
  }
}

// Helper: stable volumes (100 per week)
function stableVolumes(weeks: number, value = 100): number[] {
  return Array.from({ length: weeks }, () => value)
}

const NOW = 1_700_000_000_000 // fixed timestamp for deterministic tests

describe('computeDeloadRecommendation', () => {
  describe('returns null', () => {
    it('when not enough history (< 3 weeks of volume data)', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(0, NOW)],
        weeklyVolumes: [100, 100], // only 2 weeks
        userLevel: 'intermediate',
        currentStreak: 1,
        now: NOW,
      })
      expect(result).toBeNull()
    })

    it('when everything is normal (3 sessions/week, stable volume)', () => {
      // 3 sessions per week, no consecutive overload
      const histories = [
        makeHistory(0, NOW),
        makeHistory(2, NOW),
        makeHistory(4, NOW),
      ]
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 3,
        now: NOW,
      })
      expect(result).toBeNull()
    })
  })

  describe('rest_day warning — consecutive days', () => {
    it('triggers when training 7+ consecutive days', () => {
      const histories = Array.from({ length: 7 }, (_, i) => makeHistory(i, NOW))
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('rest_day')
      expect(result!.severity).toBe('warning')
      expect(result!.reasonKey).toBe('consecutiveDays')
      expect(result!.reasonParams?.days).toBe(7)
    })

    it('does not trigger at exactly 6 consecutive days', () => {
      const histories = Array.from({ length: 6 }, (_, i) => makeHistory(i, NOW))
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      // 6 days = threshold, not above it, so no consecutive days warning
      expect(result?.reasonKey).not.toBe('consecutiveDays')
    })

    it('filters out deleted and abandoned histories', () => {
      const histories = [
        makeHistory(0, NOW),
        makeHistory(1, NOW),
        makeHistory(2, NOW),
        makeHistory(3, NOW),
        makeHistory(4, NOW),
        makeHistory(5, NOW),
        makeHistory(6, NOW, { isAbandoned: true }), // abandoned — should be filtered
        makeHistory(7, NOW, { deletedAt: NOW }), // deleted — should be filtered
      ]
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      // Only 6 valid consecutive (0-5), not above threshold for consecutiveDays
      // (may still trigger fewRestDays — that's a different signal)
      expect(result?.reasonKey).not.toBe('consecutiveDays')
    })
  })

  describe('reduce_volume — volume spike', () => {
    it('triggers when current week volume is 140% of average', () => {
      const weeklyVolumes = [140, 100, 100, 100, 100] // 140% of avg 100
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)], // avoid consecutive days trigger
        weeklyVolumes,
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('reduce_volume')
      expect(result!.severity).toBe('warning')
      expect(result!.reasonKey).toBe('volumeSpike')
      expect(result!.reasonParams?.percent).toBe(40)
    })

    it('does not trigger at exactly 130% (ratio must be > threshold)', () => {
      const weeklyVolumes = [130, 100, 100, 100, 100]
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes,
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result?.type).not.toBe('reduce_volume')
    })
  })

  describe('deload_week — long training block', () => {
    it('triggers when streak is 7+ weeks', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(8),
        userLevel: 'intermediate',
        currentStreak: 7,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('deload_week')
      expect(result!.severity).toBe('suggestion')
      expect(result!.reasonKey).toBe('longBlock')
      expect(result!.reasonParams?.weeks).toBe(7)
    })

    it('triggers at exactly 6 weeks (>= threshold)', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(7),
        userLevel: 'intermediate',
        currentStreak: 6,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('deload_week')
    })

    it('does not trigger at 5 weeks', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(6),
        userLevel: 'intermediate',
        currentStreak: 5,
        now: NOW,
      })
      expect(result?.type).not.toBe('deload_week')
    })
  })

  describe('muscle_overload', () => {
    it('triggers when chest sets exceed MRV for intermediate', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(5),
        setsPerMuscle: { chest: 25 },
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('muscle_overload')
      expect(result!.severity).toBe('suggestion')
      expect(result!.affectedMuscles).toContain('chest')
    })

    it('does not trigger when within MRV', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(5),
        setsPerMuscle: { chest: 15 },
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result?.type).not.toBe('muscle_overload')
    })

    it('uses beginner thresholds for beginner level', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(5),
        setsPerMuscle: { chest: 15 }, // > 14 for beginner
        userLevel: 'beginner',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('muscle_overload')
    })

    it('falls back to intermediate thresholds for unknown level', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(5),
        setsPerMuscle: { chest: 25 },
        userLevel: 'unknown_level',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('muscle_overload')
    })
  })

  describe('rest_day suggestion — few rest days', () => {
    it('triggers when 6 out of 7 days have workouts (1 rest day < 2)', () => {
      // Train 6 of last 7 days (skip day 3)
      const histories = [0, 1, 2, 4, 5, 6].map(d => makeHistory(d, NOW))
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('rest_day')
      expect(result!.severity).toBe('suggestion')
      expect(result!.reasonKey).toBe('fewRestDays')
      expect(result!.reasonParams?.restDays).toBe(1)
    })

    it('does not trigger when 2+ rest days', () => {
      // Train 5 of last 7 days (skip days 3 and 5)
      const histories = [0, 1, 2, 4, 6].map(d => makeHistory(d, NOW))
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes: stableVolumes(5),
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result?.reasonKey).not.toBe('fewRestDays')
    })
  })

  describe('priority ordering', () => {
    it('consecutive days (warning) takes priority over volume spike', () => {
      const histories = Array.from({ length: 7 }, (_, i) => makeHistory(i, NOW))
      const weeklyVolumes = [200, 100, 100, 100, 100] // also spike
      const result = computeDeloadRecommendation({
        histories,
        weeklyVolumes,
        userLevel: 'intermediate',
        currentStreak: 2,
        now: NOW,
      })
      expect(result!.type).toBe('rest_day')
      expect(result!.severity).toBe('warning')
      expect(result!.reasonKey).toBe('consecutiveDays')
    })

    it('volume spike takes priority over deload week', () => {
      const weeklyVolumes = [200, 100, 100, 100, 100]
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes,
        userLevel: 'intermediate',
        currentStreak: 8, // also long block
        now: NOW,
      })
      expect(result!.type).toBe('reduce_volume')
    })

    it('deload week takes priority over muscle overload', () => {
      const result = computeDeloadRecommendation({
        histories: [makeHistory(2, NOW)],
        weeklyVolumes: stableVolumes(8),
        setsPerMuscle: { chest: 25 }, // also overload
        userLevel: 'intermediate',
        currentStreak: 7,
        now: NOW,
      })
      expect(result!.type).toBe('deload_week')
    })
  })
})
