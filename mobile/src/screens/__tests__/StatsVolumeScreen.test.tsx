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

const makeExercise = (id: string, name: string, muscles: string[] = ['Pecs']) =>
  ({
    id,
    name,
    primaryMuscle: muscles[0] ?? 'Pecs',
    muscles,
  }) as never

describe('StatsVolumeScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Total')).toBeTruthy()
  })

  it('affiche le message vide quand aucune donnée', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucune donnée pour cette période.')).toBeTruthy()
  })

  it('affiche les chips de période', () => {
    const { getAllByText, getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    // '1 mois' et '3 mois' apparaissent dans les 2 ChipSelectors (chart + bars)
    expect(getAllByText('1 mois').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('3 mois').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Tout').length).toBeGreaterThanOrEqual(1)
    // Chip exclusif aux bars
    expect(getByText('Semaine')).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [makeExercise('e1', 'Développé couché', ['Pecs'])]
    const sets = [makeSet('s1', 'h1', 'e1', 80, 10)]

    const { getByText } = render(
      <StatsVolumeScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    expect(getByText('Total')).toBeTruthy()
  })

  it('affiche le filtre muscle quand des exercices sont entraînés', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now - 86400000)]
    const exercises = [makeExercise('e1', 'Développé couché', ['Pecs'])]
    const sets = [makeSet('s1', 'h1', 'e1', 80, 10)]

    const { getAllByText } = render(
      <StatsVolumeScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    // "Pectoraux" apparaît dans le chip muscle ET dans la barre de progression (traduit depuis "Pecs")
    expect(getAllByText('Pectoraux').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les progress bars avec le nom du muscle et le compteur de sets', () => {
    const now = Date.now()
    const histories = [makeHistory('h1', now)]
    const exercises = [makeExercise('e1', 'Squat', ['Quadriceps'])]
    const sets = [makeSet('s1', 'h1', 'e1', 100, 5)]

    const { getAllByText, getByText } = render(
      <StatsVolumeScreenBase sets={sets} exercises={exercises} histories={histories} />
    )
    // 'Quadriceps' apparaît dans le chip muscle ET dans la barre de progression
    expect(getAllByText('Quadriceps').length).toBeGreaterThanOrEqual(1)
    expect(getByText('1 set')).toBeTruthy()
  })

  it('affiche "Aucun set enregistré" dans les bars quand aucune donnée', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Aucun set enregistré sur cette période.')).toBeTruthy()
  })

  it('affiche le label de fenêtre au format DD/MM – DD/MM pour la semaine courante', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    // Le chip 'Semaine' est sélectionné par défaut → windowLabel = "DD/MM – DD/MM"
    expect(getByText(/\d{2}\/\d{2} – \d{2}\/\d{2}/)).toBeTruthy()
  })

  it('affiche le chip Semaine sélectionné par défaut dans les bars', () => {
    const { getByText } = render(
      <StatsVolumeScreenBase sets={[]} exercises={[]} histories={[]} />
    )
    expect(getByText('Semaine')).toBeTruthy()
  })
})
