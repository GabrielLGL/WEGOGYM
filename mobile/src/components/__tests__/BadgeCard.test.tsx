/**
 * Tests for BadgeCard.tsx — stateless component.
 * ThemeContext is globally mocked via jest.config.js moduleNameMapper.
 * LanguageContext is globally mocked to return fr translations.
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import { BadgeCard } from '../BadgeCard'
import type { BadgeDefinition } from '../../model/utils/badgeConstants'

const makeBadge = (overrides: Partial<BadgeDefinition> = {}): BadgeDefinition => ({
  id: 'test_badge',
  icon: 'barbell-outline',
  category: 'sessions',
  threshold: 10,
  ...overrides,
})

describe('BadgeCard', () => {
  it('renders without crashing with icon', () => {
    const badge = makeBadge({ icon: 'trophy-outline' })
    expect(() => render(<BadgeCard badge={badge} unlocked={true} />)).not.toThrow()
  })

  it('renders i18n title for known badge id', () => {
    const badge = makeBadge({ id: 'sessions_100' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('Centurion')).toBeTruthy()
  })

  it('falls back to badge.id for unknown badge id', () => {
    const badge = makeBadge({ id: 'unknown_badge' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('unknown_badge')).toBeTruthy()
  })

  it('renders without crashing when unlocked=false', () => {
    const badge = makeBadge()
    expect(() => render(<BadgeCard badge={badge} unlocked={false} />)).not.toThrow()
  })

  it('renders without crashing when unlocked=true', () => {
    const badge = makeBadge()
    expect(() =>
      render(<BadgeCard badge={badge} unlocked={true} />)
    ).not.toThrow()
  })

  it('renders when unlocked=true with known badge', () => {
    const badge = makeBadge({ id: 'sessions_10' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('Lancé')).toBeTruthy()
  })

  it('renders when unlocked=false (locked state)', () => {
    const badge = makeBadge({ id: 'sessions_250' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={false} />)
    expect(getByText('Élite')).toBeTruthy()
  })
})
