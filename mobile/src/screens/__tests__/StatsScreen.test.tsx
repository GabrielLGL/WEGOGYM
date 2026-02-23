import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}))

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
}

import { StatsScreenBase } from '../StatsScreen'

const makeHistory = (id: string, date: number) =>
  ({
    id,
    startTime: new Date(date),
    endTime: new Date(date + 3600000),
    deletedAt: null,
  }) as never

const makeSet = (id: string, historyId: string, weight: number, reps: number) =>
  ({
    id,
    weight,
    reps,
    isPr: false,
    history: { id: historyId },
    exercise: { id: 'e1' },
    createdAt: new Date(),
  }) as never

const makeUser = (name = 'Test') =>
  ({
    id: 'u1',
    name,
    restDuration: 90,
    timerEnabled: true,
  }) as never

describe('StatsScreenBase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rend sans données (tableaux vides) sans crash', () => {
    const { getByText } = render(
      <StatsScreenBase users={[]} histories={[]} sets={[]} />
    )
    expect(getByText('Toi')).toBeTruthy()
  })

  it('affiche le nom de l\'utilisateur', () => {
    const { getByText } = render(
      <StatsScreenBase users={[makeUser('Gabriel')]} histories={[]} sets={[]} />
    )
    expect(getByText('Gabriel')).toBeTruthy()
  })

  it('affiche les KPIs (Séances, Volume, Records)', () => {
    const { getByText, getAllByText } = render(
      <StatsScreenBase users={[makeUser()]} histories={[]} sets={[]} />
    )
    expect(getByText('Séances')).toBeTruthy()
    // "Volume" apparaît à la fois comme KPI et comme bouton grille
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(1)
    expect(getByText('Records')).toBeTruthy()
  })

  it('affiche les 7 boutons de navigation', () => {
    const { getByText } = render(
      <StatsScreenBase users={[makeUser()]} histories={[]} sets={[]} />
    )
    expect(getByText('Durée')).toBeTruthy()
    expect(getByText('Agenda')).toBeTruthy()
    expect(getByText('Muscles')).toBeTruthy()
    expect(getByText('Exercices')).toBeTruthy()
    expect(getByText('Mesures')).toBeTruthy()
    expect(getByText('Historique')).toBeTruthy()
  })

  it('navigue au tap sur un bouton', () => {
    const { getByText } = render(
      <StatsScreenBase users={[makeUser()]} histories={[]} sets={[]} />
    )
    fireEvent.press(getByText('Durée'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('StatsDuration')
  })
})
