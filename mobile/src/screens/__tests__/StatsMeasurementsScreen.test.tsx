import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
    get: jest.fn().mockReturnValue({
      create: jest.fn(),
    }),
  },
}))

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

import { StatsMeasurementsScreenBase } from '../StatsMeasurementsScreen'

const makeMeasurement = (id: string, date: number, overrides = {}) =>
  ({
    id,
    date,
    weight: 75,
    waist: 80,
    hips: null,
    arms: null,
    chest: null,
    destroyPermanently: jest.fn(),
    ...overrides,
  }) as never

describe('StatsMeasurementsScreenBase', () => {
  it('rend sans données sans crash', () => {
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    expect(getByText(/Aucune mesure enregistrée/)).toBeTruthy()
  })

  it('affiche le bouton Ajouter', () => {
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    expect(getByText('+ Ajouter')).toBeTruthy()
  })

  it('affiche le message vide quand pas de mesures', () => {
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    expect(getByText(/Appuyez sur "\+ Ajouter" pour commencer/)).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = Date.now()
    const measurements = [makeMeasurement('m1', now)]
    const { getAllByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    // "Poids" apparaît dans le ChipSelector et dans la carte dernière mesure
    expect(getAllByText('Poids').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les valeurs de la dernière mesure', () => {
    const now = Date.now()
    const measurements = [makeMeasurement('m1', now, { weight: 80, waist: 85 })]
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    expect(getByText('80kg')).toBeTruthy()
    expect(getByText('85cm')).toBeTruthy()
  })
})
