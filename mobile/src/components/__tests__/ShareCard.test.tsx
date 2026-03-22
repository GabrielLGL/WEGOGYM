/**
 * Tests for ShareCard component — all 3 variants
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import ShareCard from '../ShareCard'
import type { WorkoutShareCardProps, BadgeShareCardProps, PRShareCardProps } from '../ShareCard'

describe('ShareCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── Workout variant ──────────────────────────────────────────

  describe('workout variant', () => {
    const props: WorkoutShareCardProps = {
      variant: 'workout',
      durationSeconds: 3720, // 1h 02min
      totalVolume: 8500,
      totalSets: 24,
      totalPrs: 2,
      xpGained: 150,
      level: 5,
      currentStreak: 3,
      newBadges: [],
    }

    it('renders without crashing', () => {
      const { toJSON } = render(<ShareCard {...props} />)
      expect(toJSON()).toBeTruthy()
    })

    it('displays sets count', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('24')).toBeTruthy()
    })

    it('displays PRs count', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('2')).toBeTruthy()
    })

    it('displays XP gained', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText(/\+150/)).toBeTruthy()
    })

    it('displays level', () => {
      const { getAllByText } = render(<ShareCard {...props} />)
      // Level 5 appears in gamification bar
      expect(getAllByText(/5/).length).toBeGreaterThan(0)
    })

    it('displays badge items when present', () => {
      const propsWithBadges = {
        ...props,
        newBadges: [{ title: 'First Blood', icon: '🏆' }],
      }
      const { getByText } = render(<ShareCard {...propsWithBadges} />)
      expect(getByText('First Blood')).toBeTruthy()
      expect(getByText('🏆')).toBeTruthy()
    })

    it('hides badge row when no badges', () => {
      const { queryByText } = render(<ShareCard {...props} />)
      expect(queryByText('First Blood')).toBeNull()
    })

    it('formats duration with hours', () => {
      const { getByText } = render(<ShareCard {...props} />)
      // 3720s = 62 min = 1h 02min
      expect(getByText(/1.*02/)).toBeTruthy()
    })

    it('formats duration without hours for < 60min', () => {
      const { getByText } = render(
        <ShareCard {...props} durationSeconds={2700} />,
      )
      // 2700s = 45 min
      expect(getByText(/45/)).toBeTruthy()
    })

    it('formats exact hour without minutes', () => {
      const { toJSON } = render(
        <ShareCard {...props} durationSeconds={3600} />,
      )
      // 3600s = 60 min = 1h exact — renders without crash
      expect(toJSON()).toBeTruthy()
    })
  })

  // ── Badge variant ────────────────────────────────────────────

  describe('badge variant', () => {
    const props: BadgeShareCardProps = {
      variant: 'badge',
      title: 'Premier Entraînement',
      description: 'Compléter votre premier workout',
      icon: '🏅',
      category: 'milestone',
    }

    it('renders without crashing', () => {
      const { toJSON } = render(<ShareCard {...props} />)
      expect(toJSON()).toBeTruthy()
    })

    it('displays badge title', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('Premier Entraînement')).toBeTruthy()
    })

    it('displays badge description', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('Compléter votre premier workout')).toBeTruthy()
    })

    it('displays badge icon', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('🏅')).toBeTruthy()
    })

    it('displays badge category', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('milestone')).toBeTruthy()
    })
  })

  // ── PR variant ───────────────────────────────────────────────

  describe('pr variant', () => {
    const props: PRShareCardProps = {
      variant: 'pr',
      exerciseName: 'Bench Press',
      weight: 100,
      reps: 5,
      estimated1RM: 116,
    }

    it('renders without crashing', () => {
      const { toJSON } = render(<ShareCard {...props} />)
      expect(toJSON()).toBeTruthy()
    })

    it('displays exercise name', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText('Bench Press')).toBeTruthy()
    })

    it('displays weight and reps', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText(/100.*5/)).toBeTruthy()
    })

    it('displays estimated 1RM', () => {
      const { getByText } = render(<ShareCard {...props} />)
      expect(getByText(/116/)).toBeTruthy()
    })
  })
})
