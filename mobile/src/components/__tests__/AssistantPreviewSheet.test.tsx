// Mocks AVANT tous les imports
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { AssistantPreviewSheet } from '../AssistantPreviewSheet'
import { useHaptics } from '../../hooks/useHaptics'
import type { GeneratedPlan } from '../../services/ai/types'

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({
    children,
    visible,
    title,
  }: {
    children: React.ReactNode
    visible: boolean
    title?: string
  }) => {
    const React = require('react')
    const { View, Text } = require('react-native')
    if (!visible) return null
    return React.createElement(
      View,
      null,
      title ? React.createElement(Text, null, title) : null,
      children
    )
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
    onSuccess: jest.fn(),
    onSelect: jest.fn(),
    onDelete: jest.fn(),
    onError: jest.fn(),
    onMajorSuccess: jest.fn(),
  }),
}))

const mockUseHaptics = useHaptics as jest.Mock

// --- Factories ---

const makeExercise = (
  exerciseName = 'Squat',
  setsTarget = 3,
  repsTarget = '10',
  weightTarget = 60
) => ({ exerciseName, setsTarget, repsTarget, weightTarget })

const makeSession = (name = 'Push A', exercises = [makeExercise()]) => ({
  name,
  exercises,
})

const makePlan = (overrides: Partial<GeneratedPlan> = {}): GeneratedPlan => ({
  name: 'Mon programme',
  sessions: [makeSession()],
  ...overrides,
})

const defaultProps = {
  visible: true,
  plan: null as GeneratedPlan | null,
  isLoading: false,
  mode: 'program' as const,
  onClose: jest.fn(),
  onModify: jest.fn(),
  onValidate: jest.fn().mockResolvedValue(undefined),
}

describe('AssistantPreviewSheet', () => {
  let mockHapticsOnPress: jest.Mock
  let mockHapticsOnSuccess: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticsOnPress = jest.fn()
    mockHapticsOnSuccess = jest.fn()
    mockUseHaptics.mockReturnValue({
      onPress: mockHapticsOnPress,
      onSuccess: mockHapticsOnSuccess,
      onSelect: jest.fn(),
      onDelete: jest.fn(),
      onError: jest.fn(),
      onMajorSuccess: jest.fn(),
    })
  })

  describe('état de chargement', () => {
    it('devrait afficher ActivityIndicator quand isLoading est vrai', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={true}
          plan={null}
        />
      )

      // Assert — ActivityIndicator doit être présent
      const { ActivityIndicator } = require('react-native')
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    })

    it('devrait afficher "Génération en cours..." quand isLoading est vrai', () => {
      // Arrange & Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={true}
          plan={null}
        />
      )

      // Assert
      expect(getByText('Génération en cours...')).toBeTruthy()
    })

    it('ne devrait pas afficher le contenu du plan quand isLoading est vrai', () => {
      // Arrange
      const plan = makePlan({ name: 'Programme muscu' })

      // Act
      const { queryByText, queryByDisplayValue } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={true}
          plan={plan}
        />
      )

      // Assert — le TextInput d'édition et le nom ne doivent pas apparaître
      expect(queryByDisplayValue('Programme muscu')).toBeNull()
      expect(queryByText('Modifier')).toBeNull()
      expect(queryByText('Valider')).toBeNull()
    })
  })

  describe('rendu avec un plan', () => {
    it('devrait afficher le nom du plan dans un TextInput éditable', () => {
      // Arrange
      const plan = makePlan({ name: 'Programme PPL' })

      // Act
      const { getByDisplayValue } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert
      expect(getByDisplayValue('Programme PPL')).toBeTruthy()
    })

    it('devrait afficher le nom de la séance dans la liste', () => {
      // Arrange
      const plan = makePlan({
        sessions: [makeSession('Séance Push'), makeSession('Séance Pull')],
      })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert
      expect(getByText('Séance Push')).toBeTruthy()
      expect(getByText('Séance Pull')).toBeTruthy()
    })

    it('devrait afficher le nom des exercices dans la liste', () => {
      // Arrange
      const plan = makePlan({
        sessions: [
          makeSession('Push A', [
            makeExercise('Développé couché'),
            makeExercise('Élévations latérales'),
          ]),
        ],
      })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert — le composant préfixe avec "• "
      expect(getByText('• Développé couché')).toBeTruthy()
      expect(getByText('• Élévations latérales')).toBeTruthy()
    })

    it('devrait afficher le format "X séries × Y · ~Zkg" quand setsTarget > 0 et weightTarget > 0', () => {
      // Arrange
      const plan = makePlan({
        sessions: [
          makeSession('Push', [makeExercise('Squat', 4, '8', 100)]),
        ],
      })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert
      expect(getByText('4 séries × 8 · ~100 kg')).toBeTruthy()
    })

    it('devrait afficher le format "X séries × Y" sans poids quand weightTarget est 0', () => {
      // Arrange
      const plan = makePlan({
        sessions: [
          makeSession('Cardio', [makeExercise('Burpees', 3, '15', 0)]),
        ],
      })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert — pas de partie poids
      expect(getByText('3 séries × 15')).toBeTruthy()
    })

    it('devrait afficher "× Y" quand setsTarget est 0 et repsTarget est défini', () => {
      // Arrange
      const plan = makePlan({
        sessions: [
          makeSession('Gainage', [makeExercise('Planche', 0, '60s', 0)]),
        ],
      })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )

      // Assert
      expect(getByText('× 60s')).toBeTruthy()
    })

    it('ne devrait pas afficher les boutons "Modifier" et "Valider" quand plan est null et isLoading est faux', () => {
      // Arrange & Act
      const { queryByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={null}
        />
      )

      // Assert
      expect(queryByText('Modifier')).toBeNull()
      expect(queryByText('Valider')).toBeNull()
    })
  })

  describe('titre selon le mode', () => {
    it('devrait afficher "Programme généré" quand mode est "program"', () => {
      // Arrange & Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          mode="program"
          plan={makePlan()}
          isLoading={false}
        />
      )

      // Assert
      expect(getByText('Programme généré')).toBeTruthy()
    })

    it('devrait afficher "Séance générée" quand mode est "session"', () => {
      // Arrange & Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          mode="session"
          plan={makePlan()}
          isLoading={false}
        />
      )

      // Assert
      expect(getByText('Séance générée')).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('devrait appeler onModify quand le bouton "Modifier" est pressé', () => {
      // Arrange
      const onModify = jest.fn()
      const plan = makePlan()

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
          onModify={onModify}
        />
      )
      fireEvent.press(getByText('Modifier'))

      // Assert
      expect(onModify).toHaveBeenCalledTimes(1)
    })

    it('devrait appeler haptics.onPress quand le bouton "Modifier" est pressé', () => {
      // Arrange
      const plan = makePlan()

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
        />
      )
      fireEvent.press(getByText('Modifier'))

      // Assert
      expect(mockHapticsOnPress).toHaveBeenCalledTimes(1)
    })

    it('devrait appeler onValidate avec le plan et le nom éditable quand "Valider" est pressé', async () => {
      // Arrange
      const onValidate = jest.fn().mockResolvedValue(undefined)
      const plan = makePlan({ name: 'Plan original' })

      // Act
      const { getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
          onValidate={onValidate}
        />
      )
      fireEvent.press(getByText('Valider'))

      // Assert
      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledTimes(1)
        expect(onValidate).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Plan original' })
        )
      })
    })

    it('devrait passer le nom édité à onValidate si le TextInput a été modifié', async () => {
      // Arrange
      const onValidate = jest.fn().mockResolvedValue(undefined)
      const plan = makePlan({ name: 'Nom initial' })

      // Act
      const { getByDisplayValue, getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
          onValidate={onValidate}
        />
      )
      fireEvent.changeText(getByDisplayValue('Nom initial'), 'Nouveau nom')
      fireEvent.press(getByText('Valider'))

      // Assert
      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Nouveau nom' })
        )
      })
    })

    it('devrait utiliser le nom du plan original si le TextInput est vidé', async () => {
      // Arrange
      const onValidate = jest.fn().mockResolvedValue(undefined)
      const plan = makePlan({ name: 'Plan secours' })

      // Act
      const { getByDisplayValue, getByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          isLoading={false}
          plan={plan}
          onValidate={onValidate}
        />
      )
      // Vider le champ — editableName.trim() === '' → fallback sur plan.name
      fireEvent.changeText(getByDisplayValue('Plan secours'), '   ')
      fireEvent.press(getByText('Valider'))

      // Assert
      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Plan secours' })
        )
      })
    })
  })

  describe('visibilité', () => {
    it('ne devrait pas rendre de contenu quand visible est faux', () => {
      // Arrange & Act
      const { queryByText } = render(
        <AssistantPreviewSheet
          {...defaultProps}
          visible={false}
          plan={makePlan()}
          isLoading={false}
        />
      )

      // Assert — le mock BottomSheet retourne null si visible=false
      expect(queryByText('Valider')).toBeNull()
      expect(queryByText('Modifier')).toBeNull()
    })
  })
})
