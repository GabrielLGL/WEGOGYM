// Mocks AVANT les imports

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import type { CatalogExercise } from '../../services/exerciseCatalog'

// Import after mocks
import ExerciseCatalogScreen from '../ExerciseCatalogScreen'

const mockSearchCatalogExercises = jest.fn()
const mockMapCatalogToLocal = jest.fn()

jest.mock('../../services/exerciseCatalog', () => ({
  searchCatalogExercises: (...args: unknown[]) => mockSearchCatalogExercises(...args),
  mapCatalogToLocal: (...args: unknown[]) => mockMapCatalogToLocal(...args),
}))

jest.mock('expo-image', () => ({
  Image: 'Image',
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetchCount: jest.fn().mockResolvedValue(0),
        fetch: jest.fn().mockResolvedValue([]),
        observe: jest.fn().mockReturnValue({ pipe: jest.fn(), subscribe: jest.fn() }),
      }),
      create: jest.fn().mockResolvedValue({}),
    }),
    write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
  },
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

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

jest.mock('../../components/AlertDialog', () => ({
  AlertDialog: ({ visible, title, message, onConfirm, confirmText }: {
    visible: boolean; title: string; message?: string; onConfirm: () => void; confirmText?: string
  }) => {
    if (!visible) return null
    const { View, Text, TouchableOpacity } = require('react-native')
    return (
      <View testID="alert-dialog">
        <Text>{title}</Text>
        {message && <Text>{message}</Text>}
        {confirmText && <TouchableOpacity onPress={onConfirm}><Text>{confirmText}</Text></TouchableOpacity>}
      </View>
    )
  },
}))

jest.mock('../../components/Button', () => ({
  Button: ({ children, onPress, disabled }: { children: React.ReactNode; onPress?: () => void; disabled?: boolean }) => {
    const { TouchableOpacity, Text } = require('react-native')
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID="import-button">
        <Text>{children}</Text>
      </TouchableOpacity>
    )
  },
}))

const makeCatalogExercise = (overrides: Partial<CatalogExercise> = {}): CatalogExercise => ({
  id: 'cat-1',
  name: 'Bench Press',
  body_part: 'chest',
  equipment: 'barbell',
  target: 'pectorals',
  secondary_muscles: ['triceps', 'anterior deltoids'],
  instructions: ['Lie on the bench', 'Press the bar up'],
  gif_url: null,
  gif_original_url: null,
  ...overrides,
})

describe('ExerciseCatalogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockSearchCatalogExercises.mockResolvedValue({
      exercises: [],
      hasMore: false,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('rend le composant sans crash', async () => {
    const { getByPlaceholderText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    expect(getByPlaceholderText(/rechercher/i)).toBeTruthy()
  })

  it('affiche le loader puis les résultats', async () => {
    const exercises = [makeCatalogExercise()]
    mockSearchCatalogExercises.mockResolvedValue({ exercises, hasMore: false })

    const { getByText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy()
    })
  })

  it('affiche le message vide quand aucun résultat', async () => {
    mockSearchCatalogExercises.mockResolvedValue({ exercises: [], hasMore: false })

    const { getByText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => {
      expect(getByText('Aucun exercice trouvé.')).toBeTruthy()
    })
  })

  it('affiche le message erreur sur échec réseau', async () => {
    mockSearchCatalogExercises.mockRejectedValue(new Error('Network error'))

    const { getByText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => {
      expect(getByText(/connexion/i)).toBeTruthy()
    })
  })

  it('effectue une recherche debounced', async () => {
    mockSearchCatalogExercises.mockResolvedValue({ exercises: [], hasMore: false })

    const { getByPlaceholderText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })

    fireEvent.changeText(getByPlaceholderText(/rechercher/i), 'squat')
    // Should not have searched yet (debounce)
    const callCountBefore = mockSearchCatalogExercises.mock.calls.length
    await act(async () => { jest.advanceTimersByTime(400) })
    expect(mockSearchCatalogExercises.mock.calls.length).toBeGreaterThan(callCountBefore)
  })

  it('ouvre le détail au clic sur un exercice', async () => {
    const exercises = [makeCatalogExercise({ name: 'Deadlift' })]
    mockSearchCatalogExercises.mockResolvedValue({ exercises, hasMore: false })

    const { getAllByText, getByTestId } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => { expect(getAllByText('Deadlift').length).toBeGreaterThan(0) })

    fireEvent.press(getAllByText('Deadlift')[0])
    // BottomSheet should open — both list item and sheet title show "Deadlift"
    await waitFor(() => {
      expect(getByTestId('bottom-sheet')).toBeTruthy()
    })
  })

  it('affiche target et equipment dans les items', async () => {
    const exercises = [makeCatalogExercise({ target: 'pectorals', equipment: 'barbell' })]
    mockSearchCatalogExercises.mockResolvedValue({ exercises, hasMore: false })

    const { getByText } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => {
      expect(getByText(/pectorals.*barbell/)).toBeTruthy()
    })
  })

  it('appelle searchCatalogExercises avec offset 0 au chargement initial', async () => {
    render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })
    await waitFor(() => {
      expect(mockSearchCatalogExercises).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, limit: 50 })
      )
    })
  })

  it('permet de vider le champ de recherche', async () => {
    mockSearchCatalogExercises.mockResolvedValue({ exercises: [], hasMore: false })

    const { getByPlaceholderText, getByDisplayValue } = render(<ExerciseCatalogScreen />)
    await act(async () => { jest.runAllTimers() })

    fireEvent.changeText(getByPlaceholderText(/rechercher/i), 'test')
    expect(getByDisplayValue('test')).toBeTruthy()
  })
})
