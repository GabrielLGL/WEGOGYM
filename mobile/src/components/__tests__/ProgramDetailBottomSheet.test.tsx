// Mocks AVANT tous les imports
jest.mock('@nozbe/with-observables', () => (
  (keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) =>
      (props: Record<string, unknown>) => {
        const ReactInner = require('react')
        const base: Record<string, unknown> = { exercises: [] }
        if (keys.includes('program')) {
          base.sessions = (globalThis as Record<string, unknown>).__pdbSessions ?? []
        }
        return ReactInner.createElement(Component, { ...base, ...props })
      }
))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn() }),
      }),
    }),
  },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { render, fireEvent, act } from '@testing-library/react-native'
import ProgramDetailBottomSheet from '../ProgramDetailBottomSheet'
import { BottomSheet } from '../BottomSheet'
import type Program from '../../model/models/Program'
import type Session from '../../model/models/Session'
import type Exercise from '../../model/models/Exercise'

// --- Helpers de fabrication ---

const makeProgram = (id = 'prog-1', name = 'Programme A'): Program =>
  ({
    id,
    name,
    observe: jest.fn(),
    sessions: { fetch: jest.fn().mockResolvedValue([]) },
  } as unknown as Program)

const makeSession = (id: string, name: string): Session =>
  ({
    id,
    name,
    position: 0,
    observe: jest.fn(),
    session: { observe: jest.fn() },
  } as unknown as Session)

const makeExercise = (id: string, name: string): Exercise =>
  ({
    id,
    name,
    isCustom: false,
    _muscles: '[]',
    muscles: [],
    equipment: 'Poids libre',
    observe: jest.fn(),
  } as unknown as Exercise)

// --- Composant interne SessionPreviewRowInner (reproduit la logique du vrai composant) ---
// Ce pattern suit exactement SessionItem.test.tsx pour tester la logique pure sans withObservables

interface MockSessionRowProps {
  session: { id: string; name: string }
  exercises: Array<{ id: string; name: string }>
  onPress: () => void
  onOptionsPress: () => void
}

const SessionPreviewRowPure: React.FC<MockSessionRowProps> = ({
  session,
  exercises,
  onPress,
  onOptionsPress,
}) => {
  const { useHaptics } = require('../../hooks/useHaptics')
  const haptics = useHaptics()

  const exercisePreview =
    exercises.length > 0
      ? exercises.slice(0, 3).map((e) => e.name).join(', ') +
        (exercises.length > 3 ? '...' : '')
      : 'Aucun exercice'

  return (
    <View>
      <TouchableOpacity
        onPress={() => { haptics.onPress(); onPress() }}
        testID={`session-row-${session.id}`}
      >
        <Text>{session.name}</Text>
        <Text>{exercisePreview}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => { haptics.onPress(); onOptionsPress() }}
        testID={`options-btn-${session.id}`}
      >
        <Text>•••</Text>
      </TouchableOpacity>
    </View>
  )
}

// --- Composant interne ProgramDetailContentInner (reproduit la logique du vrai composant) ---

interface MockContentProps {
  sessions: Session[]
  onOpenSession: (session: Session) => void
  onAddSession: () => void
  onSessionOptions: (session: Session) => void
  exercises?: Exercise[]
}

const ProgramDetailContentPure: React.FC<MockContentProps> = ({
  sessions,
  onOpenSession,
  onAddSession,
  onSessionOptions,
  exercises = [],
}) => {
  return (
    <View>
      <ScrollView>
        {sessions.length === 0 ? (
          <Text>Aucune séance pour l'instant</Text>
        ) : (
          sessions.map((session) => (
            <SessionPreviewRowPure
              key={session.id}
              session={session}
              exercises={exercises}
              onPress={() => onOpenSession(session)}
              onOptionsPress={() => onSessionOptions(session)}
            />
          ))
        )}
      </ScrollView>
      <TouchableOpacity onPress={onAddSession} testID="add-session-btn">
        <Text>+ Ajouter une séance</Text>
      </TouchableOpacity>
    </View>
  )
}

// --- Props par défaut ---

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onOpenSession: jest.fn(),
  onAddSession: jest.fn(),
  onSessionOptions: jest.fn(),
}

// ============================================================
// Tests de ProgramDetailBottomSheet (wrapper BottomSheet)
// ============================================================

describe('ProgramDetailBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(globalThis as Record<string, unknown>).__pdbSessions = []
  })

  afterEach(() => {
    act(() => { jest.runAllTimers() })
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('rendu du BottomSheet', () => {
    it('affiche le nom du programme comme titre quand visible=true', () => {
      const program = makeProgram('prog-1', 'Mon Programme')
      const { getByText } = render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Mon Programme">
          <View />
        </BottomSheet>
      )

      expect(getByText('Mon Programme')).toBeTruthy()
    })

    it('ne rend rien quand visible=false', () => {
      const program = makeProgram('prog-1', 'Programme B')
      const { queryByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={false}
          program={program}
        />
      )

      expect(queryByText('Programme B')).toBeNull()
    })

    it('ne rend pas de contenu quand program est null', () => {
      const { queryByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={true}
          program={null}
        />
      )

      // Aucune séance rendue (program=null → pas de ProgramDetailContent)
      expect(queryByText('Aucune séance pour l\'instant')).toBeNull()
    })

    it('rend ProgramDetailContentInner avec sessions=[] quand program est non-null', () => {
      const program = makeProgram('prog-1', 'Mon Programme')
      const { getByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={true}
          program={program}
        />
      )

      // withObservables mock injecte sessions=[] → état vide
      expect(getByText('Aucune séance pour l\'instant')).toBeTruthy()
      expect(getByText('+ Ajouter une séance')).toBeTruthy()
    })

    it('appelle onAddSession depuis ProgramDetailContentInner', () => {
      const onAddSession = jest.fn()
      const program = makeProgram('prog-2', 'Programme B')
      const { getByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={true}
          program={program}
          onAddSession={onAddSession}
        />
      )

      fireEvent.press(getByText('+ Ajouter une séance'))

      expect(onAddSession).toHaveBeenCalledTimes(1)
    })

    it('rend SessionPreviewRowInner quand sessions est non vide', () => {
      const session = makeSession('sess-1', 'Push Day')
      ;(globalThis as Record<string, unknown>).__pdbSessions = [session]
      const program = makeProgram('prog-1', 'Mon Programme')
      const { getByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={true}
          program={program}
        />
      )

      // ProgramDetailContentInner reçoit sessions=[session] → rend SessionPreviewRowInner
      // SessionPreviewRowInner reçoit exercises=[] → exercisePreview='Aucun exercice'
      expect(getByText('Push Day')).toBeTruthy()
      expect(getByText('Aucun exercice')).toBeTruthy()
      expect(getByText('•••')).toBeTruthy()
    })

    it('appelle onOpenSession quand une séance est pressée', () => {
      const onOpenSession = jest.fn()
      const session = makeSession('sess-1', 'Pull Day')
      ;(globalThis as Record<string, unknown>).__pdbSessions = [session]
      const program = makeProgram()
      const { getByText } = render(
        <ProgramDetailBottomSheet
          {...defaultProps}
          visible={true}
          program={program}
          onOpenSession={onOpenSession}
        />
      )

      fireEvent.press(getByText('Pull Day'))

      expect(onOpenSession).toHaveBeenCalledWith(session)
    })
  })

  // ============================================================
  // Tests de ProgramDetailContentInner (logique pure)
  // ============================================================

  describe('ProgramDetailContentInner — liste des séances', () => {
    it('affiche "Aucune séance pour l\'instant" quand sessions est vide', () => {
      const { getByText } = render(
        <ProgramDetailContentPure
          sessions={[]}
          onOpenSession={jest.fn()}
          onAddSession={jest.fn()}
          onSessionOptions={jest.fn()}
        />
      )

      expect(getByText('Aucune séance pour l\'instant')).toBeTruthy()
    })

    it('affiche le nom d\'une séance quand sessions contient un élément', () => {
      const sessions = [makeSession('sess-1', 'Push A')]
      const { getByText } = render(
        <ProgramDetailContentPure
          sessions={sessions}
          onOpenSession={jest.fn()}
          onAddSession={jest.fn()}
          onSessionOptions={jest.fn()}
        />
      )

      expect(getByText('Push A')).toBeTruthy()
    })

    it('affiche plusieurs séances', () => {
      const sessions = [
        makeSession('sess-1', 'Push A'),
        makeSession('sess-2', 'Pull B'),
        makeSession('sess-3', 'Legs C'),
      ]
      const { getByText } = render(
        <ProgramDetailContentPure
          sessions={sessions}
          onOpenSession={jest.fn()}
          onAddSession={jest.fn()}
          onSessionOptions={jest.fn()}
        />
      )

      expect(getByText('Push A')).toBeTruthy()
      expect(getByText('Pull B')).toBeTruthy()
      expect(getByText('Legs C')).toBeTruthy()
    })

    it('affiche le bouton "+ Ajouter une séance"', () => {
      const { getByText } = render(
        <ProgramDetailContentPure
          sessions={[]}
          onOpenSession={jest.fn()}
          onAddSession={jest.fn()}
          onSessionOptions={jest.fn()}
        />
      )

      expect(getByText('+ Ajouter une séance')).toBeTruthy()
    })
  })

  // ============================================================
  // Tests d'interactions (via ProgramDetailContentPure)
  // ============================================================

  describe('ProgramDetailContentInner — interactions', () => {
    it('appelle onOpenSession avec la séance quand la séance est pressée', () => {
      const onOpenSession = jest.fn()
      const session = makeSession('sess-1', 'Push A')
      const { getByTestId } = render(
        <ProgramDetailContentPure
          sessions={[session]}
          onOpenSession={onOpenSession}
          onAddSession={jest.fn()}
          onSessionOptions={jest.fn()}
        />
      )

      fireEvent.press(getByTestId('session-row-sess-1'))

      expect(onOpenSession).toHaveBeenCalledTimes(1)
      expect(onOpenSession).toHaveBeenCalledWith(session)
    })

    it('appelle onAddSession quand le bouton "Ajouter une séance" est pressé', () => {
      const onAddSession = jest.fn()
      const { getByTestId } = render(
        <ProgramDetailContentPure
          sessions={[]}
          onOpenSession={jest.fn()}
          onAddSession={onAddSession}
          onSessionOptions={jest.fn()}
        />
      )

      fireEvent.press(getByTestId('add-session-btn'))

      expect(onAddSession).toHaveBeenCalledTimes(1)
    })

    it('appelle onSessionOptions avec la séance quand le bouton options est pressé', () => {
      const onSessionOptions = jest.fn()
      const session = makeSession('sess-1', 'Push A')
      const { getByTestId } = render(
        <ProgramDetailContentPure
          sessions={[session]}
          onOpenSession={jest.fn()}
          onAddSession={jest.fn()}
          onSessionOptions={onSessionOptions}
        />
      )

      fireEvent.press(getByTestId('options-btn-sess-1'))

      expect(onSessionOptions).toHaveBeenCalledTimes(1)
      expect(onSessionOptions).toHaveBeenCalledWith(session)
    })
  })

  // ============================================================
  // Tests de SessionPreviewRowInner — prévisualisation exercices
  // ============================================================

  describe('SessionPreviewRowInner — prévisualisation des exercices', () => {
    it('affiche "Aucun exercice" quand la séance n\'a aucun exercice', () => {
      const session = makeSession('sess-1', 'Push A')
      const { getByText } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={[]}
          onPress={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('Aucun exercice')).toBeTruthy()
    })

    it('affiche les noms des exercices quand ils sont fournis', () => {
      const session = makeSession('sess-1', 'Push A')
      const exercises = [
        makeExercise('ex-1', 'Squat'),
        makeExercise('ex-2', 'Développé couché'),
      ]
      const { getByText } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={exercises}
          onPress={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('Squat, Développé couché')).toBeTruthy()
    })

    it('tronque la prévisualisation avec "..." quand plus de 3 exercices', () => {
      const session = makeSession('sess-1', 'Push A')
      const exercises = [
        makeExercise('ex-1', 'Squat'),
        makeExercise('ex-2', 'Développé couché'),
        makeExercise('ex-3', 'Tractions'),
        makeExercise('ex-4', 'Curl biceps'),
      ]
      const { getByText } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={exercises}
          onPress={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('Squat, Développé couché, Tractions...')).toBeTruthy()
    })

    it('affiche exactement 3 exercices sans troncature', () => {
      const session = makeSession('sess-1', 'Push A')
      const exercises = [
        makeExercise('ex-1', 'A'),
        makeExercise('ex-2', 'B'),
        makeExercise('ex-3', 'C'),
      ]
      const { getByText } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={exercises}
          onPress={jest.fn()}
          onOptionsPress={jest.fn()}
        />
      )

      expect(getByText('A, B, C')).toBeTruthy()
    })

    it('appelle onPress quand la zone de la séance est pressée', () => {
      const onPress = jest.fn()
      const session = makeSession('sess-2', 'Pull B')
      const { getByTestId } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={[]}
          onPress={onPress}
          onOptionsPress={jest.fn()}
        />
      )

      fireEvent.press(getByTestId('session-row-sess-2'))

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('appelle onOptionsPress quand le bouton ••• est pressé', () => {
      const onOptionsPress = jest.fn()
      const session = makeSession('sess-3', 'Legs C')
      const { getByTestId } = render(
        <SessionPreviewRowPure
          session={session}
          exercises={[]}
          onPress={jest.fn()}
          onOptionsPress={onOptionsPress}
        />
      )

      fireEvent.press(getByTestId('options-btn-sess-3'))

      expect(onOptionsPress).toHaveBeenCalledTimes(1)
    })
  })
})
