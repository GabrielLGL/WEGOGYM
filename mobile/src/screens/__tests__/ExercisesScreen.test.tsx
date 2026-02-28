// Mocks AVANT les imports

const mockUpdateExercise = jest.fn().mockResolvedValue(true)
const mockDeleteExercise = jest.fn().mockResolvedValue(true)
const mockLoadExerciseForEdit = jest.fn()
const mockSetSelectedExercise = jest.fn()

jest.mock('../../hooks/useExerciseManager', () => ({
  useExerciseManager: jest.fn(() => ({
    selectedExercise: null,
    setSelectedExercise: mockSetSelectedExercise,
    editExerciseData: { name: 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
    updateEditExerciseName: jest.fn(),
    updateEditExerciseMuscles: jest.fn(),
    updateEditExerciseEquipment: jest.fn(),
    updateExercise: mockUpdateExercise,
    deleteExercise: mockDeleteExercise,
    loadExerciseForEdit: mockLoadExerciseForEdit,
  })),
}))

jest.mock('../../hooks/useExerciseFilters', () => ({
  useExerciseFilters: jest.fn((exercises: unknown[]) => ({
    searchQuery: '',
    setSearchQuery: jest.fn(),
    filterMuscle: null,
    setFilterMuscle: jest.fn(),
    filterEquipment: null,
    setFilterEquipment: jest.fn(),
    filteredExercises: exercises,
  })),
}))

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
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

// Stable reference — prevents useEffect([navigation]) from re-running on re-renders
const mockNavigation = {
  addListener: jest.fn((event: string, callback: () => void) => {
    let id: ReturnType<typeof setTimeout> | null = null
    if (event === 'focus') id = setTimeout(callback, 0)
    // Return cleanup that cancels the timeout to prevent updates after unmount
    return jest.fn(() => { if (id !== null) clearTimeout(id) })
  }),
  navigate: jest.fn(),
}

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('../../components/BottomSheet', () => ({
  BottomSheet: ({ visible, children, title, onClose }: { visible: boolean; children: React.ReactNode; title?: string; onClose?: () => void }) => {
    if (!visible) return null
    const { View, Text, TouchableOpacity } = require('react-native')
    return (
      <View testID="bottom-sheet">
        {title && <Text>{title}</Text>}
        {onClose && <TouchableOpacity onPress={onClose}><Text>CloseSheet</Text></TouchableOpacity>}
        {children}
      </View>
    )
  },
}))

jest.mock('../../components/CustomModal', () => ({
  CustomModal: ({ visible, children, title, buttons }: { visible: boolean; children: React.ReactNode; title?: string; buttons?: React.ReactNode }) => {
    if (!visible) return null
    const { View, Text } = require('react-native')
    return <View testID="custom-modal">{title && <Text>{title}</Text>}{children}{buttons}</View>
  },
}))

jest.mock('../../components/AlertDialog', () => ({
  AlertDialog: ({ visible, title, message, onConfirm, onCancel, confirmText, cancelText }: {
    visible: boolean; title: string; message?: string; onConfirm: () => void; onCancel: () => void; confirmText?: string; cancelText?: string
  }) => {
    if (!visible) return null
    const { View, Text, TouchableOpacity } = require('react-native')
    return (
      <View testID="alert-dialog">
        <Text>{title}</Text>
        {message && <Text>{message}</Text>}
        {cancelText && <TouchableOpacity onPress={onCancel}><Text>{cancelText}</Text></TouchableOpacity>}
        {confirmText && <TouchableOpacity onPress={onConfirm}><Text>{confirmText}</Text></TouchableOpacity>}
      </View>
    )
  },
}))

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { ExercisesContent } from '../ExercisesScreen'
import { useExerciseManager } from '../../hooks/useExerciseManager'
import type Exercise from '../../model/models/Exercise'

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Développé couché',
  muscles: ['Pecs', 'Triceps'],
  equipment: 'Poids libre',
  isCustom: false,
  _muscles: '["Pecs","Triceps"]',
  observe: jest.fn(),
  ...overrides,
} as unknown as Exercise)

const makeManagerMock = (selectedExercise: Exercise | null) => ({
  selectedExercise,
  setSelectedExercise: mockSetSelectedExercise,
  editExerciseData: { name: selectedExercise?.name ?? 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
  updateEditExerciseName: jest.fn(),
  updateEditExerciseMuscles: jest.fn(),
  updateEditExerciseEquipment: jest.fn(),
  updateExercise: mockUpdateExercise,
  deleteExercise: mockDeleteExercise,
  loadExerciseForEdit: mockLoadExerciseForEdit,
})

describe('ExercisesContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le bouton de recherche', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText(/Rechercher un exercice/)).toBeTruthy()
  })

  it('affiche le bouton créer un exercice', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText('+ Créer un exercice')).toBeTruthy()
  })

  it('affiche le message vide quand pas d\'exercices', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    expect(getByText('Aucun exercice trouvé.')).toBeTruthy()
  })

  it('affiche la liste des exercices', () => {
    const exercises = [
      makeExercise({ id: 'ex-1', name: 'Développé couché' }),
      makeExercise({ id: 'ex-2', name: 'Squat Arrière', muscles: ['Quadriceps'], _muscles: '["Quadriceps"]' }),
    ]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    expect(getByText('Développé couché')).toBeTruthy()
    expect(getByText('Squat Arrière')).toBeTruthy()
  })

  it('affiche les muscles et l\'équipement des exercices', () => {
    const exercises = [makeExercise()]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    expect(getByText(/Pectoraux.*Triceps/)).toBeTruthy()
  })

  it('ouvre la barre de recherche au clic', () => {
    const { getByText, queryByText } = render(<ExercisesContent exercises={[]} />)
    fireEvent.press(getByText(/Rechercher un exercice/))
    expect(queryByText(/Rechercher un exercice/)).toBeNull()
  })

  it('ferme la barre de recherche avec le bouton Fermer', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    fireEvent.press(getByText(/Rechercher un exercice/))
    fireEvent.press(getByText('Fermer'))
    expect(getByText(/Rechercher un exercice/)).toBeTruthy()
  })

  it('navigue vers CreateExercise au clic sur le bouton créer', () => {
    const { getByText } = render(<ExercisesContent exercises={[]} />)
    fireEvent.press(getByText('+ Créer un exercice'))
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateExercise')
  })

  it('les exercices pré-installés n\'ont pas de bouton •••', () => {
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: false })]
    const { queryByText } = render(<ExercisesContent exercises={exercises} />)
    expect(queryByText('•••')).toBeNull()
  })

  it('affiche le bouton options (•••) uniquement pour les exercices custom', () => {
    const exercises = [
      makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }),
      makeExercise({ id: 'ex-2', name: 'Développé couché', isCustom: true }),
    ]
    const { getAllByText } = render(<ExercisesContent exercises={exercises} />)
    expect(getAllByText('•••').length).toBe(2)
  })

  it('ouvre le BottomSheet options au clic sur •••', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    expect(getByText("Modifier l'exercice")).toBeTruthy()
    expect(getByText("Supprimer l'exercice")).toBeTruthy()
  })

  it('affiche les options modifier et supprimer uniquement pour un exercice custom', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    expect(getByText("Supprimer l'exercice")).toBeTruthy()
    expect(getByText("Modifier l'exercice")).toBeTruthy()
  })

  it('ouvre la modale d\'édition depuis le BottomSheet', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Modifier l'exercice"))
    expect(getByText("Modifier l'exercice")).toBeTruthy()
    expect(mockLoadExerciseForEdit).toHaveBeenCalled()
  })

  it('ouvre l\'AlertDialog de suppression depuis le BottomSheet', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Supprimer l'exercice"))
    expect(getByText('Supprimer Squat ?')).toBeTruthy()
  })

  it('confirme la suppression et appelle deleteExercise', async () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Supprimer l'exercice"))
    fireEvent.press(getByText('Supprimer'))
    await waitFor(() => {
      expect(mockDeleteExercise).toHaveBeenCalled()
    })
  })

  it('annuler la suppression ferme l\'AlertDialog', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText, queryByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Supprimer l'exercice"))
    fireEvent.press(getByText('Annuler'))
    expect(queryByText('Supprimer Squat ?')).toBeNull()
  })

  it('appelle updateExercise et ferme la modale après édition', async () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Modifier l'exercice"))
    fireEvent.press(getByText('Enregistrer'))
    await waitFor(() => {
      expect(mockUpdateExercise).toHaveBeenCalled()
    })
  })

  it('ferme le BottomSheet via le bouton close', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText, queryByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    expect(getByText("Modifier l'exercice")).toBeTruthy()
    fireEvent.press(getByText('CloseSheet'))
    expect(queryByText("Modifier l'exercice")).toBeNull()
  })

  it('ferme la modale d\'édition au clic sur Annuler', () => {
    ;(useExerciseManager as jest.Mock).mockReturnValue(
      makeManagerMock(makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true }))
    )
    const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', isCustom: true })]
    const { getByText } = render(<ExercisesContent exercises={exercises} />)
    fireEvent.press(getByText('•••'))
    fireEvent.press(getByText("Modifier l'exercice"))
    expect(getByText("Modifier l'exercice")).toBeTruthy()
  })
})
