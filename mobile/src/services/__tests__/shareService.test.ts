/**
 * Tests for shareService — text generators & share actions
 */
import { Share } from 'react-native'
import * as Sharing from 'expo-sharing'
import {
  generateWorkoutShareText,
  generateBadgeShareText,
  generatePRShareText,
  shareText,
  shareImage,
} from '../shareService'
import type { WorkoutShareData, BadgeShareData, PRShareData } from '../shareService'
import { fr } from '../../i18n/fr'
import type { Translations } from '../../i18n'

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}))

const t = fr as Translations

describe('shareService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── generateWorkoutShareText ─────────────────────────────────

  describe('generateWorkoutShareText', () => {
    const baseData: WorkoutShareData = {
      durationSeconds: 3720, // 1h 02min
      totalVolume: 8500,
      totalSets: 24,
      totalPrs: 0,
      xpGained: 150,
      level: 5,
      currentStreak: 3,
      newBadges: [],
      exerciseNames: ['Bench Press', 'Squat'],
    }

    it('formats duration correctly (hours + minutes)', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).toContain('1h 02min')
    })

    it('formats volume with space separator', () => {
      const text = generateWorkoutShareText(baseData, t)
      // 8500 → "8\u00A0500"
      expect(text).toContain('8\u00A0500 kg')
    })

    it('includes sets count', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).toContain('24')
    })

    it('includes XP and level', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).toContain('+150 XP')
      expect(text).toContain(`${t.share.level} 5`)
    })

    it('includes streak', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).toContain(`3 ${t.share.streakWeeks}`)
    })

    it('includes PRs line when totalPrs > 0', () => {
      const text = generateWorkoutShareText({ ...baseData, totalPrs: 2 }, t)
      expect(text).toContain(`2 ${t.share.prsBeaten}`)
    })

    it('omits PRs line when totalPrs = 0', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).not.toContain(t.share.prsBeaten)
    })

    it('includes badge lines when newBadges present', () => {
      const data = {
        ...baseData,
        newBadges: [{ title: 'First Blood', icon: '🏆' }],
      }
      const text = generateWorkoutShareText(data, t)
      expect(text).toContain(`${t.share.badgeUnlocked} : First Blood`)
    })

    it('includes hashtags', () => {
      const text = generateWorkoutShareText(baseData, t)
      expect(text).toContain(t.share.hashtags)
    })

    it('handles minutes-only duration (< 1 hour)', () => {
      const text = generateWorkoutShareText({ ...baseData, durationSeconds: 2700 }, t)
      expect(text).toContain('45min')
      expect(text).not.toContain('h')
    })
  })

  // ── generateBadgeShareText ───────────────────────────────────

  describe('generateBadgeShareText', () => {
    const badgeData: BadgeShareData = {
      title: 'Premier Entraînement',
      description: 'Compléter votre premier entraînement',
      icon: '🏅',
      category: 'milestone',
      unlockedAt: new Date('2026-01-15'),
    }

    it('includes badge title', () => {
      const text = generateBadgeShareText(badgeData, t)
      expect(text).toContain(t.share.badgeTitle)
    })

    it('includes icon and title on same line', () => {
      const text = generateBadgeShareText(badgeData, t)
      expect(text).toContain('🏅 Premier Entraînement')
    })

    it('includes description', () => {
      const text = generateBadgeShareText(badgeData, t)
      expect(text).toContain('Compléter votre premier entraînement')
    })

    it('includes hashtags', () => {
      const text = generateBadgeShareText(badgeData, t)
      expect(text).toContain(t.share.hashtags)
    })
  })

  // ── generatePRShareText ──────────────────────────────────────

  describe('generatePRShareText', () => {
    const prData: PRShareData = {
      exerciseName: 'Bench Press',
      weight: 100,
      reps: 5,
      estimated1RM: 116,
      date: new Date('2026-03-01'),
    }

    it('includes PR title', () => {
      const text = generatePRShareText(prData, t)
      expect(text).toContain(t.share.prTitle)
    })

    it('includes exercise name, weight and reps', () => {
      const text = generatePRShareText(prData, t)
      expect(text).toContain('Bench Press : 100 kg × 5 reps')
    })

    it('includes estimated 1RM', () => {
      const text = generatePRShareText(prData, t)
      expect(text).toContain(`${t.share.estimated1RM} : 116 kg`)
    })

    it('formats large weights with space separator', () => {
      const data = { ...prData, weight: 1500, estimated1RM: 1750 }
      const text = generatePRShareText(data, t)
      expect(text).toContain('1\u00A0500 kg')
      expect(text).toContain('1\u00A0750 kg')
    })
  })

  // ── shareText ────────────────────────────────────────────────

  describe('shareText', () => {
    it('calls Share.share with message', async () => {
      const spy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as never)
      await shareText('Hello world')
      expect(spy).toHaveBeenCalledWith({ message: 'Hello world' })
      spy.mockRestore()
    })
  })

  // ── shareImage ───────────────────────────────────────────────

  describe('shareImage', () => {
    it('returns early when ref.current is null', async () => {
      const ref = { current: null } as never
      await shareImage(ref)
      expect(Sharing.shareAsync).not.toHaveBeenCalled()
    })

    it('returns early when capture is undefined', async () => {
      const ref = { current: {} } as never
      await shareImage(ref)
      expect(Sharing.shareAsync).not.toHaveBeenCalled()
    })

    it('captures and shares image', async () => {
      const mockCapture = jest.fn().mockResolvedValue('file:///tmp/shot.png')
      const ref = { current: { capture: mockCapture } } as never
      await shareImage(ref)
      expect(mockCapture).toHaveBeenCalled()
      expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///tmp/shot.png', { mimeType: 'image/png' })
    })
  })
})
