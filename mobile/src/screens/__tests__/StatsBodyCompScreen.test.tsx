import React from 'react'
import { render } from '@testing-library/react-native'

import { StatsBodyCompBase } from '../StatsBodyCompScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Polyline: 'Polyline',
}))

const DAY_MS = 24 * 60 * 60 * 1000

const makeMeasurement = (daysAgo: number, weight: number | null, waist: number | null = null) =>
  ({
    date: Date.now() - daysAgo * DAY_MS,
    weight,
    waist,
    hips: null,
    chest: null,
    arms: null,
  }) as never

describe('StatsBodyCompBase', () => {
  it('rend sans crash avec des props vides', () => {
    const { toJSON } = render(
      <StatsBodyCompBase measurements={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche "Aucune mesure" quand pas de données', () => {
    const { getAllByText } = render(
      <StatsBodyCompBase measurements={[]} />,
    )
    // Toutes les métriques sans données affichent "Aucune mesure"
    const noDataTexts = getAllByText('Aucune mesure')
    expect(noDataTexts.length).toBe(5) // weight, waist, hips, chest, arms
  })

  it('affiche les tendances avec des données', () => {
    const measurements = [
      makeMeasurement(5, 85, 83),
      makeMeasurement(60, 80, 85),
    ]
    const { getByText } = render(
      <StatsBodyCompBase measurements={measurements} />,
    )
    // Doit afficher la valeur courante du poids
    expect(getByText(/85\.0 kg/)).toBeTruthy()
  })

  it('affiche les boutons de période', () => {
    const { getByText } = render(
      <StatsBodyCompBase measurements={[]} />,
    )
    expect(getByText('30j')).toBeTruthy()
    expect(getByText('90j')).toBeTruthy()
    expect(getByText('180j')).toBeTruthy()
  })

  it('gère une seule mesure sans crash', () => {
    const measurements = [makeMeasurement(5, 80)]
    const { toJSON } = render(
      <StatsBodyCompBase measurements={measurements} />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
