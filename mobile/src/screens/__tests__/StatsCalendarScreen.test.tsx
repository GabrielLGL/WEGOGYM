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

import { StatsCalendarScreenBase } from '../StatsCalendarScreen'

const makeHistory = (id: string, date: number) =>
  ({
    id,
    startTime: new Date(date),
    endTime: new Date(date + 3600000),
    deletedAt: null,
    session: { fetch: jest.fn().mockResolvedValue({ name: 'Push' }) },
  }) as never

describe('StatsCalendarScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(getByText('jours actuels')).toBeTruthy()
    expect(getByText('record')).toBeTruthy()
  })

  it('affiche les streaks à 0 sans historique', () => {
    const { getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    const zeros = getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(2)
  })

  it('affiche la légende en français', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(getByText('Repos')).toBeTruthy()
    expect(getByText('Actif')).toBeTruthy()
  })

  it('affiche les labels de jours', () => {
    const { getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(getAllByText('L').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('V').length).toBeGreaterThanOrEqual(1)
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 86400000),
      makeHistory('h2', now - 172800000),
    ]
    const { getByText } = render(
      <StatsCalendarScreenBase histories={histories} />
    )
    expect(getByText('jours actuels')).toBeTruthy()
  })
})
