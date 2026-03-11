/**
 * Tests for DeloadRecommendationCard.tsx
 * ThemeContext is globally mocked via jest.config.js moduleNameMapper.
 * LanguageContext is globally mocked to return fr translations.
 */
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import DeloadRecommendationCard from '../DeloadRecommendationCard'
import type { DeloadRecommendation } from '../DeloadRecommendationCard'

describe('DeloadRecommendationCard', () => {
  const mockOnDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeRecommendation = (overrides: Partial<DeloadRecommendation> = {}): DeloadRecommendation => ({
    type: 'rest_day',
    severity: 'warning',
    reasonKey: 'consecutiveDays',
    reasonParams: { days: 7 },
    ...overrides,
  })

  it('renders rest_day recommendation', () => {
    const { getAllByText } = render(
      <DeloadRecommendationCard
        recommendation={makeRecommendation()}
        onDismiss={mockOnDismiss}
      />
    )
    // Title + message both contain "repos" — just verify at least one renders
    expect(getAllByText(/repos/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders deload_week recommendation', () => {
    const { getAllByText } = render(
      <DeloadRecommendationCard
        recommendation={makeRecommendation({ type: 'deload_week', reasonKey: 'longBlock', reasonParams: { weeks: 7 } })}
        onDismiss={mockOnDismiss}
      />
    )
    expect(getAllByText(/décharge/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders reduce_volume recommendation', () => {
    const { getAllByText } = render(
      <DeloadRecommendationCard
        recommendation={makeRecommendation({ type: 'reduce_volume', severity: 'warning', reasonKey: 'volumeSpike', reasonParams: { percent: 40 } })}
        onDismiss={mockOnDismiss}
      />
    )
    expect(getAllByText(/volume/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders muscle_overload with affected muscles', () => {
    const { getByText } = render(
      <DeloadRecommendationCard
        recommendation={makeRecommendation({
          type: 'muscle_overload',
          severity: 'suggestion',
          reasonKey: 'muscleOverload',
          reasonParams: { muscles: 'chest, back' },
          affectedMuscles: ['chest', 'back'],
        })}
        onDismiss={mockOnDismiss}
      />
    )
    expect(getByText('chest')).toBeTruthy()
    expect(getByText('back')).toBeTruthy()
  })

  it('calls onDismiss when dismiss button is pressed', () => {
    const { getByText } = render(
      <DeloadRecommendationCard
        recommendation={makeRecommendation()}
        onDismiss={mockOnDismiss}
      />
    )
    // fr: "Compris"
    fireEvent.press(getByText(/compris/i))
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })
})
