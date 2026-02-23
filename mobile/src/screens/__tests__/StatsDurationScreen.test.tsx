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
  BarChart: 'BarChart',
}))

import { StatsDurationScreenBase } from '../StatsDurationScreen'

const makeHistory = (id: string, startMs: number, endMs: number) =>
  ({
    id,
    startTime: new Date(startMs),
    endTime: new Date(endMs),
    deletedAt: null,
  }) as never

describe('StatsDurationScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsDurationScreenBase histories={[]} />
    )
    expect(getByText('Durée moyenne')).toBeTruthy()
    expect(getByText('Total cumulé')).toBeTruthy()
  })

  it('affiche le message vide avec moins de 2 séances', () => {
    const { getByText } = render(
      <StatsDurationScreenBase histories={[]} />
    )
    expect(getByText(/Enregistrez au moins 2 séances/)).toBeTruthy()
  })

  it('affiche les 4 KPI cards en français', () => {
    const { getByText } = render(
      <StatsDurationScreenBase histories={[]} />
    )
    expect(getByText('Durée moyenne')).toBeTruthy()
    expect(getByText('Total cumulé')).toBeTruthy()
    expect(getByText('Plus courte')).toBeTruthy()
    expect(getByText('Plus longue')).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),
      makeHistory('h2', now - 172800000, now - 169200000),
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText('Durée moyenne')).toBeTruthy()
  })
})
