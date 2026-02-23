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

jest.mock('react-native-chart-kit', () => ({
  BarChart: 'BarChart',
  LineChart: 'LineChart',
}))

import { StatsVolumeScreenBase } from '../StatsVolumeScreen'

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

const makeExercise = (id: string, name: string) =>
  ({
    id,
    name,
    primaryMuscle: 'Pecs',
    muscles: ['Pecs'],
  }) as never

describe('StatsVolumeScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Volume total')).toBeTruthy()
  })

  it('affiche le message vide quand aucun volume', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucun volume enregistré sur cette période.')).toBeTruthy()
  })

  it('affiche le label "Volume par semaine" en français', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText(/Volume par semaine/)).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [makeExercise('e1', 'Développé couché')]
    const sets = [makeSet('s1', 'h1', 'e1', 80, 10)]

    const { getByText } = render(
      <StatsVolumeScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    expect(getByText('Volume total')).toBeTruthy()
  })
})
