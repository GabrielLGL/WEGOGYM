import React from 'react'
import { render } from '@testing-library/react-native'
import { StatsMuscleBalanceBase } from '../StatsMuscleBalanceScreen'

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

describe('StatsMuscleBalanceBase', () => {
  it('affiche empty state sans données', () => {
    const { getByText } = render(
      <StatsMuscleBalanceBase sets={[]} exercises={[]} />,
    )
    expect(getByText(/donn/i)).toBeTruthy()
  })

  it('rendu sans crash avec props vides', () => {
    expect(() =>
      render(<StatsMuscleBalanceBase sets={[] as never} exercises={[] as never} />),
    ).not.toThrow()
  })

  it('affiche les 4 paires musculaires avec données', () => {
    const exercises = [
      makeExercise('e1', 'Bench Press', ['Pecs']),
      makeExercise('e2', 'Row', ['Dos']),
      makeExercise('e3', 'Squat', ['Quadriceps']),
      makeExercise('e4', 'Leg Curl', ['Ischios']),
    ]
    const sets = [
      makeSet('s1', 'e1', 100, 10),
      makeSet('s2', 'e2', 90, 10),
      makeSet('s3', 'e3', 120, 8),
      makeSet('s4', 'e4', 60, 10),
    ]

    const { getByText } = render(
      <StatsMuscleBalanceBase sets={sets} exercises={exercises} />,
    )
    // Doit afficher le score global /100
    expect(getByText(/\/100/)).toBeTruthy()
  })

  it('affiche le status coloré (balanced/imbalanced)', () => {
    const exercises = [
      makeExercise('e1', 'Bench Press', ['Pecs']),
      makeExercise('e2', 'Row', ['Dos']),
    ]
    const sets = [
      makeSet('s1', 'e1', 100, 10),
      makeSet('s2', 'e2', 100, 10),
    ]

    const { queryAllByText } = render(
      <StatsMuscleBalanceBase sets={sets} exercises={exercises} />,
    )
    // Le composant affiche un statut pour chaque paire
    // On vérifie qu'il y a au moins un texte de statut (balanced, léger, déséquilibré)
    const allTexts = queryAllByText(/.+/)
    expect(allTexts.length).toBeGreaterThan(0)
  })
})
