import React from 'react'
import { render } from '@testing-library/react-native'
import { StatsSetQualityBase } from '../StatsSetQualityScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const makeSet = (id: string, exerciseId: string, historyId: string, weight: number, reps: number) =>
  ({
    id,
    exerciseId,
    historyId,
    weight,
    reps,
    createdAt: new Date(),
  }) as never

const makeExercise = (id: string, name: string) =>
  ({ id, name, muscles: ['Pecs'] }) as never

describe('StatsSetQualityBase', () => {
  it('affiche empty state sans données', () => {
    const { getByText } = render(
      <StatsSetQualityBase sets={[]} exercises={[]} />,
    )
    expect(getByText(/donn/i)).toBeTruthy()
  })

  it('rendu sans crash avec props vides', () => {
    expect(() =>
      render(<StatsSetQualityBase sets={[] as never} exercises={[] as never} />),
    ).not.toThrow()
  })

  it('affiche les grades colorés avec données', () => {
    const exercises = [makeExercise('e1', 'Bench Press')]
    // Min 5 sets requis par computeSetQuality
    const sets = [
      makeSet('s1', 'e1', 'h1', 80, 10),
      makeSet('s2', 'e1', 'h1', 80, 10),
      makeSet('s3', 'e1', 'h1', 80, 10),
      makeSet('s4', 'e1', 'h1', 80, 10),
      makeSet('s5', 'e1', 'h1', 80, 10),
      makeSet('s6', 'e1', 'h1', 80, 9),
    ]

    const { getByText } = render(
      <StatsSetQualityBase sets={sets} exercises={exercises} />,
    )
    // Doit afficher le score global /100
    expect(getByText(/\/100/)).toBeTruthy()
  })

  it('affiche le grade (A/B/C/D) et le nom de l\'exercice', () => {
    const exercises = [makeExercise('e1', 'Développé couché')]
    const sets = [
      makeSet('s1', 'e1', 'h1', 80, 10),
      makeSet('s2', 'e1', 'h1', 80, 10),
      makeSet('s3', 'e1', 'h1', 80, 9),
      makeSet('s4', 'e1', 'h1', 80, 10),
      makeSet('s5', 'e1', 'h1', 80, 10),
      makeSet('s6', 'e1', 'h1', 80, 10),
    ]

    const { getAllByText, getByText } = render(
      <StatsSetQualityBase sets={sets} exercises={exercises} />,
    )
    expect(getAllByText('Développé couché').length).toBeGreaterThanOrEqual(1)
    // Le score global /100 doit être affiché
    expect(getByText(/\/100/)).toBeTruthy()
  })
})
