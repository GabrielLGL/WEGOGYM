import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsTrainingSplitBase } from '../StatsTrainingSplitScreen'

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

const makeSet = (exerciseId: string, daysAgo: number) =>
  ({
    id: `s-${Math.random()}`,
    exerciseId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

const makeExercise = (id: string, muscles: string[]) =>
  ({ id, muscles }) as never

const makeHistory = (daysAgo: number) =>
  ({
    id: `h-${daysAgo}`,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    deletedAt: null,
    isAbandoned: false,
  }) as never

describe('StatsTrainingSplitBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsTrainingSplitBase sets={[]} exercises={[]} histories={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche empty state sans données', () => {
    const { getByText } = render(
      <StatsTrainingSplitBase sets={[]} exercises={[]} histories={[]} />,
    )
    expect(getByText(/Pas assez de données/)).toBeTruthy()
  })

  it('détecte et affiche le pattern avec des données', () => {
    const exercises = [
      makeExercise('ex1', ['Pectoraux', 'Triceps']),
      makeExercise('ex2', ['Dos', 'Biceps']),
      makeExercise('ex3', ['Quadriceps', 'Ischio-jambiers']),
    ]
    const sets = [
      makeSet('ex1', 1), makeSet('ex1', 1),
      makeSet('ex2', 3), makeSet('ex2', 3),
      makeSet('ex3', 5), makeSet('ex3', 5),
      makeSet('ex1', 8),
      makeSet('ex2', 10),
      makeSet('ex3', 12),
    ]
    const histories = [
      makeHistory(1), makeHistory(3), makeHistory(5),
      makeHistory(8), makeHistory(10), makeHistory(12),
    ]

    const { getByText } = render(
      <StatsTrainingSplitBase sets={sets} exercises={exercises} histories={histories} />,
    )
    expect(getByText(/Pattern détecté/)).toBeTruthy()
    expect(getByText(/Régularité/)).toBeTruthy()
  })
})
