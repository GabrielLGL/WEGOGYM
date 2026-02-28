import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

import { StatsRepartitionScreenBase } from '../StatsRepartitionScreen'

const makeHistory = (id: string, date: number) =>
  ({
    id,
    startTime: new Date(date),
    endTime: new Date(date + 3600000),
    deletedAt: null,
  }) as never

const makeSet = (id: string, historyId: string, exerciseId: string, weight: number, reps: number) =>
  ({
    id,
    weight,
    reps,
    isPr: false,
    history: { id: historyId },
    exercise: { id: exerciseId },
    createdAt: new Date(),
  }) as never

const makeExercise = (id: string, name: string, primaryMuscle: string) =>
  ({
    id,
    name,
    primaryMuscle,
    muscles: [primaryMuscle],
  }) as never

describe('StatsRepartitionScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsRepartitionScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucune donnée pour cette période.')).toBeTruthy()
  })

  it('affiche le message vide en français', () => {
    const { getByText } = render(
      <StatsRepartitionScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucune donnée pour cette période.')).toBeTruthy()
  })

  it('rend avec des données et affiche la répartition', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [
      makeExercise('e1', 'Développé couché', 'Pecs'),
      makeExercise('e2', 'Rowing', 'Dos'),
    ]
    const sets = [
      makeSet('s1', 'h1', 'e1', 80, 10),
      makeSet('s2', 'h1', 'e2', 60, 10),
    ]

    const { getAllByText } = render(
      <StatsRepartitionScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    // Les muscles apparaissent dans la répartition ET dans le filtre du chart (ChipSelector, traduits)
    expect(getAllByText('Pectoraux').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Dos').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le volume analysé avec données', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [makeExercise('e1', 'Squat', 'Quadriceps')]
    const sets = [makeSet('s1', 'h1', 'e1', 100, 10)]

    const { getByText } = render(
      <StatsRepartitionScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    expect(getByText(/Volume analysé/)).toBeTruthy()
  })
})
