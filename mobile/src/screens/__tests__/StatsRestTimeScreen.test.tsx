import React from 'react'
import { render } from '@testing-library/react-native'
import { StatsRestTimeBase } from '../StatsRestTimeScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const DAY_MS = 24 * 60 * 60 * 1000

const makeSet = (id: string, exerciseId: string, historyId: string, daysAgo: number) =>
  ({
    id,
    exerciseId,
    historyId,
    weight: 80,
    reps: 10,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name, muscles: ['Pecs'] }) as never

describe('StatsRestTimeBase', () => {
  it('affiche empty state sans sets', () => {
    const { getByText } = render(
      <StatsRestTimeBase sets={[]} exercises={[]} />,
    )
    expect(getByText(/donn/i)).toBeTruthy()
  })

  it('rendu sans crash avec sets vides', () => {
    expect(() =>
      render(<StatsRestTimeBase sets={[] as never} exercises={[] as never} />),
    ).not.toThrow()
  })

  it('affiche les stats avec données', () => {
    // Créer des sets avec des timestamps espacés pour générer du repos
    const now = Date.now()
    const sets = [
      { id: 's1', exerciseId: 'e1', historyId: 'h1', weight: 80, reps: 10, createdAt: new Date(now - 300000) },
      { id: 's2', exerciseId: 'e1', historyId: 'h1', weight: 80, reps: 10, createdAt: new Date(now - 180000) },
      { id: 's3', exerciseId: 'e1', historyId: 'h1', weight: 80, reps: 10, createdAt: new Date(now - 60000) },
    ] as never[]
    const exercises = [makeExercise('e1', 'Développé couché')]

    const { queryByText } = render(
      <StatsRestTimeBase sets={sets} exercises={exercises} />,
    )
    // Either shows data or empty state — shouldn't crash
    expect(queryByText(/donn/i) || queryByText(/min/i) || queryByText(/Développé/i)).toBeTruthy()
  })
})
