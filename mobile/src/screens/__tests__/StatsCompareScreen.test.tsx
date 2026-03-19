import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsCompareBase } from '../StatsCompareScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

describe('StatsCompareBase', () => {
  it('affiche le comparateur sans données', () => {
    const { getAllByText } = render(
      <StatsCompareBase histories={[]} sets={[]} />
    )
    // "Période A" appears in section label + table header
    expect(getAllByText('Période A').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Période B').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les métriques du tableau comparatif', () => {
    const { getByText } = render(
      <StatsCompareBase histories={[]} sets={[]} />
    )
    expect(getByText('Séances')).toBeTruthy()
    expect(getByText('Volume')).toBeTruthy()
    expect(getByText('PRs')).toBeTruthy()
    expect(getByText('Durée moy.')).toBeTruthy()
  })

  it('affiche le message "aucune séance" sans données', () => {
    const { getByText } = render(
      <StatsCompareBase histories={[]} sets={[]} />
    )
    expect(getByText('Aucune séance sur cette période')).toBeTruthy()
  })

  it('affiche le résumé de comparaison', () => {
    const { getByText } = render(
      <StatsCompareBase histories={[]} sets={[]} />
    )
    expect(getByText('Périodes équivalentes')).toBeTruthy()
  })
})
