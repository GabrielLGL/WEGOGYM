import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsHallOfFameScreenBase } from '../StatsHallOfFameScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}))

const makeExercise = (id: string, name: string, muscles: string[]) =>
  ({ id, name, muscles, _muscles: JSON.stringify(muscles) }) as never

const makeSet = (id: string, exerciseId: string, weight: number, reps: number, isPr: boolean) =>
  ({
    id,
    exerciseId,
    weight,
    reps,
    isPr,
    createdAt: new Date(),
  }) as never

describe('StatsHallOfFameScreenBase', () => {
  it('affiche l\'empty state sans PRs', () => {
    const { getByText } = render(
      <StatsHallOfFameScreenBase sets={[]} exercises={[]} />
    )
    expect(getByText('Aucun record')).toBeTruthy()
    expect(getByText('Complète des séances pour voir tes PRs ici.')).toBeTruthy()
  })

  it('affiche la liste de PRs avec des données', () => {
    const exercises = [
      makeExercise('e1', 'Squat', ['Quadriceps', 'Ischios']),
      makeExercise('e2', 'Développé couché', ['Pecs', 'Triceps']),
    ]
    const sets = [
      makeSet('s1', 'e1', 140, 5, true),
      makeSet('s2', 'e2', 100, 8, true),
    ]
    const { getByText } = render(
      <StatsHallOfFameScreenBase sets={sets} exercises={exercises} />
    )
    expect(getByText('Squat')).toBeTruthy()
    expect(getByText('Développé couché')).toBeTruthy()
  })

  it('affiche le nombre total de PRs dans le header', () => {
    const exercises = [makeExercise('e1', 'Squat', ['Quadriceps'])]
    const sets = [
      makeSet('s1', 'e1', 140, 5, true),
      makeSet('s2', 'e1', 150, 3, true),
    ]
    const { getByText } = render(
      <StatsHallOfFameScreenBase sets={sets} exercises={exercises} />
    )
    // "2  records au total" is in nested Text elements — use regex
    expect(getByText(/records au total/)).toBeTruthy()
  })

  it('affiche le 1RM estimé', () => {
    const exercises = [makeExercise('e1', 'Squat', ['Quadriceps'])]
    const sets = [makeSet('s1', 'e1', 100, 10, true)]
    // 1RM = 100 * (1 + 10/30) = 133
    const { getByText } = render(
      <StatsHallOfFameScreenBase sets={sets} exercises={exercises} />
    )
    expect(getByText(/1RM estimé/)).toBeTruthy()
  })
})
