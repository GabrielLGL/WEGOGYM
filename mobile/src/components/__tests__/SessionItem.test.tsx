// Mocks AVANT tous les imports
jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        observe: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
      }),
    }),
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
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

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import SessionItem from '../SessionItem'
import { useHaptics } from '../../hooks/useHaptics'
import type Session from '../../model/models/Session'
import type Exercise from '../../model/models/Exercise'

const mockUseHaptics = useHaptics as jest.Mock

const makeSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'sess-1',
  name: 'Push A',
  observe: jest.fn(),
  ...overrides,
} as unknown as Session)

const makeExercise = (id: string, name: string): Exercise => ({
  id,
  name,
  observe: jest.fn(),
} as unknown as Exercise)

describe('SessionItem', () => {
  let mockOnPress: jest.Mock
  let mockOnOptionsPress: jest.Mock
  let mockHapticsOnPress: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockOnPress = jest.fn()
    mockOnOptionsPress = jest.fn()
    mockHapticsOnPress = jest.fn()
    mockUseHaptics.mockReturnValue({
      onPress: mockHapticsOnPress,
      onDelete: jest.fn(),
      onSuccess: jest.fn(),
      onSelect: jest.fn(),
      onError: jest.fn(),
      onMajorSuccess: jest.fn(),
    })
  })

  describe('rendu du nom de séance', () => {
    it('devrait afficher le nom de la séance', () => {
      // Arrange
      const session = makeSession({ name: 'Push A' })

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )

      // Assert
      expect(getByText('Push A')).toBeTruthy()
    })

    it('devrait afficher un nom de séance long sans troncature', () => {
      // Arrange
      const session = makeSession({ name: 'Entraînement Full Body — Semaine 3' })

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )

      // Assert
      expect(getByText('Entraînement Full Body — Semaine 3')).toBeTruthy()
    })
  })

  describe('prévisualisation des exercices', () => {
    it('devrait ne pas afficher de preview quand la liste d\'exercices est vide', () => {
      // Arrange
      const session = makeSession()

      // Act
      const { queryByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )

      // Assert — aucun texte d'exercice ne doit apparaître
      expect(queryByText(/Squat|Développé|Tractions/)).toBeNull()
    })

    it('devrait afficher l\'unique exercice quand il n\'y en a qu\'un', () => {
      // Arrange
      const session = makeSession()
      const exercises = [makeExercise('1', 'Squat')]

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={exercises}
        />
      )

      // Assert
      expect(getByText('Squat')).toBeTruthy()
    })

    it('devrait afficher les 3 exercices séparés par des virgules', () => {
      // Arrange
      const session = makeSession()
      const exercises = [
        makeExercise('1', 'Squat'),
        makeExercise('2', 'Développé couché'),
        makeExercise('3', 'Tractions'),
      ]

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={exercises}
        />
      )

      // Assert
      expect(getByText('Squat, Développé couché, Tractions')).toBeTruthy()
    })

    it('devrait afficher exactement 3 exercices sans "..." de troncature', () => {
      // Arrange
      const session = makeSession()
      const exercises = [
        makeExercise('1', 'A'),
        makeExercise('2', 'B'),
        makeExercise('3', 'C'),
      ]

      // Act
      const { getByText, queryByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={exercises}
        />
      )

      // Assert — pas de troncature pour exactement 3 exercices
      expect(getByText('A, B, C')).toBeTruthy()
      expect(queryByText('A, B, C...')).toBeNull()
    })

    it('devrait tronquer avec "..." quand il y a plus de 3 exercices', () => {
      // Arrange
      const session = makeSession()
      const exercises = [
        makeExercise('1', 'Squat'),
        makeExercise('2', 'Développé couché'),
        makeExercise('3', 'Tractions'),
        makeExercise('4', 'Curl biceps'),
      ]

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={exercises}
        />
      )

      // Assert — seuls les 3 premiers + "..."
      expect(getByText('Squat, Développé couché, Tractions...')).toBeTruthy()
    })

    it('devrait afficher seulement les 3 premiers exercices quand il y en a 5', () => {
      // Arrange
      const session = makeSession()
      const exercises = [
        makeExercise('1', 'A'),
        makeExercise('2', 'B'),
        makeExercise('3', 'C'),
        makeExercise('4', 'D'),
        makeExercise('5', 'E'),
      ]

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={exercises}
        />
      )

      // Assert — D et E ne doivent pas apparaître dans la preview
      expect(getByText('A, B, C...')).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('devrait appeler onPress quand la zone principale est pressée', () => {
      // Arrange
      const session = makeSession({ name: 'Push A' })

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )
      fireEvent.press(getByText('Push A'))

      // Assert
      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })

    it('devrait appeler onOptionsPress quand le bouton options est pressé', () => {
      // Arrange
      const session = makeSession()

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )
      // Le bouton options affiche "•••"
      fireEvent.press(getByText('•••'))

      // Assert
      expect(mockOnOptionsPress).toHaveBeenCalledTimes(1)
    })

    it('devrait appeler haptics.onPress quand le bouton options est pressé', () => {
      // Arrange
      const session = makeSession()

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )
      fireEvent.press(getByText('•••'))

      // Assert
      expect(mockHapticsOnPress).toHaveBeenCalledTimes(1)
    })

    it('devrait appeler haptics.onPress AVANT onOptionsPress', () => {
      // Arrange
      const callOrder: string[] = []
      mockHapticsOnPress.mockImplementation(() => callOrder.push('haptics'))
      mockOnOptionsPress.mockImplementation(() => callOrder.push('options'))
      const session = makeSession()

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )
      fireEvent.press(getByText('•••'))

      // Assert — haptics doit être appelé avant le callback parent
      expect(callOrder).toEqual(['haptics', 'options'])
    })

    it('ne devrait pas appeler onOptionsPress quand la zone principale est pressée', () => {
      // Arrange
      const session = makeSession({ name: 'Leg Day' })

      // Act
      const { getByText } = render(
        <SessionItem
          session={session}
          onPress={mockOnPress}
          onOptionsPress={mockOnOptionsPress}
          exercises={[]}
        />
      )
      fireEvent.press(getByText('Leg Day'))

      // Assert
      expect(mockOnOptionsPress).not.toHaveBeenCalled()
    })
  })
})
