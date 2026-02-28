/**
 * Tests for BadgeCard.tsx — stateless component.
 * ThemeContext is globally mocked via jest.config.js moduleNameMapper.
 */
import React from 'react'
import { render } from '@testing-library/react-native'
import { BadgeCard } from '../BadgeCard'
import type { BadgeDefinition } from '../../model/utils/badgeConstants'

const makeBadge = (overrides: Partial<BadgeDefinition> = {}): BadgeDefinition => ({
  id: 'test_badge',
  title: 'Titre du badge',
  emoji: '🏋️',
  description: 'Description du badge',
  category: 'sessions',
  threshold: 10,
  ...overrides,
})

describe('BadgeCard', () => {
  it('renders badge emoji', () => {
    const badge = makeBadge({ emoji: '🏆' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('🏆')).toBeTruthy()
  })

  it('renders badge title', () => {
    const badge = makeBadge({ title: 'Centurion' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('Centurion')).toBeTruthy()
  })

  it('renders without crashing when unlocked=false', () => {
    const badge = makeBadge()
    expect(() => render(<BadgeCard badge={badge} unlocked={false} />)).not.toThrow()
  })

  it('renders without crashing when unlockedAt is provided', () => {
    const badge = makeBadge()
    const unlockedAt = new Date(2026, 0, 15)
    expect(() =>
      render(<BadgeCard badge={badge} unlocked={true} unlockedAt={unlockedAt} />)
    ).not.toThrow()
  })

  it('renders when unlocked=true', () => {
    const badge = makeBadge({ title: 'Lancé' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={true} />)
    expect(getByText('Lancé')).toBeTruthy()
  })

  it('renders when unlocked=false (locked state)', () => {
    const badge = makeBadge({ title: 'Élite' })
    const { getByText } = render(<BadgeCard badge={badge} unlocked={false} />)
    expect(getByText('Élite')).toBeTruthy()
  })
})
