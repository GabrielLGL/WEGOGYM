/**
 * Tests for BadgeCelebration.tsx — uses BottomSheet + Portal.
 * ThemeContext mocked globally via moduleNameMapper.
 */
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { BadgeCelebration } from '../BadgeCelebration'
import type { BadgeDefinition } from '../../model/utils/badgeConstants'

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

const makeBadge = (overrides: Partial<BadgeDefinition> = {}): BadgeDefinition => ({
  id: 'first_badge',
  title: 'Premier pas',
  icon: 'barbell-outline',
  description: 'La première, la plus importante.',
  category: 'sessions',
  threshold: 1,
  ...overrides,
})

describe('BadgeCelebration', () => {
  // Use fake timers to prevent Animated.timing from firing real setTimeout
  // callbacks after Jest environment teardown (avoids "torn down" error).
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when badge is null', () => {
    const { queryByText } = render(
      <BadgeCelebration visible={true} badge={null} onClose={jest.fn()} />
    )
    expect(queryByText('Nouveau badge !')).toBeNull()
  })

  it('renders badge headline when visible with a badge', () => {
    const badge = makeBadge()
    const { getByText } = render(
      <BadgeCelebration visible={true} badge={badge} onClose={jest.fn()} />
    )
    expect(getByText('Nouveau badge !')).toBeTruthy()
  })

  it('renders badge title', () => {
    const badge = makeBadge({ title: 'Centurion' })
    const { getByText } = render(
      <BadgeCelebration visible={true} badge={badge} onClose={jest.fn()} />
    )
    expect(getByText('Centurion')).toBeTruthy()
  })

  it('renders badge description', () => {
    const badge = makeBadge({ description: 'Un grand accomplissement.' })
    const { getByText } = render(
      <BadgeCelebration visible={true} badge={badge} onClose={jest.fn()} />
    )
    expect(getByText('Un grand accomplissement.')).toBeTruthy()
  })

  it('renders without crashing with icon', () => {
    const badge = makeBadge({ icon: 'trophy-outline' })
    expect(() =>
      render(<BadgeCelebration visible={true} badge={badge} onClose={jest.fn()} />)
    ).not.toThrow()
  })

  it('calls onClose when "Super !" button is pressed', () => {
    const onClose = jest.fn()
    const badge = makeBadge()
    const { getByText } = render(
      <BadgeCelebration visible={true} badge={badge} onClose={onClose} />
    )
    fireEvent.press(getByText('Super !'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render badge content when visible=false (BottomSheet hides children)', () => {
    const badge = makeBadge({ title: 'Élite' })
    const { queryByText } = render(
      <BadgeCelebration visible={false} badge={badge} onClose={jest.fn()} />
    )
    // BottomSheet does not mount children when visible=false
    expect(queryByText('Élite')).toBeNull()
  })
})
