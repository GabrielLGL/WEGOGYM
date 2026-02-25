// Mocks AVANT tous les imports
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
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

jest.mock('../../model/utils/databaseHelpers', () => ({
  filterExercises: jest.fn((exercises: unknown[]) => exercises),
}))

jest.mock('../../model/utils/validationHelpers', () => ({
  validateWorkoutInput: jest.fn().mockReturnValue({ valid: true }),
}))

jest.mock('../../model/constants', () => ({
  MUSCLES_LIST: ['Pecs', 'Dos', 'Jambes'],
  EQUIPMENT_LIST: ['Poids libre', 'Machine'],
}))

jest.mock('../../components/ChipSelector', () => ({
  ChipSelector: ({
    onChange,
    noneLabel,
  }: {
    onChange: (v: string | null) => void
    noneLabel: string
    items: string[]
    selectedValue: string | null
  }) => {
    const { TouchableOpacity, Text } = require('react-native')
    const React = require('react')
    return React.createElement(
      TouchableOpacity,
      { onPress: () => onChange(null), testID: `chip-${noneLabel}` },
      React.createElement(Text, null, noneLabel)
    )
  },
}))

jest.mock('../../components/ExerciseTargetInputs', () => ({
  ExerciseTargetInputs: ({
    onSetsChange,
    onRepsChange,
    onWeightChange,
  }: {
    sets: string
    reps: string
    weight: string
    onSetsChange: (v: string) => void
    onRepsChange: (v: string) => void
    onWeightChange: (v: string) => void
  }) => {
    const { View, TextInput } = require('react-native')
    const React = require('react')
    return React.createElement(
      View,
      null,
      React.createElement(TextInput, { testID: 'input-sets', onChangeText: onSetsChange }),
      React.createElement(TextInput, { testID: 'input-reps', onChangeText: onRepsChange }),
      React.createElement(TextInput, { testID: 'input-weight', onChangeText: onWeightChange })
    )
  },
}))

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { ExercisePickerModal } from '../ExercisePickerModal'
import { filterExercises } from '../../model/utils/databaseHelpers'
import { validateWorkoutInput } from '../../model/utils/validationHelpers'
import type Exercise from '../../model/models/Exercise'

const mockFilterExercises = filterExercises as jest.Mock
const mockValidateWorkoutInput = validateWorkoutInput as jest.Mock

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

const defaultExercises = [
  makeExercise('ex-1', 'Squat'),
  makeExercise('ex-2', 'Développé couché'),
  makeExercise('ex-3', 'Tractions'),
]

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  exercises: defaultExercises,
  onAdd: jest.fn().mockResolvedValue(undefined),
}

describe('ExercisePickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFilterExercises.mockImplementation((exercises: Exercise[]) => exercises)
    mockValidateWorkoutInput.mockReturnValue({ valid: true })
  })

  describe('visibilité', () => {
    it('retourne null quand visible est false', () => {
      const { queryByText } = render(
        <ExercisePickerModal {...defaultProps} visible={false} />
      )

      expect(queryByText('Bibliothèque')).toBeNull()
    })

    it('affiche le titre "Bibliothèque" quand visible est true', () => {
      const { getByText } = render(<ExercisePickerModal {...defaultProps} />)

      expect(getByText('Bibliothèque')).toBeTruthy()
    })
  })

  describe('rendu de la liste d\'exercices', () => {
    it('affiche les exercices retournés par filterExercises', () => {
      const { getByText } = render(<ExercisePickerModal {...defaultProps} />)

      expect(getByText('Squat')).toBeTruthy()
      expect(getByText('Développé couché')).toBeTruthy()
      expect(getByText('Tractions')).toBeTruthy()
    })

    it('affiche une liste vide sans crash quand exercises est vide', () => {
      mockFilterExercises.mockReturnValue([])
      const { queryByText, getByText } = render(
        <ExercisePickerModal {...defaultProps} exercises={[]} />
      )

      expect(getByText('Bibliothèque')).toBeTruthy()
      expect(queryByText('Squat')).toBeNull()
    })

    it('affiche les exercices filtrés par filterExercises', () => {
      const filtered = [makeExercise('ex-1', 'Squat')]
      mockFilterExercises.mockReturnValue(filtered)

      const { getByText, queryByText } = render(<ExercisePickerModal {...defaultProps} />)

      expect(getByText('Squat')).toBeTruthy()
      expect(queryByText('Développé couché')).toBeNull()
    })
  })

  describe('sélection d\'un exercice', () => {
    it('sélectionne un exercice et active le bouton Ajouter', () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      // Avant sélection : onAdd ne doit pas être appelé
      fireEvent.press(getByText('Ajouter'))
      expect(onAdd).not.toHaveBeenCalled()

      // Après sélection : onAdd doit être appelé
      fireEvent.press(getByText('Squat'))
      act(() => { fireEvent.press(getByText('Ajouter')) })
      expect(onAdd).toHaveBeenCalledTimes(1)
    })

    it('appelle onHapticSelect quand un exercice est sélectionné', () => {
      const onHapticSelect = jest.fn()
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onHapticSelect={onHapticSelect} />
      )

      fireEvent.press(getByText('Développé couché'))

      expect(onHapticSelect).toHaveBeenCalledTimes(1)
    })

    it('n\'appelle pas onHapticSelect si la prop est absente', () => {
      expect(() => {
        const { getByText } = render(
          <ExercisePickerModal {...defaultProps} onHapticSelect={undefined} />
        )
        fireEvent.press(getByText('Squat'))
      }).not.toThrow()
    })
  })

  describe('validation du formulaire', () => {
    it('n\'appelle pas onAdd quand aucun exercice n\'est sélectionné', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).not.toHaveBeenCalled()
    })

    it('n\'appelle pas onAdd quand le formulaire est invalide même avec exercice sélectionné', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      fireEvent.press(getByText('Squat'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).not.toHaveBeenCalled()
    })

    it('appelle onAdd quand un exercice est sélectionné et le formulaire est valide', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: true })
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      fireEvent.press(getByText('Squat'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('bouton Ajouter', () => {
    it('appelle onAdd avec les bons arguments quand le formulaire est valide', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal
          {...defaultProps}
          onAdd={onAdd}
          initialSets="3"
          initialReps="10"
          initialWeight="60"
        />
      )

      fireEvent.press(getByText('Squat'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).toHaveBeenCalledTimes(1)
      expect(onAdd).toHaveBeenCalledWith('ex-1', '3', '10', '60')
    })

    it('passe les valeurs saisies dans les inputs à onAdd', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText, getByTestId } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      fireEvent.changeText(getByTestId('input-sets'), '4')
      fireEvent.changeText(getByTestId('input-reps'), '12')
      fireEvent.changeText(getByTestId('input-weight'), '80')

      fireEvent.press(getByText('Tractions'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).toHaveBeenCalledWith('ex-3', '4', '12', '80')
    })
  })

  describe('bouton Annuler', () => {
    it('appelle onClose quand le bouton Annuler est pressé', () => {
      const onClose = jest.fn()
      const { getByText } = render(
        <ExercisePickerModal {...defaultProps} onClose={onClose} />
      )

      fireEvent.press(getByText('Annuler'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('réinitialisation à la fermeture', () => {
    it('efface la sélection quand visible passe à false puis true', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText, rerender } = render(
        <ExercisePickerModal {...defaultProps} onAdd={onAdd} />
      )

      // Sélectionner un exercice
      fireEvent.press(getByText('Squat'))

      // Vérifier que l'exercice est bien sélectionné (onAdd peut être appelé)
      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })
      expect(onAdd).toHaveBeenCalledTimes(1)
      jest.clearAllMocks()

      // Fermer la modale (déclenche le reset via useEffect)
      rerender(<ExercisePickerModal {...defaultProps} onAdd={onAdd} visible={false} />)

      // Rouvrir
      rerender(<ExercisePickerModal {...defaultProps} onAdd={onAdd} visible={true} />)

      // Après réouverture, aucun exercice sélectionné → onAdd ne doit plus être appelé
      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })
      expect(onAdd).not.toHaveBeenCalled()
    })
  })

  describe('appel à filterExercises', () => {
    it('appelle filterExercises avec les exercices et les filtres courants', () => {
      render(<ExercisePickerModal {...defaultProps} />)

      expect(mockFilterExercises).toHaveBeenCalledWith(
        defaultExercises,
        null,
        null
      )
    })

    it('affiche les filtres ChipSelector pour muscles et équipement', () => {
      const { getByText } = render(<ExercisePickerModal {...defaultProps} />)

      expect(getByText('Tous muscles')).toBeTruthy()
      expect(getByText('Tout équipement')).toBeTruthy()
    })
  })

  describe('valeurs initiales', () => {
    it('utilise les valeurs initiales fournies', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal
          {...defaultProps}
          onAdd={onAdd}
          initialSets="5"
          initialReps="8"
          initialWeight="100"
        />
      )

      fireEvent.press(getByText('Squat'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).toHaveBeenCalledWith('ex-1', '5', '8', '100')
    })

    it('utilise des chaînes vides par défaut si initialSets/Reps/Weight ne sont pas fournis', async () => {
      const onAdd = jest.fn().mockResolvedValue(undefined)
      const { getByText } = render(
        <ExercisePickerModal
          visible={true}
          onClose={jest.fn()}
          exercises={defaultExercises}
          onAdd={onAdd}
        />
      )

      fireEvent.press(getByText('Squat'))

      await act(async () => {
        fireEvent.press(getByText('Ajouter'))
      })

      expect(onAdd).toHaveBeenCalledWith('ex-1', '', '', '')
    })
  })
})
