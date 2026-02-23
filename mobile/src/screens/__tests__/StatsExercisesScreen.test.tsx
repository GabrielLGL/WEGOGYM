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

import { StatsExercisesScreenBase } from '../StatsExercisesScreen'

const makeHistory = (id: string, date: number) =>
  ({
    id,
    startTime: new Date(date),
    endTime: new Date(date + 3600000),
    deletedAt: null,
  }) as never

const makeSet = (id: string, historyId: string, exerciseId: string, weight: number, reps: number, isPr = false) =>
  ({
    id,
    weight,
    reps,
    isPr,
    history: { id: historyId },
    exercise: { id: exerciseId },
    createdAt: new Date(),
  }) as never

const makeExercise = (id: string, name: string, primaryMuscle = 'Pecs', equipment = 'Barbell') =>
  ({
    id,
    name,
    primaryMuscle,
    muscles: [primaryMuscle],
    equipment,
  }) as never

describe('StatsExercisesScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsExercisesScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Records personnels')).toBeTruthy()
  })

  it('affiche les messages vides quand pas de données', () => {
    const { getByText } = render(
      <StatsExercisesScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucun record enregistré pour l\'instant.')).toBeTruthy()
    expect(getByText('Aucune séance enregistrée pour l\'instant.')).toBeTruthy()
  })

  it('affiche les sections en français', () => {
    const { getByText } = render(
      <StatsExercisesScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Records personnels')).toBeTruthy()
    expect(getByText('Exercices les plus pratiqués')).toBeTruthy()
  })

  it('affiche le champ de recherche', () => {
    const { getByPlaceholderText } = render(
      <StatsExercisesScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByPlaceholderText('Rechercher un exercice...')).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [makeExercise('e1', 'Développé couché')]
    const sets = [makeSet('s1', 'h1', 'e1', 80, 10, true)]

    const { getByText } = render(
      <StatsExercisesScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    expect(getByText('Records personnels')).toBeTruthy()
  })
})
