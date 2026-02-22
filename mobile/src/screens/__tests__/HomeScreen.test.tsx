// Mocks AVANT les imports
jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
        fetch: jest.fn().mockResolvedValue([]),
        fetchCount: jest.fn().mockResolvedValue(0),
      }),
    }),
    write: jest.fn().mockResolvedValue(undefined),
    batch: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}))

jest.mock('../../model/utils/statsHelpers', () => ({
  computeGlobalKPIs: jest.fn().mockReturnValue({
    totalSessions: 42,
    totalVolumeKg: 12500,
    totalPRs: 7,
  }),
  computeMotivationalPhrase: jest.fn().mockReturnValue('Continue comme ça !'),
  formatVolume: jest.fn((v: number) => `${v} kg`),
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { HomeContent } from '../HomeScreen'
import type User from '../../model/models/User'
import type History from '../../model/models/History'
import type WorkoutSet from '../../model/models/Set'

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'Gabriel',
  observe: jest.fn(),
  ...overrides,
} as unknown as User)

describe('HomeScreen Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('rend sans crasher avec des listes vides', () => {
    expect(() =>
      render(
        <HomeContent
          users={[]}
          histories={[] as unknown as History[]}
          sets={[] as unknown as WorkoutSet[]}
        />
      )
    ).not.toThrow()
  })

  it('affiche le greeting avec le prénom', () => {
    const { getByText } = render(
      <HomeContent
        users={[makeUser()]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('Salut, Gabriel !')).toBeTruthy()
  })

  it('affiche "Toi" quand pas d\'utilisateur', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('Salut, Toi !')).toBeTruthy()
  })

  it('affiche les KPIs', () => {
    const { getByText } = render(
      <HomeContent
        users={[makeUser()]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('42')).toBeTruthy()
    expect(getByText('12500 kg')).toBeTruthy()
    expect(getByText('7')).toBeTruthy()
  })

  it('affiche les 3 sections', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('Entra\u00eenement')).toBeTruthy()
    expect(getByText('Statistiques')).toBeTruthy()
    expect(getByText('Outils')).toBeTruthy()
  })

  it('affiche toutes les tuiles', () => {
    const { getByText, getAllByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('Programmes')).toBeTruthy()
    expect(getByText('Exercices')).toBeTruthy()
    expect(getByText('Dur\u00e9e')).toBeTruthy()
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(2)
    expect(getByText('Agenda')).toBeTruthy()
    expect(getByText('Muscles')).toBeTruthy()
    expect(getByText('Exercices & Records')).toBeTruthy()
    expect(getByText('Mesures')).toBeTruthy()
    expect(getByText('Historique')).toBeTruthy()
    expect(getByText('Assistant')).toBeTruthy()
    expect(getByText('R\u00e9glages')).toBeTruthy()
  })

  it('navigue vers un écran stack au press', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    fireEvent.press(getByText('Dur\u00e9e'))
    expect(mockNavigate).toHaveBeenCalledWith('StatsDuration')
  })

  it('navigue vers un tab au press', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    fireEvent.press(getByText('Assistant'))
    expect(mockNavigate).toHaveBeenCalledWith('Assistant')
  })

  it('affiche la phrase de motivation', () => {
    const { getByText } = render(
      <HomeContent
        users={[makeUser()]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
      />
    )
    expect(getByText('Continue comme ça !')).toBeTruthy()
  })
})
