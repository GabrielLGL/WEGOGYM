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
  buildWeeklyActivity: jest.fn().mockReturnValue(
    Array.from({ length: 7 }, (_, i) => ({
      dateKey: `2026-02-${String(i + 24).padStart(2, '0')}`,
      dayLabel: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
      dayNumber: i + 24,
      isToday: false,
      isPast: true,
      sessions: [],
    }))
  ),
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { HomeContent } from '../HomeScreen'
import type User from '../../model/models/User'
import type History from '../../model/models/History'
import type WorkoutSet from '../../model/models/Set'
import type Session from '../../model/models/Session'

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
          sessions={[] as unknown as Session[]}
          userBadges={[]}
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
        sessions={[] as unknown as Session[]}
        userBadges={[]}
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
        sessions={[] as unknown as Session[]}
        userBadges={[]}
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
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    expect(getByText('42')).toBeTruthy()
    expect(getByText('12500 kg')).toBeTruthy()
    expect(getByText('7')).toBeTruthy()
  })

  it('affiche les 2 sections', () => {
    const { getByText, queryByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    expect(getByText('Entra\u00eenement')).toBeTruthy()
    expect(getByText('Statistiques')).toBeTruthy()
    expect(queryByText('Outils')).toBeNull()
  })

  it('affiche toutes les tuiles', () => {
    const { getByText, getAllByText, queryByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    expect(getByText('Programmes')).toBeTruthy()
    expect(getByText("Biblioth\u00e8que d'exercices")).toBeTruthy()
    expect(getByText('Dur\u00e9e')).toBeTruthy()
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(2)
    expect(getByText('Agenda')).toBeTruthy()
    expect(queryByText('Muscles')).toBeNull()
    expect(queryByText('Exercices & Records')).toBeNull()
    expect(getByText('Mesures')).toBeTruthy()
    expect(queryByText('Historique')).toBeNull()
  })

  it('navigue vers un écran stack au press', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    fireEvent.press(getByText('Dur\u00e9e'))
    expect(mockNavigate).toHaveBeenCalledWith('StatsDuration')
  })

  it('navigue vers Programmes au press', () => {
    const { getByText } = render(
      <HomeContent
        users={[]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    fireEvent.press(getByText('Programmes'))
    expect(mockNavigate).toHaveBeenCalledWith('Programs')
  })

  it('affiche la phrase de motivation', () => {
    const { getByText } = render(
      <HomeContent
        users={[makeUser()]}
        histories={[] as unknown as History[]}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
      />
    )
    expect(getByText('Continue comme ça !')).toBeTruthy()
  })
})
