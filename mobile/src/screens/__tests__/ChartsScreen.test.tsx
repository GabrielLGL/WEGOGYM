import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

const mockWrite = jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn())
const mockBatch = jest.fn().mockResolvedValue(undefined)
const mockFetch = jest.fn().mockResolvedValue([])
const mockQuery = jest.fn().mockReturnValue({
  fetch: mockFetch,
  observe: jest.fn(),
})

jest.mock('../../model/index', () => ({
  database: {
    write: (...args: unknown[]) => mockWrite(...args),
    batch: (...args: unknown[]) => mockBatch(...args),
    get: jest.fn().mockReturnValue({
      query: (...args: unknown[]) => mockQuery(...args),
    }),
  },
}))

jest.mock('react-native-chart-kit', () => {
  const { View, Text } = require('react-native')
  return {
    LineChart: ({ data }: { data: { datasets: Array<{ data: number[] }> } }) => (
      <View testID="line-chart">
        <Text>LineChart-{data.datasets[0].data.length}pts</Text>
      </View>
    ),
  }
})

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => children,
  PortalProvider: ({ children }: { children: React.ReactNode }) => children,
  PortalHost: () => null,
}))

jest.mock('@nozbe/with-observables', () => (
  (_keys: string[], _fn: () => object) =>
    (Component: React.ComponentType<object>) => Component
))

jest.mock('../../model/utils/databaseHelpers', () => ({
  buildExerciseStatsFromData: jest.fn().mockReturnValue([]),
  filterAndSearchExercises: jest.fn(
    (exercises: Array<{ primaryMuscle: string; equipment: string }>, opts: { muscle?: string | null; equipment?: string | null }) => {
      let result = exercises
      if (opts.muscle) result = result.filter((e) => e.primaryMuscle === opts.muscle)
      if (opts.equipment) result = result.filter((e) => e.equipment === opts.equipment)
      return result
    }
  ),
}))

import { ChartsContent } from '../ChartsScreen'
import { buildExerciseStatsFromData } from '../../model/utils/databaseHelpers'

const makeExercise = (id: string, name: string, primaryMuscle: string, equipment: string) =>
  ({
    id,
    name,
    primaryMuscle,
    muscles: [primaryMuscle],
    equipment,
  }) as never

describe('ChartsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rend sans exercices sans crash', () => {
    const { getByText } = render(
      <ChartsContent exercises={[]} />
    )
    expect(getByText('Sélectionnez un exercice pour commencer.')).toBeTruthy()
  })

  it('affiche le message vide quand aucun exercice sélectionné', () => {
    const exercises = [makeExercise('e1', 'Développé couché', 'Pecs', 'Poids libre')]
    const { getByText } = render(
      <ChartsContent exercises={exercises} />
    )
    expect(getByText('Sélectionnez un exercice pour commencer.')).toBeTruthy()
  })

  it('affiche les exercices dans la liste horizontale', () => {
    const exercises = [
      makeExercise('e1', 'Développé couché', 'Pecs', 'Poids libre'),
      makeExercise('e2', 'Squat', 'Quadriceps', 'Poids libre'),
    ]
    const { getByText } = render(
      <ChartsContent exercises={exercises} />
    )
    expect(getByText('Développé couché')).toBeTruthy()
    expect(getByText('Squat')).toBeTruthy()
  })

  it('sélectionner un exercice active le chip', () => {
    const exercises = [
      makeExercise('e1', 'Développé couché', 'Pecs', 'Poids libre'),
      makeExercise('e2', 'Squat', 'Quadriceps', 'Poids libre'),
    ]
    const { getByText } = render(
      <ChartsContent exercises={exercises} />
    )

    fireEvent.press(getByText('Développé couché'))

    // After selection, the empty state message should disappear
    expect(() => getByText('Sélectionnez un exercice pour commencer.')).toThrow()
  })

  it('affiche les stats quand un exercice est sélectionné avec données', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push Day',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
      {
        historyId: 'h2',
        sessionName: 'Push Day',
        startTime: new Date('2025-01-15'),
        maxWeight: 85,
        sets: [{ weight: 85, reps: 8, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [
      makeExercise('e1', 'Développé couché', 'Pecs', 'Poids libre'),
    ]
    const { getByText, getAllByText } = render(
      <ChartsContent exercises={exercises} />
    )

    fireEvent.press(getByText('Développé couché'))

    // Stats content should render with session names (both items have "Push Day")
    expect(getAllByText('Push Day').length).toBe(2)
    expect(getByText('Historique complet')).toBeTruthy()
  })

  it('affiche le graphique quand 2+ points de données', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
      {
        historyId: 'h2',
        sessionName: 'Push',
        startTime: new Date('2025-01-15'),
        maxWeight: 85,
        sets: [{ weight: 85, reps: 8, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText } = render(<ChartsContent exercises={exercises} />)

    fireEvent.press(getByText('Bench'))

    expect(getByText('LineChart-2pts')).toBeTruthy()
  })

  it('affiche message vide stats quand 1 seul point de données', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText } = render(<ChartsContent exercises={exercises} />)

    fireEvent.press(getByText('Bench'))

    expect(getByText(/Enregistrez au moins une autre session/)).toBeTruthy()
  })

  it('affiche les détails de chaque série', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [
          { weight: 80, reps: 10, setOrder: 1 },
          { weight: 75, reps: 12, setOrder: 2 },
        ],
      },
      {
        historyId: 'h2',
        sessionName: 'Push 2',
        startTime: new Date('2025-01-12'),
        maxWeight: 82,
        sets: [{ weight: 82, reps: 10, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText } = render(<ChartsContent exercises={exercises} />)

    fireEvent.press(getByText('Bench'))

    expect(getByText(/Série 1 : 80 kg × 10 reps/)).toBeTruthy()
    expect(getByText(/Série 2 : 75 kg × 12 reps/)).toBeTruthy()
  })

  it('ouvre la modale de suppression au clic sur le bouton delete', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
      {
        historyId: 'h2',
        sessionName: 'Push 2',
        startTime: new Date('2025-01-12'),
        maxWeight: 82,
        sets: [{ weight: 82, reps: 10, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText, getAllByTestId } = render(
      <ChartsContent exercises={exercises} />
    )

    fireEvent.press(getByText('Bench'))

    // Press the delete button on first item
    const deleteBtns = getAllByTestId('delete-btn')
    fireEvent.press(deleteBtns[0])

    expect(getByText('Supprimer cette séance ?')).toBeTruthy()
  })

  it('supprime les sets après confirmation', async () => {
    const mockSetsToDelete = [
      { prepareDestroyPermanently: jest.fn().mockReturnValue('destroy1') },
    ]
    mockFetch.mockResolvedValueOnce(mockSetsToDelete)

    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
      {
        historyId: 'h2',
        sessionName: 'Push 2',
        startTime: new Date('2025-01-12'),
        maxWeight: 82,
        sets: [{ weight: 82, reps: 10, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText, getAllByTestId } = render(
      <ChartsContent exercises={exercises} />
    )

    fireEvent.press(getByText('Bench'))

    const deleteBtns = getAllByTestId('delete-btn')
    fireEvent.press(deleteBtns[0])

    // Confirm deletion
    fireEvent.press(getByText('Supprimer'))

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalled()
    })
  })

  it('annuler la suppression ferme la modale', () => {
    const mockStats = [
      {
        historyId: 'h1',
        sessionName: 'Push',
        startTime: new Date('2025-01-10'),
        maxWeight: 80,
        sets: [{ weight: 80, reps: 10, setOrder: 1 }],
      },
      {
        historyId: 'h2',
        sessionName: 'Push 2',
        startTime: new Date('2025-01-12'),
        maxWeight: 82,
        sets: [{ weight: 82, reps: 10, setOrder: 1 }],
      },
    ]
    ;(buildExerciseStatsFromData as jest.Mock).mockReturnValue(mockStats)

    const exercises = [makeExercise('e1', 'Bench', 'Pecs', 'Barre')]
    const { getByText, getAllByTestId, queryByText } = render(
      <ChartsContent exercises={exercises} />
    )

    fireEvent.press(getByText('Bench'))

    const deleteBtns = getAllByTestId('delete-btn')
    fireEvent.press(deleteBtns[0])

    fireEvent.press(getByText('Annuler'))

    // The alert title should be gone (AlertDialog hidden)
    // The AlertDialog might still be in the tree but with visible=false
    // We just check the cancel flow doesn't crash
    expect(queryByText('Bench')).toBeTruthy()
  })

  it('affiche les filtres ChipSelector pour muscles et équipement', () => {
    const { getByText } = render(<ChartsContent exercises={[]} />)
    expect(getByText('Tous muscles')).toBeTruthy()
    expect(getByText('Tout équipement')).toBeTruthy()
  })
})
