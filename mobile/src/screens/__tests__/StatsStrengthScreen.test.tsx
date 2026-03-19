import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsStrengthScreenBase } from '../StatsStrengthScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const makeSet = (exerciseId: string, weight: number, reps: number) =>
  ({
    id: `s-${Math.random()}`,
    weight,
    reps,
    exerciseId,
    createdAt: new Date(),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name }) as never

const makeMeasurement = (weight: number) =>
  ({ weight }) as never

describe('StatsStrengthScreenBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsStrengthScreenBase
        user={null}
        exercises={[]}
        sets={[]}
        measurements={[]}
      />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche avertissement sans poids corporel', () => {
    const { getByText } = render(
      <StatsStrengthScreenBase
        user={null}
        exercises={[]}
        sets={[]}
        measurements={[]}
      />,
    )
    expect(getByText(/Ajoutez votre poids/)).toBeTruthy()
  })

  it('affiche les niveaux de force avec des données', () => {
    const exercises = [makeExercise('ex1', 'Développé couché')]
    const sets = [makeSet('ex1', 80, 5)]
    const measurements = [makeMeasurement(80)]

    const { getByText } = render(
      <StatsStrengthScreenBase
        user={null}
        exercises={exercises}
        sets={sets}
        measurements={measurements}
      />,
    )
    // Doit afficher le nom de l'exercice et le poids basé sur
    expect(getByText(/80 kg/)).toBeTruthy()
  })

  it('affiche le disclaimer', () => {
    const { getByText } = render(
      <StatsStrengthScreenBase
        user={null}
        exercises={[]}
        sets={[]}
        measurements={[]}
      />,
    )
    // Le disclaimer est toujours affiché
    expect(getByText(/approximatifs/)).toBeTruthy()
  })
})
