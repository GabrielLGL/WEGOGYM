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

// Use inline mock functions — accessed later via the mock module reference
jest.mock('../../hooks/useSessionManager', () => ({
  useSessionManager: jest.fn().mockReturnValue({
    targetSets: '3',
    setTargetSets: jest.fn(),
    targetReps: '10',
    setTargetReps: jest.fn(),
    targetWeight: '60',
    setTargetWeight: jest.fn(),
    isFormValid: true,
    selectedSessionExercise: null,
    setSelectedSessionExercise: jest.fn(),
    addExercise: jest.fn().mockResolvedValue(true),
    updateTargets: jest.fn().mockResolvedValue(true),
    removeExercise: jest.fn().mockResolvedValue(true),
    prepareEditTargets: jest.fn(),
    resetTargets: jest.fn(),
    reorderExercises: jest.fn(),
  }),
}))

jest.mock('../../components/SessionExerciseItem', () => {
  const React = require('react')
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    SessionExerciseItem: ({ item, onEditTargets, onRemove }: { item: { id: string }; onEditTargets: (se: { id: string }) => void; onRemove: (se: { id: string }, name: string) => void }) =>
      React.createElement(View, null,
        React.createElement(Text, null, `Item-${item.id}`),
        React.createElement(TouchableOpacity, { onPress: () => onEditTargets(item) },
          React.createElement(Text, null, `Edit-${item.id}`)
        ),
        React.createElement(TouchableOpacity, { onPress: () => onRemove(item, `Exercice-${item.id}`) },
          React.createElement(Text, null, `Remove-${item.id}`)
        ),
      ),
  }
})

jest.mock('../../components/ExercisePickerModal', () => {
  const React = require('react')
  const { View, Text, TouchableOpacity } = require('react-native')
  return {
    ExercisePickerModal: ({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (exoId: string, sets: string, reps: string, weight: string) => void }) =>
      visible
        ? React.createElement(View, null,
            React.createElement(Text, null, 'Choisir un exercice'),
            React.createElement(TouchableOpacity, { onPress: onClose },
              React.createElement(Text, null, 'Fermer picker')
            ),
            React.createElement(TouchableOpacity, { onPress: () => onAdd('ex-1', '3', '10', '60') },
              React.createElement(Text, null, 'Ajouter Squat')
            ),
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
import { SessionDetailContent } from '../SessionDetailScreen'
import { useSessionManager } from '../../hooks/useSessionManager'
import type Session from '../../model/models/Session'
import type SessionExercise from '../../model/models/SessionExercise'
import type User from '../../model/models/User'

// Get mock function references from the mocked module
const getSessionManagerMocks = () => (useSessionManager as jest.Mock).mock.results[0]?.value

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

const makeExercise = (id: string, name: string) =>
  ({ id, name, primaryMuscle: 'Pecs', equipment: 'Barre' }) as never

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
            exercises={[]}
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
          exercises={[]}
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
          exercises={[]}
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
          exercises={[]}
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
          exercises={[]}
          user={null}
          navigation={navigation as never}
        />
      )

      expect(navigation.setOptions).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ma Super Séance' })
      )
    })

    it('affiche les items de session exercise', () => {
      const sessionExos = [
        makeSessionExercise({ id: 'se-1' }),
        makeSessionExercise({ id: 'se-2' }),
      ]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
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
      const sessionExos = [makeSessionExercise()]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession({ id: 'sess-1' })}
          sessionExercises={sessionExos}
          exercises={[]}
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
          exercises={[]}
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
          exercises={[]}
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
          exercises={[]}
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

    it('ajouter un exercice appelle addExercise et ferme le picker', async () => {
      const exercises = [makeExercise('ex-1', 'Squat')]
      const { getByText, queryByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          exercises={exercises}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('+ AJOUTER UN EXERCICE'))
      })

      await act(async () => {
        fireEvent.press(getByText('Ajouter Squat'))
      })

      const mocks = getSessionManagerMocks()
      await waitFor(() => {
        expect(mocks.addExercise).toHaveBeenCalledWith('ex-1', '3', '10', '60', exercises[0])
      })

      expect(queryByText('Choisir un exercice')).toBeNull()
    })
  })

  describe('édition des targets', () => {
    it('cliquer sur Edit ouvre la modale édition', () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Edit-se-1'))
      })

      const mocks = getSessionManagerMocks()
      expect(mocks.prepareEditTargets).toHaveBeenCalled()
      expect(getByText("Modifier l'objectif")).toBeTruthy()
    })

    it('enregistrer les targets appelle updateTargets', async () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Edit-se-1'))
      })

      await act(async () => {
        fireEvent.press(getByText('Enregistrer'))
      })

      const mocks = getSessionManagerMocks()
      await waitFor(() => {
        expect(mocks.updateTargets).toHaveBeenCalled()
      })
    })
  })

  describe('suppression d\'exercice', () => {
    it('cliquer sur Remove ouvre l\'AlertDialog', () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Remove-se-1'))
      })

      expect(getByText(/Supprimer Exercice-se-1/)).toBeTruthy()
    })

    it('confirmer la suppression appelle removeExercise', async () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Remove-se-1'))
      })

      await act(async () => {
        fireEvent.press(getByText('Supprimer'))
      })

      const mocks = getSessionManagerMocks()
      await waitFor(() => {
        expect(mocks.removeExercise).toHaveBeenCalled()
      })
    })

    it('annuler la suppression ne supprime pas', () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Remove-se-1'))
      })

      fireEvent.press(getByText('Annuler'))

      const mocks = getSessionManagerMocks()
      expect(mocks.removeExercise).not.toHaveBeenCalled()
    })
  })

  describe('RestTimer', () => {
    it('n\'affiche pas le RestTimer par défaut', () => {
      const { queryByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          exercises={[]}
          user={null}
          navigation={makeNavigation() as never}
        />
      )

      expect(queryByText('RestTimer')).toBeNull()
    })

    it("n'affiche pas le RestTimer après ajout même si timerEnabled", async () => {
      const exercises = [makeExercise('ex-1', 'Squat')]
      const { getByText, queryByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={[]}
          exercises={exercises}
          user={makeUser({ timerEnabled: true })}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('+ AJOUTER UN EXERCICE'))
      })

      await act(async () => {
        fireEvent.press(getByText('Ajouter Squat'))
      })

      await waitFor(() => {
        expect(queryByText('RestTimer')).toBeNull()
      })
    })

    it("n'affiche pas le RestTimer après update targets même si timerEnabled", async () => {
      const sessionExos = [makeSessionExercise({ id: 'se-1' })]

      const { getByText, queryByText } = render(
        <SessionDetailContent
          session={makeSession()}
          sessionExercises={sessionExos}
          exercises={[]}
          user={makeUser({ timerEnabled: true })}
          navigation={makeNavigation() as never}
        />
      )

      act(() => {
        fireEvent.press(getByText('Edit-se-1'))
      })

      await act(async () => {
        fireEvent.press(getByText('Enregistrer'))
      })

      await waitFor(() => {
        expect(queryByText('RestTimer')).toBeNull()
      })
    })
  })
})
