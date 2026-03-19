import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

import { StatsScreenBase } from '../StatsScreen'

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
      <StatsScreenBase user={null} histories={[]} sets={[]} />
    )
    expect(getByText('Toi')).toBeTruthy()
  })

  it('affiche le nom de l\'utilisateur', () => {
    const { getByText } = render(
      <StatsScreenBase user={makeUser('Gabriel')} histories={[]} sets={[]} />
    )
    expect(getByText('Gabriel')).toBeTruthy()
  })

  it('affiche les KPIs (Séances, Volume, Records)', () => {
    const { getByText, getAllByText } = render(
      <StatsScreenBase user={makeUser()} histories={[]} sets={[]} />
    )
    expect(getByText('Séances')).toBeTruthy()
    // "Volume" apparaît à la fois comme KPI et comme bouton grille
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(1)
    // "Records" apparaît à la fois comme KPI et comme bouton grille (PR Timeline)
    expect(getAllByText('Records').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche les 6 boutons de navigation', () => {
    const { getByText, queryByText } = render(
      <StatsScreenBase user={makeUser()} histories={[]} sets={[]} />
    )
    expect(getByText('Durée')).toBeTruthy()
    expect(getByText('Agenda')).toBeTruthy()
    expect(getByText('Exercices')).toBeTruthy()
    expect(getByText('Mesures')).toBeTruthy()
    expect(getByText('Historique')).toBeTruthy()
    expect(queryByText('Muscles')).toBeNull()
  })

  it('navigue au tap sur un bouton', () => {
    const { getByText } = render(
      <StatsScreenBase user={makeUser()} histories={[]} sets={[]} />
    )
    fireEvent.press(getByText('Durée'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('StatsDuration')
  })
})
