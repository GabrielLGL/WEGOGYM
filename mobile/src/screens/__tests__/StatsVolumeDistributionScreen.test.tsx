import React from 'react'
import { render } from '@testing-library/react-native'
import { StatsVolumeDistributionBase } from '../StatsVolumeDistributionScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const makeSet = (id: string, exerciseId: string, weight: number, reps: number) =>
  ({
    id,
    exerciseId,
    historyId: 'h1',
    weight,
    reps,
    createdAt: new Date(),
  }) as never

const makeExercise = (id: string, name: string, muscles: string[]) =>
  ({ id, name, muscles }) as never

describe('StatsVolumeDistributionBase', () => {
  it('affiche empty state sans données', () => {
    const { getByText } = render(
      <StatsVolumeDistributionBase sets={[]} exercises={[]} />,
    )
    expect(getByText(/donn/i)).toBeTruthy()
  })

  it('rendu sans crash avec props vides', () => {
    expect(() =>
      render(<StatsVolumeDistributionBase sets={[] as never} exercises={[] as never} />),
    ).not.toThrow()
  })

  it('affiche la distribution par muscle avec données', () => {
    const exercises = [
      makeExercise('e1', 'Développé couché', ['Pecs']),
      makeExercise('e2', 'Squat', ['Quadriceps']),
    ]
    const sets = [
      makeSet('s1', 'e1', 100, 10),
      makeSet('s2', 'e1', 100, 10),
      makeSet('s3', 'e2', 120, 8),
    ]

    const { getByText } = render(
      <StatsVolumeDistributionBase sets={sets} exercises={exercises} />,
    )
    // Doit afficher le score de balance
    expect(getByText(/\/100/)).toBeTruthy()
  })

  it('affiche les pourcentages', () => {
    const exercises = [makeExercise('e1', 'Bench', ['Pecs'])]
    const sets = [makeSet('s1', 'e1', 100, 10)]

    const { getByText } = render(
      <StatsVolumeDistributionBase sets={sets} exercises={exercises} />,
    )
    expect(getByText(/100%/)).toBeTruthy()
  })
})
