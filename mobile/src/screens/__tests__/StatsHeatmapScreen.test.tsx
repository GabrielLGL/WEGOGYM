import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsHeatmapScreenBase } from '../StatsHeatmapScreen'

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

const makeSet = (exerciseId: string, weight: number, reps: number, daysAgo = 0) =>
  ({
    id: `s-${Math.random()}`,
    weight,
    reps,
    exerciseId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }) as never

const makeExercise = (id: string, muscles: string[]) =>
  ({ id, muscles }) as never

describe('StatsHeatmapScreenBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsHeatmapScreenBase sets={[]} exercises={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche la grille heatmap avec des données', () => {
    const sets = [
      makeSet('ex1', 100, 10, 1),
      makeSet('ex1', 80, 10, 3),
      makeSet('ex2', 60, 8, 2),
    ]
    const exercises = [
      makeExercise('ex1', ['Pectoraux']),
      makeExercise('ex2', ['Dos']),
    ]
    const { toJSON, getAllByText } = render(
      <StatsHeatmapScreenBase sets={sets} exercises={exercises} />,
    )
    // FlatList rend au moins quelques muscles (virtualisée)
    expect(toJSON()).toBeTruthy()
    // Le label "Non travaillé" apparaît pour les muscles sans données
    const noDataLabels = getAllByText('Non travaillé')
    expect(noDataLabels.length).toBeGreaterThan(0)
  })

  it('affiche les boutons de période', () => {
    const { getByText } = render(
      <StatsHeatmapScreenBase sets={[]} exercises={[]} />,
    )
    expect(getByText('7 jours')).toBeTruthy()
    expect(getByText('14 jours')).toBeTruthy()
    expect(getByText('30 jours')).toBeTruthy()
  })
})
