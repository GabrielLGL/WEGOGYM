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
      findAndObserve: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
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

jest.mock('../../model/utils/databaseHelpers', () => ({
  createWorkoutHistory: jest.fn().mockResolvedValue({ id: 'history-123' }),
  completeWorkoutHistory: jest.fn().mockResolvedValue(undefined),
  getLastPerformanceForExercise: jest.fn().mockResolvedValue(null),
}))

jest.mock('../../model/utils/validationHelpers', () => ({
  validateSetInput: jest.fn().mockReturnValue({ valid: true }),
}))

jest.mock('../../services/notificationService', () => ({
  setupNotificationChannel: jest.fn().mockResolvedValue(undefined),
  requestNotificationPermission: jest.fn().mockResolvedValue(false),
}))

jest.mock('../../hooks/useWorkoutTimer', () => ({
  useWorkoutTimer: jest.fn().mockReturnValue({ formattedTime: '00:00' }),
}))

jest.mock('../../hooks/useWorkoutState', () => ({
  useWorkoutState: jest.fn().mockReturnValue({
    setInputs: {},
    validatedSets: {},
    totalVolume: 0,
    updateSetInput: jest.fn(),
    validateSet: jest.fn().mockResolvedValue(true),
    unvalidateSet: jest.fn().mockResolvedValue(true),
  }),
}))

jest.mock('../../hooks/useKeyboardAnimation', () => ({
  useKeyboardAnimation: jest.fn().mockReturnValue({ interpolate: jest.fn(() => 0), setValue: jest.fn() }),
}))

jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    onPress: jest.fn(),
    onDelete: jest.fn(),
    onSuccess: jest.fn(),
    onSelect: jest.fn(),
    onError: jest.fn(),
    onMajorSuccess: jest.fn(),
  }),
}))

jest.mock('../../hooks/useModalState', () => ({
  useModalState: jest.fn().mockReturnValue({
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
    setIsOpen: jest.fn(),
  }),
}))

jest.mock('../../components/WorkoutExerciseCard', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    WorkoutExerciseCard: ({ sessionExercise }: { sessionExercise: { id: string } }) =>
      React.createElement(View, null,
        React.createElement(Text, null, `Card-${sessionExercise.id}`)
      ),
  }
})

jest.mock('../../components/WorkoutSummarySheet', () => {
  const React = require('react')
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    WorkoutSummarySheet: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
      visible
        ? React.createElement(View, null,
            React.createElement(Text, null, 'Résumé de séance'),
            React.createElement(TouchableOpacity, { onPress: onClose },
              React.createElement(Text, null, 'Fermer résumé')
            )
          )
        : null,
  }
})

jest.mock('../../components/RestTimer', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    __esModule: true,
    default: () => React.createElement(View, null, React.createElement(Text, null, 'RestTimer')),
  }
})

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react-native'
import { WorkoutContent } from '../WorkoutScreen'
import { createWorkoutHistory, completeWorkoutHistory } from '../../model/utils/databaseHelpers'
import type Session from '../../model/models/Session'
import type SessionExercise from '../../model/models/SessionExercise'
import type User from '../../model/models/User'

const mockCreateWorkoutHistory = createWorkoutHistory as jest.Mock
const mockCompleteWorkoutHistory = completeWorkoutHistory as jest.Mock

const makeNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  setOptions: jest.fn(),
})

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'sess-1',
  name: 'PPL - Push',
  position: 0,
  observe: jest.fn(),
  ...overrides,
} as unknown as Session)

const makeSessionExercise = (overrides: Partial<SessionExercise> = {}): SessionExercise => ({
  id: 'se-1',
  setsTarget: 3,
  repsTarget: '10',
  weightTarget: 60,
  position: 0,
  exercise: { observe: jest.fn(), fetch: jest.fn().mockResolvedValue({ id: 'ex-1', name: 'Squat' }), id: 'ex-1' },
  observe: jest.fn(),
  ...overrides,
} as unknown as SessionExercise)

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  timerEnabled: false,
  restDuration: 90,
  onboardingCompleted: true,
  observe: jest.fn(),
  ...overrides,
} as unknown as User)

describe('WorkoutContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateWorkoutHistory.mockResolvedValue({ id: 'history-123' })
    mockCompleteWorkoutHistory.mockResolvedValue(undefined)
  })

  describe('rendu initial', () => {
    it('se rend sans crasher avec une séance vide', async () => {
      expect(() =>
        render(
          <WorkoutContent
            session={makeSession()}
            sessionExercises={[]}
            user={null}
            navigation={makeNavigation() as never}
          />
        )
      ).not.toThrow()
    })

    it('affiche le message vide quand aucun exercice', async () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('Aucun exercice dans cette séance.')).toBeTruthy()
    })

    it('affiche le bouton Terminer la séance', () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('Terminer la séance')).toBeTruthy()
    })

    it('crée l\'historique de séance au montage', async () => {
      render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      await waitFor(() => {
        expect(mockCreateWorkoutHistory).toHaveBeenCalledTimes(1)
      })
    })

    it('affiche les cards pour chaque exercice', () => {
      const exercises = [
        makeSessionExercise({ id: 'se-1' }),
        makeSessionExercise({ id: 'se-2' }),
      ]

      const { getByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={exercises}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('Card-se-1')).toBeTruthy()
      expect(getByText('Card-se-2')).toBeTruthy()
    })
  })

  describe('dialogue de confirmation de fin', () => {
    it('ouvre le dialogue de confirmation quand on appuie sur Terminer', () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Terminer la séance'))
      })

      expect(getByText('Terminer la séance ?')).toBeTruthy()
    })

    it('ferme le dialogue au clic sur Continuer', () => {
      const { getByText, queryByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Terminer la séance'))
      })

      act(() => {
        fireEvent.press(getByText('Continuer'))
      })

      expect(queryByText('Terminer la séance ?')).toBeNull()
    })

    it('appelle completeWorkoutHistory et affiche le résumé après confirmation', async () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      await waitFor(() => {
        expect(mockCreateWorkoutHistory).toHaveBeenCalled()
      })

      act(() => {
        fireEvent.press(getByText('Terminer la séance'))
      })

      await act(async () => {
        fireEvent.press(getByText('Terminer'))
      })

      await waitFor(() => {
        expect(getByText('Résumé de séance')).toBeTruthy()
      })
    })
  })

  describe('configuration de navigation', () => {
    it('configure les options de navigation avec le nom de la séance', () => {
      const navigation = makeNavigation()
      render(
        <WorkoutContent
          session={makeSession({ name: 'Ma Séance Test' })}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )

      expect(navigation.setOptions).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ma Séance Test' })
      )
    })
  })

  describe('timer de repos', () => {
    it('n\'affiche pas le RestTimer par défaut', () => {
      const { queryByText } = render(
        <WorkoutContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(queryByText('RestTimer')).toBeNull()
    })
  })
})
