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
        sortBy: jest.fn().mockReturnThis(),
      }),
      findAndObserve: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
      create: jest.fn().mockResolvedValue({}),
    }),
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => { await fn() }),
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
  getNextPosition: jest.fn().mockResolvedValue(0),
  parseNumericInput: jest.fn((v: string) => parseFloat(v) || 0),
  parseIntegerInput: jest.fn((v: string) => parseInt(v, 10) || 0),
}))

jest.mock('../../model/utils/validationHelpers', () => ({
  validateWorkoutInput: jest.fn().mockReturnValue({ valid: true }),
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

jest.mock('../../hooks/useSessionManager', () => ({
  useSessionManager: jest.fn().mockReturnValue({
    targetSets: '',
    setTargetSets: jest.fn(),
    targetReps: '',
    setTargetReps: jest.fn(),
    targetWeight: '',
    setTargetWeight: jest.fn(),
    isFormValid: false,
    selectedSessionExercise: null,
    setSelectedSessionExercise: jest.fn(),
    addExercise: jest.fn().mockResolvedValue(true),
    updateTargets: jest.fn().mockResolvedValue(true),
    removeExercise: jest.fn().mockResolvedValue(true),
    prepareEditTargets: jest.fn(),
    resetTargets: jest.fn(),
  }),
}))

jest.mock('../../components/SessionExerciseItem', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    SessionExerciseItem: ({ item }: { item: { id: string } }) =>
      React.createElement(View, null,
        React.createElement(Text, null, `Item-${item.id}`)
      ),
  }
})

jest.mock('../../components/ExercisePickerModal', () => {
  const React = require('react')
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    ExercisePickerModal: ({ visible, onClose }: { visible: boolean; onClose: () => void }) =>
      visible
        ? React.createElement(View, null,
            React.createElement(Text, null, 'Choisir un exercice'),
            React.createElement(TouchableOpacity, { onPress: onClose },
              React.createElement(Text, null, 'Fermer picker')
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
import { render, fireEvent, act } from '@testing-library/react-native'
import { SessionDetailContent } from '../SessionDetailScreen'
import type Session from '../../model/models/Session'
import type SessionExercise from '../../model/models/SessionExercise'
import type User from '../../model/models/User'

const makeNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  setOptions: jest.fn(),
})

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'sess-1',
  name: 'Push Day',
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
  exercise: {
    observe: jest.fn(),
    fetch: jest.fn().mockResolvedValue({ id: 'ex-1', name: 'Squat' }),
    id: 'ex-1',
  },
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

describe('SessionDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendu initial', () => {
    it('se rend sans crasher avec une liste vide', () => {
      expect(() =>
        render(
          <SessionDetailContent
            session={makeSession()}
            sessionExercises={[]}
            user={null}
            navigation={makeNavigation() as never}
          />
        )
      ).not.toThrow()
    })

    it('affiche le message vide quand aucun exercice', () => {
      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('Ajoutez un exercice pour commencer.')).toBeTruthy()
    })

    it('affiche le bouton Lancer l\'entrainement', () => {
      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('▶ LANCER L\'ENTRAINEMENT')).toBeTruthy()
    })

    it('affiche le bouton Ajouter un exercice', () => {
      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('+ AJOUTER UN EXERCICE')).toBeTruthy()
    })

    it('configure les options de navigation avec le nom de la séance', () => {
      const navigation = makeNavigation()
      render(
        <SessionDetailContent
          session={makeSession({ name: 'Ma Super Séance' })}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )

      expect(navigation.setOptions).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ma Super Séance' })
      )
    })

    it('affiche les items de session exercise', () => {
      const exercises = [
        makeSessionExercise({ id: 'se-1' }),
        makeSessionExercise({ id: 'se-2' }),
      ]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={exercises}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(getByText('Item-se-1')).toBeTruthy()
      expect(getByText('Item-se-2')).toBeTruthy()
    })
  })

  describe('navigation vers l\'entrainement', () => {
    it('navigue vers Workout au clic sur Lancer (si exercices présents)', () => {
      const navigation = makeNavigation()
      const exercises = [makeSessionExercise()]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession({ id: 'sess-1' })}
          sessionExercises={exercises}
          user={null}
          navigation={navigation as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('▶ LANCER L\'ENTRAINEMENT'))
      })

      expect(navigation.navigate).toHaveBeenCalledWith('Workout', { sessionId: 'sess-1' })
    })

    it('bouton Lancer désactivé quand aucun exercice', () => {
      const navigation = makeNavigation()

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('▶ LANCER L\'ENTRAINEMENT'))
      })

      expect(navigation.navigate).not.toHaveBeenCalled()
    })
  })

  describe('modale d\'ajout d\'exercice', () => {
    it('ouvre la modale picker au clic sur Ajouter un exercice', () => {
      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('+ AJOUTER UN EXERCICE'))
      })

      expect(getByText('Choisir un exercice')).toBeTruthy()
    })

    it('ferme la modale picker au clic sur Fermer picker', () => {
      const { getByText, queryByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('+ AJOUTER UN EXERCICE'))
      })

      act(() => {
        fireEvent.press(getByText('Fermer picker'))
      })

      expect(queryByText('Choisir un exercice')).toBeNull()
    })
  })

  describe('RestTimer', () => {
    it('n\'affiche pas le RestTimer par défaut', () => {
      const { queryByText } = render(
        <SessionDetailContent
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
