import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsVolumeRecordsContent } from '../StatsVolumeRecordsScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

const DAY_MS = 86400000

const makeHistory = (id: string, daysAgo: number) =>
  ({
    id,
    startTime: new Date(Date.now() - daysAgo * DAY_MS),
    endTime: new Date(Date.now() - daysAgo * DAY_MS + 3600000),
    deletedAt: null,
    isAbandoned: false,
  }) as never

const makeSet = (historyId: string, weight: number, reps: number) =>
  ({
    historyId,
    weight,
    reps,
  }) as never

describe('StatsVolumeRecordsContent', () => {
  it('affiche l\'empty state sans données', () => {
    const { getByText } = render(
      <StatsVolumeRecordsContent histories={[]} sets={[]} />
    )
    expect(getByText('Aucune donnée.')).toBeTruthy()
  })

  it('affiche 3 cartes records avec des données', () => {
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 3),
    ]
    const sets = [
      makeSet('h1', 100, 10),
      makeSet('h2', 80, 12),
    ]
    const { getByText } = render(
      <StatsVolumeRecordsContent histories={histories} sets={sets} />
    )
    expect(getByText('Meilleure séance')).toBeTruthy()
    expect(getByText('Meilleure semaine')).toBeTruthy()
    expect(getByText('Meilleur mois')).toBeTruthy()
  })

  it('affiche le volume total lifetime', () => {
    const histories = [makeHistory('h1', 1)]
    const sets = [
      makeSet('h1', 100, 10), // 1000 kg
    ]
    const { getByText, getAllByText } = render(
      <StatsVolumeRecordsContent histories={histories} sets={sets} />
    )
    expect(getByText('Volume total')).toBeTruthy()
    // formatVolume(1000) → "1.0t" — appears multiple times (lifetime + records)
    expect(getAllByText('1.0t').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche la tendance récente', () => {
    const histories = [
      makeHistory('h1', 1),
      makeHistory('h2', 20),
    ]
    const sets = [
      makeSet('h1', 200, 10), // 2000 (récent)
      makeSet('h2', 50, 10),  // 500 (ancien)
    ]
    const { getByText } = render(
      <StatsVolumeRecordsContent histories={histories} sets={sets} />
    )
    expect(getByText('En hausse')).toBeTruthy()
  })
})
