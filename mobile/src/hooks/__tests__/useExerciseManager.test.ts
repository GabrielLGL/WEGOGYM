// Mock the database AVANT tous les imports pour éviter SQLiteAdapter JSI
jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  validateExerciseInput: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useExerciseManager } from '../useExerciseManager'
import { database } from '../../model/index'
import { validateExerciseInput } from '../../model/utils/validationHelpers'
import Exercise from '../../model/models/Exercise'

const mockWrite = database.write as jest.Mock
const mockGet = database.get as jest.Mock
const mockValidateExerciseInput = validateExerciseInput as jest.Mock

// Fabrique d'un exercise mock
const createMockExercise = (overrides: Partial<{
  id: string
  name: string
  muscles: string[]
  equipment: string
}> = {}): Partial<Exercise> & {
  update: jest.Mock
  deleteAllAssociatedData: jest.Mock
} => ({
  id: 'exo-1',
  name: 'Développé couché',
  muscles: ['Pectoraux', 'Triceps'],
  equipment: 'Poids libre',
  update: jest.fn().mockImplementation(async (fn: (e: Record<string, unknown>) => void) => {
    fn({ name: '', muscles: [], equipment: '' })
  }),
  deleteAllAssociatedData: jest.fn().mockResolvedValue(undefined),
  ...overrides,
})

describe('useExerciseManager', () => {
  let mockCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockValidateExerciseInput.mockReturnValue({ valid: true, errors: [] })
    mockWrite.mockImplementation((fn: () => Promise<unknown>) => fn())

    mockCreate = jest.fn().mockImplementation(async (fn: (record: Record<string, unknown>) => void) => {
      const record = {
        id: 'new-exo',
        name: '',
        muscles: [],
        equipment: '',
        isCustom: false,
      }
      fn(record)
      return record
    })

    mockGet.mockReturnValue({ create: mockCreate })
  })

  describe('état initial', () => {
    it('should initialiser avec les valeurs par défaut', () => {
      const { result } = renderHook(() => useExerciseManager())

      expect(result.current.selectedExercise).toBeNull()
      expect(result.current.newExerciseData.name).toBe('')
      expect(result.current.newExerciseData.muscles).toEqual([])
      expect(result.current.newExerciseData.equipment).toBe('Poids libre')
    })

    it('should exposer toutes les propriétés attendues', () => {
      const { result } = renderHook(() => useExerciseManager())

      expect(result.current).toHaveProperty('selectedExercise')
      expect(result.current).toHaveProperty('setSelectedExercise')
      expect(result.current).toHaveProperty('newExerciseData')
      expect(result.current).toHaveProperty('editExerciseData')
      expect(result.current).toHaveProperty('updateNewExerciseName')
      expect(result.current).toHaveProperty('updateNewExerciseMuscles')
      expect(result.current).toHaveProperty('updateNewExerciseEquipment')
      expect(result.current).toHaveProperty('updateEditExerciseName')
      expect(result.current).toHaveProperty('updateEditExerciseMuscles')
      expect(result.current).toHaveProperty('updateEditExerciseEquipment')
      expect(result.current).toHaveProperty('createExercise')
      expect(result.current).toHaveProperty('updateExercise')
      expect(result.current).toHaveProperty('deleteExercise')
      expect(result.current).toHaveProperty('resetNewExercise')
      expect(result.current).toHaveProperty('loadExerciseForEdit')
    })
  })

  describe('updateNewExercise setters', () => {
    it('should mettre à jour le nom du nouvel exercice', () => {
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.updateNewExerciseName('Squat')
      })

      expect(result.current.newExerciseData.name).toBe('Squat')
    })

    it('should mettre à jour les muscles du nouvel exercice', () => {
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.updateNewExerciseMuscles(['Quadriceps', 'Fessiers'])
      })

      expect(result.current.newExerciseData.muscles).toEqual(['Quadriceps', 'Fessiers'])
    })

    it('should mettre à jour l\'équipement du nouvel exercice', () => {
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.updateNewExerciseEquipment('Machine')
      })

      expect(result.current.newExerciseData.equipment).toBe('Machine')
    })
  })

  describe('createExercise', () => {
    it('should retourner false si la validation échoue', async () => {
      mockValidateExerciseInput.mockReturnValue({
        valid: false,
        errors: ['Le nom est requis'],
      })
      const { result } = renderHook(() => useExerciseManager())

      let success: boolean
      await act(async () => {
        success = await result.current.createExercise()
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should créer un exercice quand la validation réussit', async () => {
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.updateNewExerciseName('Développé couché')
        result.current.updateNewExerciseMuscles(['Pectoraux'])
        result.current.updateNewExerciseEquipment('Poids libre')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.createExercise()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith('exercises')
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should appeler onSuccess après création réussie', async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useExerciseManager(onSuccess))

      await act(async () => {
        result.current.updateNewExerciseName('Squat')
      })

      await act(async () => {
        await result.current.createExercise()
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should réinitialiser le formulaire après création réussie', async () => {
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.updateNewExerciseName('Squat')
        result.current.updateNewExerciseMuscles(['Quadriceps'])
        result.current.updateNewExerciseEquipment('Machine')
      })

      await act(async () => {
        await result.current.createExercise()
      })

      expect(result.current.newExerciseData.name).toBe('')
      expect(result.current.newExerciseData.muscles).toEqual([])
      expect(result.current.newExerciseData.equipment).toBe('Poids libre')
    })

    it('should retourner false en cas d\'erreur base de données', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const { result } = renderHook(() => useExerciseManager())

      let success: boolean
      await act(async () => {
        success = await result.current.createExercise()
      })

      expect(success!).toBe(false)
    })

    it('should ne pas appeler onSuccess si absent', async () => {
      // Pas de callback fourni
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        await result.current.createExercise()
      })

      // Vérifier qu'aucune erreur n'est lancée
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  describe('updateExercise', () => {
    it('should retourner false si aucun exercice sélectionné', async () => {
      const { result } = renderHook(() => useExerciseManager())

      let success: boolean
      await act(async () => {
        success = await result.current.updateExercise()
      })

      expect(success!).toBe(false)
    })

    it('should retourner false si la validation échoue', async () => {
      mockValidateExerciseInput.mockReturnValue({
        valid: false,
        errors: ['Nom invalide'],
      })
      const mockExercise = createMockExercise()
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateExercise()
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should mettre à jour l\'exercice quand la validation réussit', async () => {
      const mockExercise = createMockExercise()
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
        result.current.updateEditExerciseName('Nouveau nom')
        result.current.updateEditExerciseMuscles(['Biceps'])
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateExercise()
      })

      expect(success!).toBe(true)
      expect(mockExercise.update).toHaveBeenCalled()
    })

    it('should appeler onSuccess et vider selectedExercise après mise à jour', async () => {
      const onSuccess = jest.fn()
      const mockExercise = createMockExercise()
      const { result } = renderHook(() => useExerciseManager(onSuccess))

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      await act(async () => {
        await result.current.updateExercise()
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(result.current.selectedExercise).toBeNull()
    })

    it('should retourner false en cas d\'erreur base de données', async () => {
      const mockExercise = createMockExercise({})
      mockExercise.update.mockRejectedValue(new Error('Update failed'))
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateExercise()
      })

      expect(success!).toBe(false)
    })
  })

  describe('deleteExercise', () => {
    it('should retourner false si aucun exercice sélectionné', async () => {
      const { result } = renderHook(() => useExerciseManager())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteExercise()
      })

      expect(success!).toBe(false)
    })

    it('should supprimer l\'exercice et vider selectedExercise', async () => {
      const mockExercise = createMockExercise()
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteExercise()
      })

      expect(success!).toBe(true)
      expect(mockExercise.deleteAllAssociatedData).toHaveBeenCalled()
      expect(result.current.selectedExercise).toBeNull()
    })

    it('should appeler onDelete avant suppression', async () => {
      const onDelete = jest.fn()
      const mockExercise = createMockExercise()
      const { result } = renderHook(() =>
        useExerciseManager(undefined, onDelete)
      )

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      await act(async () => {
        await result.current.deleteExercise()
      })

      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should ne pas appeler onDelete si absent', async () => {
      const mockExercise = createMockExercise()
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      // Pas d'erreur
      let success: boolean
      await act(async () => {
        success = await result.current.deleteExercise()
      })

      expect(success!).toBe(true)
    })

    it('should retourner false en cas d\'erreur', async () => {
      const mockExercise = createMockExercise()
      mockExercise.deleteAllAssociatedData.mockRejectedValue(
        new Error('Delete failed')
      )
      const { result } = renderHook(() => useExerciseManager())

      await act(async () => {
        result.current.setSelectedExercise(mockExercise as unknown as Exercise)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteExercise()
      })

      expect(success!).toBe(false)
    })
  })

  describe('resetNewExercise', () => {
    it('should réinitialiser les données du nouvel exercice', () => {
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.updateNewExerciseName('Squat')
        result.current.updateNewExerciseMuscles(['Quadriceps'])
        result.current.updateNewExerciseEquipment('Machine')
      })

      act(() => {
        result.current.resetNewExercise()
      })

      expect(result.current.newExerciseData.name).toBe('')
      expect(result.current.newExerciseData.muscles).toEqual([])
      expect(result.current.newExerciseData.equipment).toBe('Poids libre')
    })
  })

  describe('loadExerciseForEdit', () => {
    it('should charger les données de l\'exercice pour édition', () => {
      const mockExercise = createMockExercise({
        id: 'exo-2',
        name: 'Pull-up',
        muscles: ['Dorsaux', 'Biceps'],
        equipment: 'Poids du corps',
      })
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.loadExerciseForEdit(mockExercise as unknown as Exercise)
      })

      expect(result.current.selectedExercise).toBe(mockExercise)
      expect(result.current.editExerciseData.name).toBe('Pull-up')
      expect(result.current.editExerciseData.muscles).toEqual(['Dorsaux', 'Biceps'])
      expect(result.current.editExerciseData.equipment).toBe('Poids du corps')
    })

    it('should utiliser "Poids libre" par défaut si equipment est undefined', () => {
      const mockExercise = createMockExercise({ equipment: undefined })
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.loadExerciseForEdit(mockExercise as unknown as Exercise)
      })

      expect(result.current.editExerciseData.equipment).toBe('Poids libre')
    })
  })

  describe('updateEditExercise setters', () => {
    it('should mettre à jour les données d\'édition', () => {
      const { result } = renderHook(() => useExerciseManager())

      act(() => {
        result.current.updateEditExerciseName('Nouveau nom')
        result.current.updateEditExerciseMuscles(['Épaules'])
        result.current.updateEditExerciseEquipment('Barre')
      })

      expect(result.current.editExerciseData.name).toBe('Nouveau nom')
      expect(result.current.editExerciseData.muscles).toEqual(['Épaules'])
      expect(result.current.editExerciseData.equipment).toBe('Barre')
    })
  })
})
