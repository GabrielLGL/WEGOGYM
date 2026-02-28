/**
 * Tests for AssistantPreviewScreen.tsx.
 * Plain default export component — no withObservables.
 * ThemeContext mocked globally via moduleNameMapper.
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/utils/databaseHelpers', () => ({
  importGeneratedPlan: jest.fn().mockResolvedValue(undefined),
  importGeneratedSession: jest.fn().mockResolvedValue(undefined),
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import AssistantPreviewScreen from '../AssistantPreviewScreen'

const mockNavigate = jest.fn()
const mockGoBack = jest.fn()

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as never

const singleSessionPlan = {
  name: 'PPL Express',
  sessions: [
    {
      name: 'Push Day',
      exercises: [
        { exerciseName: 'Bench Press', setsTarget: 3, repsTarget: '10', weightTarget: 60 },
        { exerciseName: 'Shoulder Press', setsTarget: 3, repsTarget: '12', weightTarget: 40 },
      ],
    },
  ],
}

const makeRoute = (overrides: Record<string, unknown> = {}) =>
  ({
    params: {
      plan: singleSessionPlan,
      mode: 'program' as const,
      targetProgramId: undefined,
      ...overrides,
    },
    key: 'AssistantPreview',
    name: 'AssistantPreview',
  }) as never

describe('AssistantPreviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(() =>
      render(<AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />)
    ).not.toThrow()
  })

  it('shows the plan name in the text input', () => {
    const { getByDisplayValue } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByDisplayValue('PPL Express')).toBeTruthy()
  })

  it('shows session and exercise count in summary', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByText(/1 séance.*2 exercices/)).toBeTruthy()
  })

  it('shows the session name', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByText('Push Day')).toBeTruthy()
  })

  it('shows exercise names', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByText('Bench Press')).toBeTruthy()
    expect(getByText('Shoulder Press')).toBeTruthy()
  })

  it('shows sets × reps for exercises', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByText(/3 séries × 10 reps/)).toBeTruthy()
  })

  it('shows "Modifier" and "Valider" buttons', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    expect(getByText('Modifier')).toBeTruthy()
    expect(getByText('Valider')).toBeTruthy()
  })

  it('pressing "Modifier" calls navigation.goBack()', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    fireEvent.press(getByText('Modifier'))
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })

  it('renders with a plan that has no sessions gracefully', () => {
    const emptyPlan = { name: 'Plan vide', sessions: [] }
    const route = makeRoute({ plan: emptyPlan })
    expect(() =>
      render(<AssistantPreviewScreen navigation={mockNavigation} route={route} />)
    ).not.toThrow()
  })

  it('shows correct pluralization for 1 séance / 2 exercices', () => {
    const { getByText } = render(
      <AssistantPreviewScreen navigation={mockNavigation} route={makeRoute()} />
    )
    // "1 séance" (singular) and "2 exercices" (plural)
    expect(getByText(/1 séance · 2 exercices/)).toBeTruthy()
  })
})
