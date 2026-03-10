// Mocks AVANT les imports

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import type History from '../../model/models/History'
import type WorkoutSet from '../../model/models/Set'
import type Session from '../../model/models/Session'

import HistoryDetailScreen from '../HistoryDetailScreen'

const mockGoBack = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: { historyId: 'hist-1' },
  }),
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

const mockBatch = jest.fn().mockResolvedValue(undefined)
const mockDestroyPermanently = jest.fn().mockResolvedValue(undefined)
const mockFetchExercises = jest.fn().mockResolvedValue([])

jest.mock('../../model/index', () => {
  const mockQuery = jest.fn().mockReturnValue({
    fetch: (...args: unknown[]) => mockFetchExercises(...args),
    fetchCount: jest.fn().mockResolvedValue(0),
    observe: jest.fn().mockReturnValue({
      pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      subscribe: jest.fn(),
    }),
  })
  return {
    database: {
      get: jest.fn().mockReturnValue({
        query: mockQuery,
        findAndObserve: jest.fn().mockReturnValue({
          pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
          subscribe: jest.fn(),
        }),
      }),
      write: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
      batch: (...args: unknown[]) => mockBatch(...args),
    },
  }
})

const mockSoftDeleteHistory = jest.fn().mockResolvedValue(undefined)
const mockAddRetroactiveSet = jest.fn().mockResolvedValue(undefined)
const mockRecalculateSetPrs = jest.fn().mockResolvedValue(undefined)
const mockRecalculateSetPrsBatch = jest.fn().mockResolvedValue(undefined)

jest.mock('../../model/utils/databaseHelpers', () => ({
  softDeleteHistory: (...args: unknown[]) => mockSoftDeleteHistory(...args),
  addRetroactiveSet: (...args: unknown[]) => mockAddRetroactiveSet(...args),
  recalculateSetPrs: (...args: unknown[]) => mockRecalculateSetPrs(...args),
  recalculateSetPrsBatch: (...args: unknown[]) => mockRecalculateSetPrsBatch(...args),
}))

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

// Mock withObservables to pass through props AND inject required data
jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _mapFn: (props: Record<string, unknown>) => Record<string, unknown>) =>
    (Component: React.ComponentType<Record<string, unknown>>) => {
      // Return a wrapper that injects mock data based on keys
      const Wrapper = (props: Record<string, unknown>) => {
        // If historyId is passed, inject mock history
        if ('historyId' in props) {
          return <Component {...props} history={mockHistory} />
        }
        // If history is passed, inject sets and session
        if ('history' in props) {
          return <Component {...props} history={mockHistory} sets={mockSets} session={mockSession} />
        }
        // If exerciseId is passed, inject mock exercise
        if ('exerciseId' in props) {
          return <Component {...props} exercise={mockExercise} />
        }
        return <Component {...props} />
      }
      Wrapper.displayName = `withObservables(${Component.displayName || Component.name || 'Component'})`
      return Wrapper
    }
))

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

jest.mock('../../components/Button', () => ({
  Button: ({ children, onPress, disabled }: { children: React.ReactNode; onPress?: () => void; disabled?: boolean }) => {
    const { TouchableOpacity, Text } = require('react-native')
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <Text>{children}</Text>
      </TouchableOpacity>
    )
  },
}))

// Mock data
const mockHistory = {
  id: 'hist-1',
  startTime: new Date('2026-03-07T10:00:00'),
  endTime: new Date('2026-03-07T11:00:00'),
  note: 'Bonne séance',
  session: { id: 'session-1', observe: jest.fn() },
  observe: jest.fn(),
  prepareUpdate: jest.fn().mockImplementation((fn: (h: Record<string, unknown>) => void) => {
    const rec = { note: '' }
    fn(rec)
    return rec
  }),
} as unknown as History

const mockSets: WorkoutSet[] = [
  {
    id: 'set-1',
    weight: 80,
    reps: 10,
    setOrder: 1,
    isPR: false,
    exercise: { id: 'ex-1' },
    observe: jest.fn(),
    prepareUpdate: jest.fn().mockImplementation((fn: (s: Record<string, unknown>) => void) => {
      const rec = { weight: 0, reps: 0 }
      fn(rec)
      return rec
    }),
    destroyPermanently: mockDestroyPermanently,
  } as unknown as WorkoutSet,
  {
    id: 'set-2',
    weight: 85,
    reps: 8,
    setOrder: 2,
    isPR: false,
    exercise: { id: 'ex-1' },
    observe: jest.fn(),
    prepareUpdate: jest.fn().mockImplementation((fn: (s: Record<string, unknown>) => void) => {
      const rec = { weight: 0, reps: 0 }
      fn(rec)
      return rec
    }),
    destroyPermanently: mockDestroyPermanently,
  } as unknown as WorkoutSet,
]

const mockSession = {
  id: 'session-1',
  name: 'Push Day',
  observe: jest.fn(),
} as unknown as Session

const mockExercise = {
  id: 'ex-1',
  name: 'Développé couché',
  muscles: ['Pecs'],
  equipment: 'Poids libre',
  observe: jest.fn(),
}

describe('HistoryDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchExercises.mockResolvedValue([
      { id: 'ex-1', name: 'Développé couché', muscles: ['Pecs'], equipment: 'Poids libre' },
    ])
  })

  it('rend sans crash', () => {
    const { toJSON } = render(<HistoryDetailScreen />)
    expect(toJSON()).toBeTruthy()
  })

  it('affiche le nom de la session', async () => {
    const { getByText } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getByText('Push Day')).toBeTruthy()
    })
  })

  it('affiche la date de la séance', async () => {
    const { getByText } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      // Date formatted in french locale
      expect(getByText(/mars 2026/)).toBeTruthy()
    })
  })

  it('affiche la durée de la séance', async () => {
    const { getByText } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getByText(/1h/)).toBeTruthy()
    })
  })

  it('affiche la note existante', () => {
    const { getByDisplayValue } = render(<HistoryDetailScreen />)
    expect(getByDisplayValue('Bonne séance')).toBeTruthy()
  })

  it('affiche les séries avec poids et reps', async () => {
    const { getByDisplayValue } = render(<HistoryDetailScreen />)
    expect(getByDisplayValue('80')).toBeTruthy()
    expect(getByDisplayValue('10')).toBeTruthy()
  })

  it('affiche le bouton supprimer la séance', async () => {
    const { getByText } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getByText(/supprimer/i)).toBeTruthy()
    })
  })

  it('affiche le bouton ajouter une série', async () => {
    const { getAllByText } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getAllByText(/ajouter une série/i).length).toBeGreaterThan(0)
    })
  })

  it('ouvre la confirmation de suppression de séance', async () => {
    const { getByText, getByTestId } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getByText('Supprimer la séance')).toBeTruthy()
    })
    fireEvent.press(getByText('Supprimer la séance'))
    await waitFor(() => {
      expect(getByTestId('alert-dialog')).toBeTruthy()
    })
  })

  it('le bouton sauvegarder est présent', () => {
    const { getByText } = render(<HistoryDetailScreen />)
    expect(getByText('Enregistrer les modifications')).toBeTruthy()
  })

  it('appelle softDeleteHistory lors de la suppression', async () => {
    const { getByText, getByTestId } = render(<HistoryDetailScreen />)
    await waitFor(() => {
      expect(getByText('Supprimer la séance')).toBeTruthy()
    })
    fireEvent.press(getByText('Supprimer la séance'))
    await waitFor(() => {
      expect(getByTestId('alert-dialog')).toBeTruthy()
    })
    // Press confirm button in alert
    fireEvent.press(getByText('Supprimer'))
    await waitFor(() => {
      expect(mockSoftDeleteHistory).toHaveBeenCalledWith('hist-1')
    })
  })
})
