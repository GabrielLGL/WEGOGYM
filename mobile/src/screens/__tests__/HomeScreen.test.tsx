// Mocks AVANT les imports
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('react-native-android-widget', () => ({
  requestWidgetUpdate: jest.fn(),
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { HomeContent } from '../HomeScreen'
import type User from '../../model/models/User'
import type History from '../../model/models/History'
import type WorkoutSet from '../../model/models/Set'
import type Session from '../../model/models/Session'
import type FriendSnapshot from '../../model/models/FriendSnapshot'

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
const mockSetParams = jest.fn()
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    setParams: mockSetParams,
  }),
  useRoute: () => ({
    params: undefined,
  }),
}))

jest.mock('../../model/utils/statsHelpers', () => ({
  computeMotivationalPhrase: jest.fn().mockReturnValue('Continue comme ça !'),
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
  getMondayOfCurrentWeek: jest.fn().mockReturnValue(Date.now() - 3 * 24 * 60 * 60 * 1000),
}))

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
          user={null}
          histories={[] as unknown as History[]}
          historiesCount={0}
          sets={[] as unknown as WorkoutSet[]}
          sessions={[] as unknown as Session[]}
          userBadges={[]}
          exercises={[]}
          friends={[] as unknown as FriendSnapshot[]}
        />
      )
    ).not.toThrow()
  })

  it('affiche le greeting avec le prénom', () => {
    const { getByText } = render(
      <HomeContent
        user={makeUser()}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('Salut, Gabriel !')).toBeTruthy()
  })

  it('affiche "Toi" quand pas d\'utilisateur', () => {
    const { getByText } = render(
      <HomeContent
        user={null}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('Salut, Toi !')).toBeTruthy()
  })

  it('affiche les KPIs', () => {
    const fakeHistories = Array.from({ length: 5 }, (_, i) => ({
      id: `h-${i}`,
      startTime: new Date(Date.now() - i * 86400000),
      isAbandoned: false,
    })) as unknown as History[]
    const { getByText } = render(
      <HomeContent
        user={makeUser({ totalTonnage: 25000, totalPrs: 7 } as Partial<User>)}
        histories={fakeHistories}
        historiesCount={5}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('5')).toBeTruthy()
    expect(getByText('25.0 t')).toBeTruthy()
    expect(getByText('7')).toBeTruthy()
  })

  it('affiche les sections', () => {
    const { getByText } = render(
      <HomeContent
        user={null}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('Entra\u00eenement')).toBeTruthy()
    expect(getByText('Statistiques')).toBeTruthy()
    expect(getByText('Outils')).toBeTruthy()
  })

  it('affiche toutes les tuiles', () => {
    const { getByText, getAllByText, queryByText } = render(
      <HomeContent
        user={null}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('Programmes')).toBeTruthy()
    expect(getByText("Biblioth\u00e8que d'exercices")).toBeTruthy()
    expect(getByText('Dur\u00e9e')).toBeTruthy()
    expect(getAllByText('Volume').length).toBeGreaterThanOrEqual(1)
    expect(getByText('Agenda')).toBeTruthy()
    expect(queryByText('Muscles')).toBeNull()
    expect(queryByText('Exercices & Records')).toBeNull()
    expect(getByText('Mesures')).toBeTruthy()
    expect(queryByText('Historique')).toBeNull()
    expect(getByText('Classement')).toBeTruthy()
  })

  it('navigue vers un écran stack au press', () => {
    const { getByText } = render(
      <HomeContent
        user={null}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    fireEvent.press(getByText('Dur\u00e9e'))
    expect(mockNavigate).toHaveBeenCalledWith('StatsDuration')
  })

  it('navigue vers Programmes au press', () => {
    const { getByText } = render(
      <HomeContent
        user={null}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    fireEvent.press(getByText('Programmes'))
    expect(mockNavigate).toHaveBeenCalledWith('Programs')
  })

  it('affiche la phrase de motivation', () => {
    const { getByText } = render(
      <HomeContent
        user={makeUser()}
        histories={[] as unknown as History[]}
        historiesCount={0}
        sets={[] as unknown as WorkoutSet[]}
        sessions={[] as unknown as Session[]}
        userBadges={[]}
        exercises={[]}
        friends={[] as unknown as FriendSnapshot[]}
      />
    )
    expect(getByText('Continue comme ça !')).toBeTruthy()
  })
})
