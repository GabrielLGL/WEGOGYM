import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(async (fn: () => Promise<void>) => fn()), get: jest.fn() },
}))

jest.mock('react-native-chart-kit', () => {
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    LineChart: ({ data, onDataPointClick }: {
      data: { datasets: Array<{ data: number[] }> };
      onDataPointClick?: (point: { index: number; value: number; x: number; y: number }) => void
    }) => (
      <View testID="line-chart">
        <Text>LineChart-{data.datasets[0].data.length}pts</Text>
        {onDataPointClick && (
          <TouchableOpacity
            testID="data-point-0"
            onPress={() => onDataPointClick({ index: 0, value: data.datasets[0].data[0], x: 100, y: 50 })}
          >
            <Text>ClickPoint</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
  }
})

jest.mock('../../theme/chartConfig', () => ({
  createChartConfig: () => ({
    backgroundColor: '#1C1C1E',
    backgroundGradientFrom: '#1C1C1E',
    backgroundGradientTo: '#1C1C1E',
    decimalPlaces: 0,
    color: () => 'rgba(0,122,255,1)',
    labelColor: () => 'rgba(255,255,255,1)',
    style: { borderRadius: 16 },
  }),
}))

import { StatsDurationScreenBase } from '../StatsDurationScreen'
import { database } from '../../model/index'

const makeHistory = (id: string, startMs: number, endMs: number) =>
  ({
    id,
    startTime: new Date(startMs),
    endTime: new Date(endMs),
    deletedAt: null,
    update: jest.fn(async (fn: (h: { deletedAt: Date | null }) => void) => {
      fn({ deletedAt: null })
    }),
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
      makeHistory('h1', now - 7200000, now - 3600000),       // 1h session
      makeHistory('h2', now - 172800000, now - 169200000),    // 1h session
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText('Durée moyenne')).toBeTruthy()
  })

  it('affiche le graphique quand 2+ séances', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),       // 1h = 60 min
      makeHistory('h2', now - 172800000, now - 169200000),    // 1h = 60 min
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText('LineChart-2pts')).toBeTruthy()
  })

  it('affiche le titre de section avec le nombre de séances', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),
      makeHistory('h2', now - 172800000, now - 169200000),
      makeHistory('h3', now - 259200000, now - 255600000),
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText(/3 dernières séances/)).toBeTruthy()
  })

  it('affiche le message vide avec 1 seule séance', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText(/Enregistrez au moins 2 séances/)).toBeTruthy()
  })

  it('affiche les KPI avec les bonnes valeurs pour 2 séances de 60 min', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),       // 60 min
      makeHistory('h2', now - 172800000, now - 169200000),    // 60 min
    ]
    const { getAllByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    // "1h" appears in multiple KPI cards (avg, min, max all = 60min = 1h)
    expect(getAllByText('1h').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('2h').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le tooltip au clic sur un point de données', async () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),       // 60 min
      makeHistory('h2', now - 172800000, now - 169200000),    // 60 min
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    // Our LineChart mock has a "ClickPoint" button
    fireEvent.press(getByText('ClickPoint'))

    // Tooltip should appear with duration
    await waitFor(() => {
      expect(getByText('60 min')).toBeTruthy()
    })
  })

  it('toggle off le tooltip au second clic sur le même point', async () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 3600000),
      makeHistory('h2', now - 172800000, now - 169200000),
    ]
    const { getByText, queryByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    // Click once → tooltip appears
    fireEvent.press(getByText('ClickPoint'))
    await waitFor(() => expect(getByText('60 min')).toBeTruthy())

    // Click again on same point → tooltip hides
    fireEvent.press(getByText('ClickPoint'))
    await waitFor(() => expect(queryByText('60 min')).toBeNull())
  })

  it('affiche les KPI avec des séances de durées différentes', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 86400000, now - 86400000 + 1800000),  // 30 min
      makeHistory('h2', now - 172800000, now - 172800000 + 5400000), // 90 min
    ]
    const { getByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText('Durée moyenne')).toBeTruthy()
    expect(getByText('Plus courte')).toBeTruthy()
    expect(getByText('Plus longue')).toBeTruthy()
  })

  it('exclut les séances < 10 min des stats', () => {
    const now = Date.now()
    // 8 min session — rounds to 8, excluded by MIN=10
    const shortHistory = makeHistory('h-short', now - 86400000, now - 86400000 + 480000)
    // 60 min session — valid
    const validHistory = makeHistory('h-valid', now - 172800000, now - 172800000 + 3600000)
    const { getByText, getAllByText } = render(
      <StatsDurationScreenBase histories={[shortHistory, validHistory]} />
    )
    // Only 1 valid session → no chart (< 2 sessions)
    expect(getByText(/Enregistrez au moins 2 séances/)).toBeTruthy()
    // KPI avg should be 60 min (not averaged with 8 min)
    expect(getAllByText('1h').length).toBeGreaterThanOrEqual(1)
    // History should show only 1 entry
    expect(getByText(/Historique \(1 séances\)/)).toBeTruthy()
  })

  it('affiche la liste historique quand des séances valides existent', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 7200000 + 3600000),    // 60 min
      makeHistory('h2', now - 172800000, now - 172800000 + 5400000), // 90 min
    ]
    const { getByText, getAllByText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByText(/Historique \(2 séances\)/)).toBeTruthy()
    // Both sessions should appear in the history (formatDuration)
    // Note: getAllByText because values also appear in KPI cards
    expect(getAllByText('1h 30min').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('1h').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche empty state historique quand aucune séance valide', () => {
    const { getByText } = render(
      <StatsDurationScreenBase histories={[]} />
    )
    expect(getByText(/Historique \(0 séances\)/)).toBeTruthy()
    expect(getByText('Aucune séance valide enregistrée.')).toBeTruthy()
  })

  it('affiche seulement 5 séances par page (pagination visible)', () => {
    const now = Date.now()
    const histories = Array.from({ length: 7 }, (_, i) =>
      makeHistory(`h${i + 1}`, now - (i + 1) * 86400000, now - (i + 1) * 86400000 + 3600000)
    )
    const { getByLabelText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    // With 7 sessions and 5 per page, pagination bar must appear
    expect(getByLabelText('Page suivante')).toBeTruthy()
  })

  it('affiche les boutons de pagination quand > 5 séances', () => {
    const now = Date.now()
    const histories = Array.from({ length: 7 }, (_, i) =>
      makeHistory(`h${i + 1}`, now - (i + 1) * 86400000, now - (i + 1) * 86400000 + 3600000)
    )
    const { getByLabelText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    expect(getByLabelText('Page suivante')).toBeTruthy()
  })

  it('le bouton poubelle n\'existe plus dans l\'historique', () => {
    const now = Date.now()
    const histories = [
      makeHistory('h1', now - 7200000, now - 7200000 + 3600000),
      makeHistory('h2', now - 172800000, now - 172800000 + 3600000),
    ]
    const { queryAllByLabelText } = render(
      <StatsDurationScreenBase histories={histories} />
    )
    const trashButtons = queryAllByLabelText('Supprimer cette séance')
    expect(trashButtons.length).toBe(0)
  })
})
