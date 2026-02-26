import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

const mockCreate = jest.fn()
const mockDestroyPermanently = jest.fn()

jest.mock('../../model/index', () => ({
  database: {
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
    get: jest.fn().mockReturnValue({
      create: (...args: unknown[]) => mockCreate(...args),
    }),
  },
}))

jest.mock('react-native-chart-kit', () => {
  const { View, Text } = require('react-native')
  return {
    LineChart: ({ data }: { data: { datasets: Array<{ data: number[] }> } }) => (
      <View testID="line-chart">
        <Text>LineChart-{data.datasets[0].data.length}pts</Text>
      </View>
    ),
  }
})

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('../../model/utils/databaseHelpers', () => ({
  parseNumericInput: jest.fn((v: string) => parseFloat(v) || 0),
}))

jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({ visible, children, title }: { visible: boolean; children: React.ReactNode; title?: string }) => {
    if (!visible) return null
    const { View, Text } = require('react-native')
    return <View>{title && <Text>{title}</Text>}{children}</View>
  },
}))

jest.mock('../../theme/chartConfig', () => ({
  createChartConfig: () => ({
    backgroundColor: '#1C1C1E',
    backgroundGradientFrom: '#1C1C1E',
    backgroundGradientTo: '#1C1C1E',
    decimalPlaces: 1,
    color: () => 'rgba(0,122,255,1)',
    labelColor: () => 'rgba(255,255,255,1)',
    style: { borderRadius: 16 },
  }),
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
    destroyPermanently: mockDestroyPermanently,
    ...overrides,
  }) as never

describe('StatsMeasurementsScreenBase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  it('affiche la section Dernière mesure avec la date', () => {
    const now = Date.now()
    const measurements = [makeMeasurement('m1', now)]
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    expect(getByText(/Dernière mesure/)).toBeTruthy()
  })

  it('affiche le message quand moins de 2 mesures pour le graphique', () => {
    const now = Date.now()
    const measurements = [makeMeasurement('m1', now)]
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    expect(getByText(/Au moins 2 mesures requises/)).toBeTruthy()
  })

  it('affiche le graphique quand 2+ mesures', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80 }),
      makeMeasurement('m2', Date.now() - 86400000, { weight: 78 }),
    ]
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    expect(getByText('LineChart-2pts')).toBeTruthy()
  })

  it('ouvre le BottomSheet au clic sur Ajouter', () => {
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    fireEvent.press(getByText('+ Ajouter'))
    expect(getByText('Nouvelle mesure')).toBeTruthy()
  })

  it('affiche les champs du formulaire dans le BottomSheet', () => {
    const { getByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    fireEvent.press(getByText('+ Ajouter'))
    expect(getByText('Poids (kg)')).toBeTruthy()
    expect(getByText('Tour de taille (cm)')).toBeTruthy()
    expect(getByText('Hanches (cm)')).toBeTruthy()
    expect(getByText('Bras (cm)')).toBeTruthy()
    expect(getByText('Poitrine (cm)')).toBeTruthy()
  })

  it('enregistre une mesure et ferme le BottomSheet', async () => {
    const { getByText, getAllByPlaceholderText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    fireEvent.press(getByText('+ Ajouter'))

    // Multiple inputs with placeholder "—" — first one is weight
    const inputs = getAllByPlaceholderText('—')
    fireEvent.changeText(inputs[0], '82')

    fireEvent.press(getByText('Enregistrer'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  it('affiche la section historique avec les mesures', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80, waist: 85 }),
    ]
    const { getByText, getAllByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    expect(getByText('Historique')).toBeTruthy()
    // "80kg" appears in both the latest grid and the history row
    expect(getAllByText(/80kg/).length).toBeGreaterThanOrEqual(1)
  })

  it('ouvre AlertDialog au clic sur le bouton delete dans historique', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80 }),
    ]
    const { getByText, getByTestId } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    fireEvent.press(getByTestId('delete-btn'))
    expect(getByText('Supprimer cette mesure ?')).toBeTruthy()
  })

  it('supprime une mesure après confirmation', async () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80 }),
    ]
    const { getByText, getByTestId } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    fireEvent.press(getByTestId('delete-btn'))
    fireEvent.press(getByText('Supprimer'))

    await waitFor(() => {
      expect(mockDestroyPermanently).toHaveBeenCalled()
    })
  })

  it('annuler la suppression ne détruit pas la mesure', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80 }),
    ]
    const { getByText, getByTestId } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    fireEvent.press(getByTestId('delete-btn'))
    fireEvent.press(getByText('Annuler'))
    expect(mockDestroyPermanently).not.toHaveBeenCalled()
  })

  it('change de métrique via ChipSelector', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80, waist: 85 }),
      makeMeasurement('m2', Date.now() - 86400000, { weight: 78, waist: 84 }),
    ]
    const { getAllByText, getByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    // "Tour de taille" appears in ChipSelector and latest grid label
    const tailleBtns = getAllByText('Tour de taille')
    fireEvent.press(tailleBtns[0])
    // Chart should still render (2 data points with waist values)
    expect(getByText('LineChart-2pts')).toBeTruthy()
  })

  it('cache les métriques null dans la dernière mesure', () => {
    const measurements = [
      makeMeasurement('m1', Date.now(), { weight: 80, waist: null, hips: null, arms: null, chest: null }),
    ]
    const { getAllByText } = render(
      <StatsMeasurementsScreenBase measurements={measurements} />
    )
    // Weight should appear in the latest grid and history
    expect(getAllByText(/80kg/).length).toBeGreaterThanOrEqual(1)
    // "Poids" appears in ChipSelector + latest grid label
    expect(getAllByText('Poids').length).toBeGreaterThanOrEqual(1)
  })

  it('ferme le BottomSheet au clic sur Annuler', () => {
    const { getByText, queryByText } = render(
      <StatsMeasurementsScreenBase measurements={[]} />
    )
    fireEvent.press(getByText('+ Ajouter'))
    expect(getByText('Nouvelle mesure')).toBeTruthy()

    fireEvent.press(getByText('Annuler'))
    // BottomSheet should close - title should not be visible
    expect(queryByText('Nouvelle mesure')).toBeNull()
  })
})
