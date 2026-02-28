/**
 * Tests for ProgramDetailScreen.tsx.
 * withObservables mocked as identity — default export IS ProgramDetailScreenInner.
 * useProgramManager mocked to avoid DB calls.
 * ThemeContext mocked globally via moduleNameMapper.
 */
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

// Mock BottomSheet to remove animation/useEffect complexity in tests
jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({
    visible,
    children,
    title,
  }: {
    visible: boolean
    children: React.ReactNode
    title?: string
    onClose: () => void
  }) => {
    if (!visible) return null
    const mockReact = require('react')
    const { View, Text } = require('react-native')
    return mockReact.createElement(
      View,
      null,
      title ? mockReact.createElement(Text, null, title) : null,
      children,
    )
  },
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      }),
      findAndObserve: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    }),
  },
}))

jest.mock('@nozbe/with-observables', () =>
  (_keys: unknown, _fn: unknown) =>
  (Component: React.ComponentType<unknown>) => Component
)

jest.mock('@nozbe/watermelondb', () => ({
  Q: {
    where: jest.fn(),
    sortBy: jest.fn(),
    asc: 'asc',
  },
}))

jest.mock('../../contexts/LanguageContext', () => {
  const { translations } = require('../../i18n')
  return {
    useLanguage: () => ({
      language: 'fr',
      t: translations['fr'],
      setLanguage: jest.fn(),
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

jest.mock('../../hooks/useProgramManager', () => ({
  useProgramManager: () => ({
    sessionNameInput: '',
    setSessionNameInput: jest.fn(),
    isRenamingSession: false,
    setIsRenamingSession: jest.fn(),
    selectedSession: null,
    setSelectedSession: jest.fn(),
    setTargetProgram: jest.fn(),
    saveSession: jest.fn().mockResolvedValue(true),
    duplicateSession: jest.fn().mockResolvedValue(undefined),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    moveSession: jest.fn().mockResolvedValue(undefined),
    prepareRenameSession: jest.fn(),
  }),
}))

jest.mock('../../components/ProgramDetailBottomSheet', () => ({
  SessionPreviewRow: ({ session }: { session: { name: string } }) => {
    const mockReact = require('react')
    const { Text } = require('react-native')
    return mockReact.createElement(Text, null, session.name)
  },
}))

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ProgramDetailScreen from '../ProgramDetailScreen'
import type Program from '../../model/models/Program'
import type Session from '../../model/models/Session'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/index'

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as unknown as NativeStackNavigationProp<RootStackParamList, 'ProgramDetail'>

const mockRoute = {
  params: { programId: 'p1' },
  key: 'ProgramDetail',
  name: 'ProgramDetail',
} as never

const makeProgram = (overrides: Partial<{ id: string; name: string }> = {}): Program =>
  ({ id: 'p1', name: 'Programme PPL', ...overrides }) as unknown as Program

const makeSession = (overrides: Partial<{ id: string; name: string }> = {}): Session =>
  ({ id: 's1', name: 'Push', ...overrides }) as unknown as Session

describe('ProgramDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing with empty sessions', () => {
    expect(() =>
      render(
        <ProgramDetailScreen
          program={makeProgram()}
          sessions={[]}
          programs={[makeProgram()]}
          navigation={mockNavigation}
          route={mockRoute}
        />
      )
    ).not.toThrow()
  })

  it('shows empty state when no sessions', () => {
    const { getByText } = render(
      <ProgramDetailScreen
        program={makeProgram()}
        sessions={[]}
        programs={[makeProgram()]}
        navigation={mockNavigation}
        route={mockRoute}
      />
    )
    expect(getByText("Aucune séance pour l'instant")).toBeTruthy()
  })

  it('shows "Ajouter une séance" button', () => {
    const { getByText } = render(
      <ProgramDetailScreen
        program={makeProgram()}
        sessions={[]}
        programs={[makeProgram()]}
        navigation={mockNavigation}
        route={mockRoute}
      />
    )
    expect(getByText('+ Ajouter une séance')).toBeTruthy()
  })

  it('shows session names when sessions are provided', () => {
    const sessions = [makeSession({ id: 's1', name: 'Push' }), makeSession({ id: 's2', name: 'Pull' })]
    const { getByText } = render(
      <ProgramDetailScreen
        program={makeProgram()}
        sessions={sessions}
        programs={[makeProgram()]}
        navigation={mockNavigation}
        route={mockRoute}
      />
    )
    expect(getByText('Push')).toBeTruthy()
    expect(getByText('Pull')).toBeTruthy()
  })

  it('calls navigation.setOptions with program name', () => {
    render(
      <ProgramDetailScreen
        program={makeProgram({ name: 'Mon Programme' })}
        sessions={[]}
        programs={[makeProgram()]}
        navigation={mockNavigation}
        route={mockRoute}
      />
    )
    expect(mockNavigation.setOptions).toHaveBeenCalledWith({ title: 'Mon Programme' })
  })

  it('pressing "Ajouter une séance" opens the choice bottom sheet', () => {
    const { getByText } = render(
      <ProgramDetailScreen
        program={makeProgram()}
        sessions={[]}
        programs={[makeProgram()]}
        navigation={mockNavigation}
        route={mockRoute}
      />
    )
    fireEvent.press(getByText('+ Ajouter une séance'))
    expect(getByText('Créer manuellement')).toBeTruthy()
    expect(getByText("Générer par l'IA")).toBeTruthy()
  })
})
