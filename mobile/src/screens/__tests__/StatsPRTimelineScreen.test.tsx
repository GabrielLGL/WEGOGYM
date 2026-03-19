import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsPRTimelineBase } from '../StatsPRTimelineScreen'

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

const makeSet = (id: string, exerciseId: string, weight: number, reps: number, daysAgo: number) =>
  ({
    id,
    weight,
    reps,
    exerciseId,
    isPr: true,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name }) as never

describe('StatsPRTimelineBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsPRTimelineBase sets={[]} exercises={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche empty state sans PRs', () => {
    const { getByText } = render(
      <StatsPRTimelineBase sets={[]} exercises={[]} />,
    )
    expect(getByText(/Aucun record/)).toBeTruthy()
  })

  it('affiche la timeline avec des PRs', () => {
    const sets = [
      makeSet('s1', 'ex1', 100, 5, 30),
      makeSet('s2', 'ex1', 110, 5, 15),
      makeSet('s3', 'ex2', 80, 8, 5),
    ]
    const exercises = [
      makeExercise('ex1', 'Développé couché'),
      makeExercise('ex2', 'Squat'),
    ]

    const { getByText } = render(
      <StatsPRTimelineBase sets={sets} exercises={exercises} />,
    )
    // Doit afficher les stats rapides
    expect(getByText('3')).toBeTruthy() // totalPRs
    expect(getByText('PRs total')).toBeTruthy()
  })

  it('affiche le groupement par mois', () => {
    const now = Date.now()
    const sets = [
      makeSet('s1', 'ex1', 100, 5, 2),
      makeSet('s2', 'ex1', 110, 5, 40),
    ]
    const exercises = [makeExercise('ex1', 'Bench')]

    const { getAllByText } = render(
      <StatsPRTimelineBase sets={sets} exercises={exercises} />,
    )
    // Au moins un header de mois avec le compteur de PRs
    const prLabels = getAllByText(/PR/)
    expect(prLabels.length).toBeGreaterThan(0)
  })
})
