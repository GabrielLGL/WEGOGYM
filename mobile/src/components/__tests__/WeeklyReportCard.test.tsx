/**
 * Tests for WeeklyReportCard component
 */
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { WeeklyReportCard } from '../WeeklyReportCard'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('WeeklyReportCard', () => {
  const defaultProps = {
    sessionsCount: 3,
    totalVolumeKg: 8500,
    prsCount: 2,
    comparedToPrevious: 15,
    topMuscles: ['Pecs', 'Dos', 'Épaules'],
    onPress: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sessions count', () => {
    const { getByText } = render(<WeeklyReportCard {...defaultProps} />)
    expect(getByText('3')).toBeTruthy()
  })

  it('renders PRs count', () => {
    const { getByText } = render(<WeeklyReportCard {...defaultProps} />)
    expect(getByText('2')).toBeTruthy()
  })

  it('renders volume in tons for >= 1000 kg', () => {
    const { getByText } = render(<WeeklyReportCard {...defaultProps} />)
    // 8500 kg → 8.5 t (format fr-FR)
    expect(getByText(/8[,.]5\s*t/)).toBeTruthy()
  })

  it('renders volume in kg for < 1000 kg', () => {
    const { getByText } = render(
      <WeeklyReportCard {...defaultProps} totalVolumeKg={500} />,
    )
    expect(getByText(/500\s*kg/)).toBeTruthy()
  })

  it('shows positive comparison with up arrow', () => {
    const { getByText } = render(<WeeklyReportCard {...defaultProps} />)
    expect(getByText(/↑15%/)).toBeTruthy()
  })

  it('shows negative comparison with down arrow', () => {
    const { getByText } = render(
      <WeeklyReportCard {...defaultProps} comparedToPrevious={-10} />,
    )
    expect(getByText(/↓10%/)).toBeTruthy()
  })

  it('hides comparison when 0%', () => {
    const { queryByText } = render(
      <WeeklyReportCard {...defaultProps} comparedToPrevious={0} />,
    )
    expect(queryByText(/↑|↓/)).toBeNull()
  })

  it('shows top muscles', () => {
    const { getByText } = render(<WeeklyReportCard {...defaultProps} />)
    expect(getByText(/Pecs, Dos, Épaules/)).toBeTruthy()
  })

  it('hides muscles row when empty', () => {
    const { queryByText } = render(
      <WeeklyReportCard {...defaultProps} topMuscles={[]} />,
    )
    expect(queryByText(/Pecs/)).toBeNull()
  })

  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <WeeklyReportCard {...defaultProps} onPress={onPress} />,
    )
    fireEvent.press(getByText('3'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('uses singular label for 1 session', () => {
    const { getByText } = render(
      <WeeklyReportCard {...defaultProps} sessionsCount={1} />,
    )
    expect(getByText('1')).toBeTruthy()
  })
})
