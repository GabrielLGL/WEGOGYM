// Mock the database AVANT tous les imports pour éviter SQLiteAdapter JSI
jest.mock('../../model/index', () => ({ database: { get: jest.fn() } }))
jest.mock('../../model/utils/databaseHelpers', () => ({
  filterAndSearchExercises: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useExerciseFilters } from '../useExerciseFilters'
import { filterAndSearchExercises } from '../../model/utils/databaseHelpers'
import Exercise from '../../model/models/Exercise'

const mockFilterAndSearch = filterAndSearchExercises as jest.Mock

// Fabrique d'exercices mock
const createMockExercise = (
  id: string,
  name: string,
  muscles: string[],
  equipment: string
): Partial<Exercise> => ({ id, name, muscles, equipment })

const exercisesFixture = [
  createMockExercise('1', 'Développé couché', ['Pectoraux'], 'Poids libre'),
  createMockExercise('2', 'Curl biceps', ['Biceps'], 'Poids libre'),
  createMockExercise('3', 'Leg press', ['Quadriceps'], 'Machine'),
] as Exercise[]

describe('useExerciseFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Par défaut, retourne tous les exercices passés
    mockFilterAndSearch.mockImplementation(
      (exercises: Exercise[]) => exercises
    )
  })

  describe('état initial', () => {
    it('should initialiser avec des filtres vides', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      expect(result.current.searchQuery).toBe('')
      expect(result.current.filterMuscle).toBeNull()
      expect(result.current.filterEquipment).toBeNull()
    })

    it('should exposer toutes les propriétés attendues', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      expect(result.current).toHaveProperty('searchQuery')
      expect(result.current).toHaveProperty('setSearchQuery')
      expect(result.current).toHaveProperty('filterMuscle')
      expect(result.current).toHaveProperty('setFilterMuscle')
      expect(result.current).toHaveProperty('filterEquipment')
      expect(result.current).toHaveProperty('setFilterEquipment')
      expect(result.current).toHaveProperty('filteredExercises')
      expect(result.current).toHaveProperty('resetFilters')
    })

    it('should retourner filteredExercises via filterAndSearchExercises', () => {
      mockFilterAndSearch.mockReturnValue([exercisesFixture[0]])

      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      expect(mockFilterAndSearch).toHaveBeenCalledWith(exercisesFixture, {
        muscle: null,
        equipment: null,
        searchQuery: '',
      })
      expect(result.current.filteredExercises).toHaveLength(1)
    })
  })

  describe('setSearchQuery', () => {
    it('should mettre à jour searchQuery et rappeler filterAndSearchExercises', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setSearchQuery('curl')
      })

      expect(result.current.searchQuery).toBe('curl')
      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(exercisesFixture, {
        muscle: null,
        equipment: null,
        searchQuery: 'curl',
      })
    })

    it('should accepter une chaîne vide', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setSearchQuery('développé')
      })
      act(() => {
        result.current.setSearchQuery('')
      })

      expect(result.current.searchQuery).toBe('')
    })
  })

  describe('setFilterMuscle', () => {
    it('should mettre à jour filterMuscle', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterMuscle('Pectoraux')
      })

      expect(result.current.filterMuscle).toBe('Pectoraux')
      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(exercisesFixture, {
        muscle: 'Pectoraux',
        equipment: null,
        searchQuery: '',
      })
    })

    it('should accepter null pour supprimer le filtre muscle', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterMuscle('Pectoraux')
      })
      act(() => {
        result.current.setFilterMuscle(null)
      })

      expect(result.current.filterMuscle).toBeNull()
    })
  })

  describe('setFilterEquipment', () => {
    it('should mettre à jour filterEquipment', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterEquipment('Machine')
      })

      expect(result.current.filterEquipment).toBe('Machine')
      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(exercisesFixture, {
        muscle: null,
        equipment: 'Machine',
        searchQuery: '',
      })
    })

    it('should accepter null pour supprimer le filtre équipement', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterEquipment('Poids libre')
      })
      act(() => {
        result.current.setFilterEquipment(null)
      })

      expect(result.current.filterEquipment).toBeNull()
    })
  })

  describe('filtres combinés', () => {
    it('should passer muscle + equipment + searchQuery ensemble', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterMuscle('Pectoraux')
        result.current.setFilterEquipment('Poids libre')
        result.current.setSearchQuery('développé')
      })

      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(
        exercisesFixture,
        expect.objectContaining({
          muscle: 'Pectoraux',
          equipment: 'Poids libre',
          searchQuery: 'développé',
        })
      )
    })
  })

  describe('resetFilters', () => {
    it('should remettre tous les filtres à zéro', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setSearchQuery('curl')
        result.current.setFilterMuscle('Biceps')
        result.current.setFilterEquipment('Poids libre')
      })

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.searchQuery).toBe('')
      expect(result.current.filterMuscle).toBeNull()
      expect(result.current.filterEquipment).toBeNull()
    })

    it('should appeler filterAndSearchExercises avec les paramètres vides après reset', () => {
      const { result } = renderHook(() =>
        useExerciseFilters(exercisesFixture)
      )

      act(() => {
        result.current.setFilterMuscle('Pectoraux')
      })

      act(() => {
        result.current.resetFilters()
      })

      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(exercisesFixture, {
        muscle: null,
        equipment: null,
        searchQuery: '',
      })
    })
  })

  describe('liste vide', () => {
    it('should gérer une liste d\'exercices vide', () => {
      mockFilterAndSearch.mockReturnValue([])

      const { result } = renderHook(() => useExerciseFilters([]))

      expect(result.current.filteredExercises).toEqual([])
    })
  })

  describe('mise à jour de la liste d\'entrée', () => {
    it('should recalculer filteredExercises quand exercises change', () => {
      const { result, rerender } = renderHook(
        ({ exercises }) => useExerciseFilters(exercises),
        { initialProps: { exercises: exercisesFixture } }
      )

      const newExercises = [
        createMockExercise('4', 'Pompes', ['Pectoraux'], 'Poids du corps'),
      ] as Exercise[]

      mockFilterAndSearch.mockReturnValue(newExercises)

      rerender({ exercises: newExercises })

      expect(mockFilterAndSearch).toHaveBeenLastCalledWith(
        newExercises,
        expect.anything()
      )
    })
  })
})
