import React from 'react'
import { render } from '@testing-library/react-native'
import { StatsMonthlyProgressContent } from '../StatsMonthlyProgressScreen'

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

const makeHistory = (id: string, daysAgo: number) =>
  ({
    id,
    startTime: new Date(Date.now() - daysAgo * DAY_MS),
    endTime: new Date(Date.now() - daysAgo * DAY_MS + 3600000),
    deletedAt: null,
    isAbandoned: false,
    sessionId: 'ses1',
  }) as never

const makeSet = (id: string, exerciseId: string, historyId: string, weight: number, reps: number, daysAgo: number) =>
  ({
    id,
    exerciseId,
    historyId,
    weight,
    reps,
    isPr: false,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name, muscles: ['Pecs'] }) as never

describe('StatsMonthlyProgressContent', () => {
  it('affiche empty state sans données', () => {
    const { getByText } = render(
      <StatsMonthlyProgressContent histories={[]} sets={[]} exercises={[]} />,
    )
    expect(getByText(/donn/i)).toBeTruthy()
  })

  it('rendu sans crash avec props vides', () => {
    expect(() =>
      render(<StatsMonthlyProgressContent histories={[] as never} sets={[] as never} exercises={[] as never} />),
    ).not.toThrow()
  })

  it('affiche la progression avec données ce mois', () => {
    const histories = [makeHistory('h1', 5), makeHistory('h2', 10)]
    const sets = [
      makeSet('s1', 'e1', 'h1', 100, 10, 5),
      makeSet('s2', 'e1', 'h2', 100, 8, 10),
    ]
    const exercises = [makeExercise('e1', 'Bench Press')]

    const { getAllByText } = render(
      <StatsMonthlyProgressContent histories={histories} sets={sets} exercises={exercises} />,
    )
    // Doit afficher le volume en kg
    expect(getAllByText(/kg/).length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les deltas avec données ce mois et le mois précédent', () => {
    const histories = [
      makeHistory('h1', 5),
      makeHistory('h2', 35), // mois précédent
    ]
    const sets = [
      makeSet('s1', 'e1', 'h1', 100, 10, 5),
      makeSet('s2', 'e1', 'h2', 80, 8, 35),
    ]
    const exercises = [makeExercise('e1', 'Bench Press')]

    const { toJSON } = render(
      <StatsMonthlyProgressContent histories={histories} sets={sets} exercises={exercises} />,
    )
    // Le rendu contient des deltas (format +X% ou -X% ou 0%)
    const json = JSON.stringify(toJSON())
    expect(json).toMatch(/[+-]?\d+%/)
  })
})
