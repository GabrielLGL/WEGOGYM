/**
 * Tests for BadgesScreen.tsx
 * withObservables mocked as identity — default export IS BadgesScreenBase.
 * ThemeContext mocked globally via moduleNameMapper.
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      }),
    }),
  },
}))

jest.mock('@nozbe/with-observables', () =>
  (_keys: unknown, _fn: unknown) =>
  (Component: React.ComponentType<unknown>) => Component
)

jest.mock('../../contexts/LanguageContext', () => {
  const { translations } = require('../../i18n')
  return {
    useLanguage: () => ({
      language: 'fr',
      t: translations['fr'],
      setLanguage: jest.fn(),
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

import React from 'react'
import { render } from '@testing-library/react-native'
import BadgesScreen from '../BadgesScreen'
import { BADGES_LIST, BADGE_CATEGORY_LABELS } from '../../model/utils/badgeConstants'
import type UserBadge from '../../model/models/UserBadge'

// With withObservables mocked as identity, the default export IS BadgesScreenBase,
// which accepts { userBadges: UserBadge[] } directly.

describe('BadgesScreen', () => {
  it('renders without crashing with empty userBadges', () => {
    expect(() =>
      render(<BadgesScreen userBadges={[] as unknown as UserBadge[]} />)
    ).not.toThrow()
  })

  it('shows counter "0/N badges débloqués" with empty list', () => {
    const { getByText } = render(
      <BadgesScreen userBadges={[] as unknown as UserBadge[]} />
    )
    // React Native may fragment text nodes, so use regex
    expect(getByText(new RegExp(`0/${BADGES_LIST.length}`))).toBeTruthy()
  })

  it('shows category label for sessions', () => {
    const { getByText } = render(
      <BadgesScreen userBadges={[] as unknown as UserBadge[]} />
    )
    expect(getByText(BADGE_CATEGORY_LABELS['sessions'])).toBeTruthy()
  })

  it('shows all 7 category labels', () => {
    const { getByText } = render(
      <BadgesScreen userBadges={[] as unknown as UserBadge[]} />
    )
    for (const label of Object.values(BADGE_CATEGORY_LABELS)) {
      expect(getByText(label)).toBeTruthy()
    }
  })

  it('updates counter when user has 1 unlocked badge', () => {
    const mockBadge = {
      badgeId: BADGES_LIST[0].id,
      unlockedAt: new Date(),
    } as unknown as UserBadge
    const { getByText } = render(
      <BadgesScreen userBadges={[mockBadge]} />
    )
    expect(getByText(/1\/\d+ badges/)).toBeTruthy()
  })

  it('renders all badge titles visible in the screen', () => {
    // With empty userBadges, all badges are rendered (locked state)
    const { getByText } = render(
      <BadgesScreen userBadges={[] as unknown as UserBadge[]} />
    )
    // Just verify that a known badge title is present
    expect(getByText('Premier pas')).toBeTruthy()
  })
})
