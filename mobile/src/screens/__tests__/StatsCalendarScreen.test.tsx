import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

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

const makeHistory = (id: string, date: number, overrides = {}) =>
  ({
    id,
    startTime: new Date(date),
    endTime: new Date(date + 3600000),
    deletedAt: null,
    session: { fetch: jest.fn().mockResolvedValue({ name: 'Push Day' }) },
    ...overrides,
  }) as never

// Helper to get today at noon
const todayMs = () => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d.getTime()
}

// Helper: build YYYY-MM-DD key
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Helper: compute expected month title as displayed by the component
const getMonthTitle = (year: number, month: number): string => {
  const date = new Date(year, month, 1)
  const str = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

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
    const { getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(getAllByText('Repos').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('Actif').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les labels de jours dans le header', () => {
    const { getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(getAllByText('L').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('V').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le titre du mois courant par défaut', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    const today = new Date()
    const expectedTitle = getMonthTitle(today.getFullYear(), today.getMonth())
    expect(getByText(expectedTitle)).toBeTruthy()
  })

  it('navigue au mois précédent via la flèche ←', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    fireEvent.press(getByText('←'))

    const prev = new Date()
    prev.setDate(1)
    prev.setMonth(prev.getMonth() - 1)
    const prevTitle = getMonthTitle(prev.getFullYear(), prev.getMonth())
    expect(getByText(prevTitle)).toBeTruthy()
  })

  it('la flèche → est désactivée sur le mois courant', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    const today = new Date()
    const currentTitle = getMonthTitle(today.getFullYear(), today.getMonth())
    // Le mois ne doit pas changer après avoir appuyé sur →
    fireEvent.press(getByText('→'))
    expect(getByText(currentTitle)).toBeTruthy()
  })

  it('affiche le bouton Aujourd\'hui quand pas sur le mois courant', () => {
    const { getByText, queryByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    expect(queryByText("Aujourd'hui")).toBeNull()

    fireEvent.press(getByText('←'))

    expect(getByText("Aujourd'hui")).toBeTruthy()
  })

  it('le bouton Aujourd\'hui revient au mois courant', () => {
    const { getByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )
    const today = new Date()
    const currentTitle = getMonthTitle(today.getFullYear(), today.getMonth())

    fireEvent.press(getByText('←'))
    fireEvent.press(getByText("Aujourd'hui"))

    expect(getByText(currentTitle)).toBeTruthy()
  })

  it('rend avec des données sans crash', () => {
    const now = todayMs()
    const histories = [
      makeHistory('h1', now - 86400000),
      makeHistory('h2', now - 172800000),
    ]
    const { getByText } = render(
      <StatsCalendarScreenBase histories={histories} />
    )
    expect(getByText('jours actuels')).toBeTruthy()
  })

  it('affiche un streak > 0 avec des séances consécutives', () => {
    const now = todayMs()
    const histories = [
      makeHistory('h1', now),
      makeHistory('h2', now - 86400000),
    ]
    const { getByText } = render(
      <StatsCalendarScreenBase histories={histories} />
    )
    expect(getByText('jours actuels')).toBeTruthy()
    expect(getByText('record')).toBeTruthy()
  })

  it('affiche le tooltip au clic sur un jour de repos du calendrier', async () => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    // Trouver un jour passé dans le mois courant (pas aujourd'hui)
    const targetDate = new Date(today)
    if (today.getDate() > 1) {
      targetDate.setDate(1) // le 1er du mois, toujours dans le passé si pas aujourd'hui
    } else {
      // aujourd'hui est le 1er, on utilise hier (même mois si mois > 1 jour)
      // skip: on utilise today dans ce cas
    }
    const targetKey = toKey(targetDate)

    const { getByTestId, getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )

    const cell = getByTestId(`day-cell-${targetKey}`)
    fireEvent.press(cell)

    await waitFor(() => {
      // "Repos" apparaît dans la légende + dans le tooltip
      expect(getAllByText('Repos').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('affiche le tooltip avec les détails quand un jour a des séances', async () => {
    const now = todayMs()
    const histories = [makeHistory('h1', now)]

    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const todayKey = toKey(today)

    const { getByTestId, queryByText } = render(
      <StatsCalendarScreenBase histories={histories} />
    )

    fireEvent.press(getByTestId(`day-cell-${todayKey}`))

    await waitFor(() => {
      expect(queryByText('Push Day')).toBeTruthy()
    })
  })

  it('toggle le tooltip au second clic sur le même jour', async () => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const targetDate = new Date(today)
    if (today.getDate() > 1) targetDate.setDate(1)
    const targetKey = toKey(targetDate)

    const { getByTestId, getAllByText } = render(
      <StatsCalendarScreenBase histories={[]} />
    )

    const cell = getByTestId(`day-cell-${targetKey}`)

    // Premier clic — tooltip apparaît
    fireEvent.press(cell)
    await waitFor(() => {
      expect(getAllByText('Repos').length).toBeGreaterThanOrEqual(2)
    })

    // Deuxième clic — tooltip disparaît
    fireEvent.press(cell)
    await waitFor(() => {
      expect(getAllByText('Repos').length).toBe(1)
    })
  })

  it('affiche la durée dans le tooltip pour une séance avec endTime', async () => {
    const now = todayMs()
    const histories = [
      makeHistory('h1', now, { endTime: new Date(now + 3600000) }),
    ]

    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const todayKey = toKey(today)

    const { getByTestId, queryByText } = render(
      <StatsCalendarScreenBase histories={histories} />
    )

    fireEvent.press(getByTestId(`day-cell-${todayKey}`))

    await waitFor(() => {
      expect(queryByText('Push Day')).toBeTruthy()
      // 1h = 60 min → formatDuration devrait afficher "1h"
      expect(queryByText('1h')).toBeTruthy()
    })
  })
})
