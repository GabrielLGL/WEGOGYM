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
import type Program from '../../model/models/Program'

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

const renderHome = (overrides: Partial<React.ComponentProps<typeof HomeContent>> = {}) =>
  render(
    <HomeContent
      user={null}
      histories={[] as unknown as History[]}
      historiesCount={0}
      sets={[] as unknown as WorkoutSet[]}
      sessions={[] as unknown as Session[]}
      userBadges={[]}
      exercises={[]}
      programs={[] as unknown as Program[]}
      {...overrides}
    />
  )

describe('HomeScreen Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('rend sans crasher avec des listes vides', () => {
    expect(() => renderHome()).not.toThrow()
  })

  it('affiche le greeting avec le prénom', () => {
    const { getByText } = renderHome({ user: makeUser() })
    expect(getByText('Salut, Gabriel !')).toBeTruthy()
  })

  it('affiche "Toi" quand pas d\'utilisateur', () => {
    const { getByText } = renderHome()
    expect(getByText('Salut, Toi !')).toBeTruthy()
  })

  it('affiche le hero action avec bouton Go ou Commencer', () => {
    const { getByText } = renderHome()
    expect(getByText('Commencer un entra\u00eenement')).toBeTruthy()
  })

  it('affiche les status strips', () => {
    const { getByText } = renderHome({ user: makeUser({ currentStreak: 5 } as Partial<User>) })
    expect(getByText('5j')).toBeTruthy()
  })

  it('affiche la section navigation unifiée', () => {
    const { getByText } = renderHome()
    expect(getByText('Statistiques & Outils')).toBeTruthy()
  })

  it('affiche les tuiles principales dans la grille', () => {
    const { getAllByText, getByText } = renderHome()
    // Programmes apparaît dans les pills et dans la grille
    expect(getAllByText('Programmes').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText("Biblioth\u00e8que d'exercices").length).toBeGreaterThanOrEqual(1)
    expect(getByText('Mesures')).toBeTruthy()
  })

  it('navigue vers un écran au press sur la grille', () => {
    const { getByText } = renderHome()
    fireEvent.press(getByText('Mesures'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('navigue vers Programmes au press sur pill', () => {
    const { getAllByText } = renderHome()
    const programButtons = getAllByText('Programmes')
    fireEvent.press(programButtons[0])
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('affiche la phrase de motivation', () => {
    const { getByText } = renderHome({ user: makeUser() })
    expect(getByText('Continue comme ça !')).toBeTruthy()
  })
})
