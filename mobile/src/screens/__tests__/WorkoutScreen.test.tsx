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

const mockValidateSet = jest.fn().mockResolvedValue(true)
const mockUnvalidateSet = jest.fn().mockResolvedValue(true)
const mockUseWorkoutState = jest.fn()

jest.mock('../../hooks/useWorkoutState', () => ({
  useWorkoutState: (...args: unknown[]) => mockUseWorkoutState(...args),
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
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    WorkoutExerciseCard: ({ sessionExercise, onValidateSet }: { sessionExercise: { id: string }; onValidateSet: (se: { id: string }, setOrder: number) => void }) =>
      React.createElement(View, null,
        React.createElement(Text, null, `Card-${sessionExercise.id}`),
        React.createElement(TouchableOpacity, { onPress: () => onValidateSet(sessionExercise, 1) },
          React.createElement(Text, null, `Validate-${sessionExercise.id}`)
        )
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
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    __esModule: true,
    default: ({ onClose }: { onClose: () => void }) =>
      React.createElement(View, null,
        React.createElement(Text, null, 'RestTimer'),
        React.createElement(TouchableOpacity, { onPress: onClose },
          React.createElement(Text, null, 'CloseTimer')
        )
      ),
  }
})

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react-native'
import { BackHandler } from 'react-native'
import { WorkoutContent } from '../WorkoutScreen'
import { createWorkoutHistory, completeWorkoutHistory } from '../../model/utils/databaseHelpers'

const mockCreateWorkoutHistory = createWorkoutHistory as jest.Mock
const mockCompleteWorkoutHistory = completeWorkoutHistory as jest.Mock

type Session = { id: string; name: string; position: number; observe: jest.Mock }
type SessionExercise = { id: string; setsTarget: number; repsTarget: string; weightTarget: number; position: number; exercise: { observe: jest.Mock; fetch: jest.Mock; id: string }; observe: jest.Mock }
type User = { id: string; timerEnabled: boolean; restDuration: number; onboardingCompleted: boolean; observe: jest.Mock }

const makeNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  setOptions: jest.fn(),
  reset: jest.fn(),
})

const makeSession = (overrides = {}): Session => ({
  id: 'sess-1',
  name: 'PPL - Push',
  position: 0,
  observe: jest.fn(),
  ...overrides,
})

const makeSessionExercise = (overrides = {}): SessionExercise => ({
  id: 'se-1',
  setsTarget: 3,
  repsTarget: '10',
  weightTarget: 60,
  position: 0,
  exercise: { observe: jest.fn(), fetch: jest.fn().mockResolvedValue({ id: 'ex-1', name: 'Squat' }), id: 'ex-1' },
  observe: jest.fn(),
  ...overrides,
})

const makeUser = (overrides = {}): User => ({
  id: 'user-1',
  timerEnabled: false,
  restDuration: 90,
  onboardingCompleted: true,
  observe: jest.fn(),
  ...overrides,
})

describe('WorkoutContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateWorkoutHistory.mockResolvedValue({ id: 'history-123' })
    mockCompleteWorkoutHistory.mockResolvedValue(undefined)
    mockValidateSet.mockResolvedValue(true)
    mockUnvalidateSet.mockResolvedValue(true)
    mockUseWorkoutState.mockReturnValue({
      setInputs: {},
      validatedSets: {},
      totalVolume: 0,
      updateSetInput: jest.fn(),
      validateSet: mockValidateSet,
      unvalidateSet: mockUnvalidateSet,
    })
  })

  describe('rendu initial', () => {
    it('se rend sans crasher avec une séance vide', () => {
      expect(() =>
        render(
          <WorkoutContent
            session={makeSession() as never}
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
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(getByText('Aucun exercice dans cette séance.')).toBeTruthy()
      })
    })

    it('affiche le bouton Terminer la séance', () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
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
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(mockCreateWorkoutHistory).toHaveBeenCalledTimes(1)
      })
    })

    it('affiche les cards pour chaque exercice', async () => {
      const exercises = [
        makeSessionExercise({ id: 'se-1' }),
        makeSessionExercise({ id: 'se-2' }),
      ]
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={exercises as never[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(getByText('Card-se-1')).toBeTruthy()
        expect(getByText('Card-se-2')).toBeTruthy()
      })
    })

    it('affiche Chargement... avant que historyId soit résolu', () => {
      mockCreateWorkoutHistory.mockReturnValue(new Promise(() => {})) // never resolves
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      expect(getByText('Chargement...')).toBeTruthy()
    })
  })

  describe('dialogue de confirmation de fin', () => {
    it('ouvre le dialogue de confirmation quand on appuie sur Terminer', () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      fireEvent.press(getByText('Terminer la séance'))
      expect(getByText('Terminer la séance ?')).toBeTruthy()
    })

    it('ferme le dialogue au clic sur Continuer', () => {
      const { getByText, queryByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      fireEvent.press(getByText('Terminer la séance'))
      fireEvent.press(getByText('Continuer'))
      expect(queryByText('Terminer la séance ?')).toBeNull()
    })

    it('appelle completeWorkoutHistory et affiche le résumé après confirmation', async () => {
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(mockCreateWorkoutHistory).toHaveBeenCalled()
      })
      fireEvent.press(getByText('Terminer la séance'))
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
          session={makeSession({ name: 'Ma Séance Test' }) as never}
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
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      expect(queryByText('RestTimer')).toBeNull()
    })

    it('affiche le RestTimer après validation d\'une série avec timerEnabled', async () => {
      const exercises = [makeSessionExercise({ id: 'se-1' })]
      const user = makeUser({ timerEnabled: true })
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={exercises as never[]}
          user={user as never}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(getByText('Card-se-1')).toBeTruthy()
      })
      await act(async () => {
        fireEvent.press(getByText('Validate-se-1'))
      })
      await waitFor(() => {
        expect(getByText('RestTimer')).toBeTruthy()
      })
    })

    it('ferme le RestTimer au clic sur CloseTimer', async () => {
      const exercises = [makeSessionExercise({ id: 'se-1' })]
      const user = makeUser({ timerEnabled: true })
      const { getByText, queryByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={exercises as never[]}
          user={user as never}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => expect(getByText('Card-se-1')).toBeTruthy())
      await act(async () => { fireEvent.press(getByText('Validate-se-1')) })
      await waitFor(() => expect(getByText('RestTimer')).toBeTruthy())
      fireEvent.press(getByText('CloseTimer'))
      expect(queryByText('RestTimer')).toBeNull()
    })

    it('ne montre pas le RestTimer si timerEnabled est false', async () => {
      const exercises = [makeSessionExercise({ id: 'se-1' })]
      const user = makeUser({ timerEnabled: false })
      const { getByText, queryByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={exercises as never[]}
          user={user as never}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => expect(getByText('Card-se-1')).toBeTruthy())
      await act(async () => { fireEvent.press(getByText('Validate-se-1')) })
      expect(queryByText('RestTimer')).toBeNull()
    })
  })

  describe('erreur de démarrage', () => {
    it('affiche l\'AlertDialog d\'erreur si createWorkoutHistory échoue', async () => {
      mockCreateWorkoutHistory.mockRejectedValue(new Error('DB error'))
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      await waitFor(() => {
        expect(getByText('Erreur')).toBeTruthy()
        expect(getByText(/Impossible de démarrer/)).toBeTruthy()
      })
    })

    it('ferme l\'AlertDialog d\'erreur et navigue en arrière au clic OK', async () => {
      mockCreateWorkoutHistory.mockRejectedValue(new Error('DB error'))
      const navigation = makeNavigation()
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )
      await waitFor(() => expect(getByText('Erreur')).toBeTruthy())
      fireEvent.press(getByText('OK'))
      expect(navigation.goBack).toHaveBeenCalled()
    })
  })

  describe('abandon de séance', () => {
    it('ouvre l\'AlertDialog d\'abandon via BackHandler', async () => {
      const backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener')
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      // Find the hardwareBackPress callback registered by the component
      const backCall = backHandlerSpy.mock.calls.find(c => c[0] === 'hardwareBackPress')
      expect(backCall).toBeDefined()
      const backCallback = backCall![1] as () => boolean

      act(() => { backCallback() })
      expect(getByText('Abandonner la séance ?')).toBeTruthy()
      backHandlerSpy.mockRestore()
    })

    it('confirme l\'abandon et navigue vers Home', async () => {
      const backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener')
      const navigation = makeNavigation()
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )
      await waitFor(() => expect(mockCreateWorkoutHistory).toHaveBeenCalled())

      const backCall = backHandlerSpy.mock.calls.find(c => c[0] === 'hardwareBackPress')
      const backCallback = backCall![1] as () => boolean
      act(() => { backCallback() })

      await act(async () => {
        fireEvent.press(getByText('Abandonner'))
      })

      await waitFor(() => {
        expect(navigation.reset).toHaveBeenCalledWith(
          expect.objectContaining({ routes: [{ name: 'Home' }] })
        )
      })
      backHandlerSpy.mockRestore()
    })

    it('annuler l\'abandon ferme la modale', async () => {
      const backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener')
      const { getByText, queryByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )
      const backCall = backHandlerSpy.mock.calls.find(c => c[0] === 'hardwareBackPress')
      const backCallback = backCall![1] as () => boolean
      act(() => { backCallback() })
      expect(getByText('Abandonner la séance ?')).toBeTruthy()

      fireEvent.press(getByText('Continuer'))
      expect(queryByText('Abandonner la séance ?')).toBeNull()
      backHandlerSpy.mockRestore()
    })
  })

  describe('fermeture du résumé', () => {
    it('fermer le résumé navigue vers Home', async () => {
      const navigation = makeNavigation()
      const { getByText } = render(
        <WorkoutContent
          session={makeSession() as never}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )
      await waitFor(() => expect(mockCreateWorkoutHistory).toHaveBeenCalled())
      fireEvent.press(getByText('Terminer la séance'))
      await act(async () => { fireEvent.press(getByText('Terminer')) })
      await waitFor(() => expect(getByText('Résumé de séance')).toBeTruthy())

      fireEvent.press(getByText('Fermer résumé'))

      await waitFor(() => {
        expect(navigation.reset).toHaveBeenCalledWith(
          expect.objectContaining({ routes: [expect.objectContaining({ name: 'Home' })] })
        )
      })
    })
  })
})
