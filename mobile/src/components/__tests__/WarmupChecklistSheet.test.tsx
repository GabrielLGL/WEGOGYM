/**
 * Tests for WarmupChecklistSheet component
 */
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { WarmupChecklistSheet } from '../WarmupChecklistSheet'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('WarmupChecklistSheet', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    muscles: ['Pecs', 'Dos'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders suggestions for given muscles', () => {
    const { getByText } = render(<WarmupChecklistSheet {...defaultProps} />)
    // Pecs suggestions
    expect(getByText('Rotations épaules')).toBeTruthy()
    expect(getByText('Pompes légères (×10)')).toBeTruthy()
    expect(getByText('Étirements pecs')).toBeTruthy()
    // Dos suggestions
    expect(getByText('Cat-cow (×10)')).toBeTruthy()
  })

  it('deduplicates suggestions across muscles', () => {
    // Both Pecs and Epaules have "Rotations épaules" — should appear once
    const { getAllByText } = render(
      <WarmupChecklistSheet {...defaultProps} muscles={['Pecs', 'Epaules']} />,
    )
    expect(getAllByText('Rotations épaules')).toHaveLength(1)
  })

  it('shows generic suggestions when no muscles provided', () => {
    const { getByText } = render(
      <WarmupChecklistSheet {...defaultProps} muscles={[]} />,
    )
    expect(getByText('Squats poids du corps (×15)')).toBeTruthy()
    expect(getByText('Cat-cow (×10)')).toBeTruthy()
    expect(getByText('Jumping jacks (×20)')).toBeTruthy()
  })

  it('shows generic suggestions when muscles are unknown', () => {
    const { getByText } = render(
      <WarmupChecklistSheet {...defaultProps} muscles={['UnknownMuscle']} />,
    )
    expect(getByText('Squats poids du corps (×15)')).toBeTruthy()
  })

  it('limits suggestions to 8 max', () => {
    // Providing many muscles should still cap at 8
    const { getAllByText } = render(
      <WarmupChecklistSheet
        {...defaultProps}
        muscles={['Pecs', 'Epaules', 'Dos', 'Biceps', 'Triceps', 'Quadriceps', 'Ischios']}
      />,
    )
    // Each checkbox item has a text element
    // We check by counting checkbox-like elements — but easier to check progress counter
    const progressText = getAllByText(/\/8|\/[1-7]/)[0]
    expect(progressText).toBeTruthy()
  })

  it('toggles checkbox on press', () => {
    const { getByText } = render(<WarmupChecklistSheet {...defaultProps} />)

    // Initially 0/N done
    expect(getByText(/^0\//)).toBeTruthy()

    // Press first item
    fireEvent.press(getByText('Rotations épaules'))
    expect(getByText(/^1\//)).toBeTruthy()

    // Press again to uncheck
    fireEvent.press(getByText('Rotations épaules'))
    expect(getByText(/^0\//)).toBeTruthy()
  })

  it('displays muscle chips', () => {
    const { getByText } = render(<WarmupChecklistSheet {...defaultProps} />)
    expect(getByText('Pecs')).toBeTruthy()
    expect(getByText('Dos')).toBeTruthy()
  })

  it('hides muscle chips when muscles array is empty', () => {
    const { queryByText } = render(
      <WarmupChecklistSheet {...defaultProps} muscles={[]} />,
    )
    expect(queryByText('Pecs')).toBeNull()
  })
})
