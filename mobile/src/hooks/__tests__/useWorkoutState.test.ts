// Mock helpers BEFORE imports to avoid SQLiteAdapter initialization
jest.mock('../../model/utils/databaseHelpers', () => ({
  saveWorkoutSet: jest.fn(),
  getMaxWeightForExercise: jest.fn(),
  deleteWorkoutSet: jest.fn(),
  getLastSetsForExercises: jest.fn(),
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  validateSetInput: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useWorkoutState } from '../useWorkoutState'
import {
  saveWorkoutSet,
  getMaxWeightForExercise,
  deleteWorkoutSet,
  getLastSetsForExercises,
} from '../../model/utils/databaseHelpers'
import { validateSetInput } from '../../model/utils/validationHelpers'

const mockSaveWorkoutSet = saveWorkoutSet as jest.Mock
const mockGetMaxWeightForExercise = getMaxWeightForExercise as jest.Mock
const mockDeleteWorkoutSet = deleteWorkoutSet as jest.Mock
const mockGetLastSetsForExercises = getLastSetsForExercises as jest.Mock
const mockValidateSetInput = validateSetInput as jest.Mock

// exercise.id doit être accessible directement (buildInitialInputs) ET via fetch (validateSet)
const createMockSessionExercise = (id: string, setsTarget = 3) => ({
  id,
  setsTarget,
  exercise: {
    id: `ex-${id}`,
    fetch: jest.fn().mockResolvedValue({ id: `ex-${id}` }),
  },
})

describe('useWorkoutState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateSetInput.mockReturnValue({ valid: true })
    mockGetMaxWeightForExercise.mockResolvedValue(0)
    mockSaveWorkoutSet.mockResolvedValue(undefined)
    mockDeleteWorkoutSet.mockResolvedValue(undefined)
    mockGetLastSetsForExercises.mockResolvedValue({})
  })

  // --- Initial state / buildInitialInputs ---

  describe('initial state', () => {
    it('should initialize with empty state when no exercises', () => {
      const { result } = renderHook(() => useWorkoutState([], 'history-1'))

      expect(result.current.setInputs).toEqual({})
      expect(result.current.validatedSets).toEqual({})
      expect(result.current.totalVolume).toBe(0)
    })

    it('should expose all required functions', () => {
      const { result } = renderHook(() => useWorkoutState([], 'history-1'))

      expect(result.current).toHaveProperty('updateSetInput')
      expect(result.current).toHaveProperty('validateSet')
    })

    it('should build initial inputs with empty weight and reps synchronously', () => {
      const se1 = createMockSessionExercise('se-1', 3)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '', reps: '' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '', reps: '' })
      expect(result.current.setInputs['se-1_3']).toEqual({ weight: '', reps: '' })
    })

    it('should prefill weights and reps from getLastSetsForExercises after mount', async () => {
      mockGetLastSetsForExercises.mockResolvedValue({
        'ex-se-1': {
          1: { weight: 80, reps: 10 },
          2: { weight: 80, reps: 10 },
          3: { weight: 80, reps: 10 },
        },
      })
      const se1 = createMockSessionExercise('se-1', 3)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {})

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '80', reps: '10' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '80', reps: '10' })
      expect(result.current.setInputs['se-1_3']).toEqual({ weight: '80', reps: '10' })
    })

    it('should prefill reps from history', async () => {
      mockGetLastSetsForExercises.mockResolvedValue({
        'ex-se-1': { 1: { weight: 60, reps: 8 } },
      })
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {})

      expect(result.current.setInputs['se-1_1'].reps).toBe('8')
    })

    it('should leave weight empty when no history data available', async () => {
      // mockGetLastSetsForExercises returns {} by default
      const se1 = createMockSessionExercise('se-1', 2)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {})

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '', reps: '' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '', reps: '' })
    })

    it('should handle 0 setsTarget (no keys created)', () => {
      const se1 = createMockSessionExercise('se-1', 0)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toBeUndefined()
    })

    it('should prefill weights and reps for multiple exercises from history', async () => {
      mockGetLastSetsForExercises.mockResolvedValue({
        'ex-se-1': { 1: { weight: 50, reps: 10 }, 2: { weight: 50, reps: 10 } },
        'ex-se-2': { 1: { weight: 100, reps: 5 } },
      })
      const se1 = createMockSessionExercise('se-1', 2)
      const se2 = createMockSessionExercise('se-2', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any, se2 as any], 'history-1'))

      await act(async () => {})

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '50', reps: '10' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '50', reps: '10' })
      expect(result.current.setInputs['se-2_1']).toEqual({ weight: '100', reps: '5' })
    })
  })

  // --- updateSetInput ---

  describe('updateSetInput', () => {
    it('should update the weight field for a specific key', () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '75')
      })

      expect(result.current.setInputs['se-1_1'].weight).toBe('75')
      expect(result.current.setInputs['se-1_1'].reps).toBe('') // unchanged
    })

    it('should update the reps field for a specific key', () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'reps', '12')
      })

      expect(result.current.setInputs['se-1_1'].reps).toBe('12')
      expect(result.current.setInputs['se-1_1'].weight).toBe('') // unchanged
    })

    it('should preserve other set inputs when updating one', () => {
      const se1 = createMockSessionExercise('se-1', 2)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '80')
      })

      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '', reps: '' })
    })

    it('should create a new key entry when key does not exist', () => {
      const { result } = renderHook(() => useWorkoutState([], 'history-1'))

      act(() => {
        result.current.updateSetInput('new-key', 'weight', '50')
      })

      expect(result.current.setInputs['new-key']).toMatchObject({ weight: '50' })
    })
  })

  // --- validateSet ---

  describe('validateSet', () => {
    it('should return false when historyId is empty', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], ''))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockSaveWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when input key does not exist', async () => {
      const se1 = createMockSessionExercise('se-1', 0) // setsTarget=0: no initial inputs
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockSaveWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when input validation fails', async () => {
      mockValidateSetInput.mockReturnValue({ valid: false })
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockSaveWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when exercise fetch returns null', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      ;(se1 as any).exercise.fetch.mockResolvedValue(null)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockSaveWorkoutSet).not.toHaveBeenCalled()
    })

    it('should save workout set and update validatedSets + totalVolume', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(true)
      expect(mockSaveWorkoutSet).toHaveBeenCalledWith({
        historyId: 'history-1',
        exerciseId: 'ex-se-1',
        weight: 60,
        reps: 10,
        setOrder: 1,
        isPr: false,
      })
      expect(result.current.validatedSets['se-1_1']).toEqual({ weight: 60, reps: 10, isPr: false })
      expect(result.current.totalVolume).toBe(600) // 60 * 10
    })

    it('should mark set as PR when weight exceeds previous max', async () => {
      mockGetMaxWeightForExercise.mockResolvedValue(50) // previous max is 50
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(mockSaveWorkoutSet).toHaveBeenCalledWith(
        expect.objectContaining({ isPr: true })
      )
      expect(result.current.validatedSets['se-1_1'].isPr).toBe(true)
    })

    it('should not mark as PR when weight equals previous max', async () => {
      mockGetMaxWeightForExercise.mockResolvedValue(60) // same as current weight
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(result.current.validatedSets['se-1_1'].isPr).toBe(false)
    })

    it('should not mark as PR when maxWeight is 0 (no history)', async () => {
      mockGetMaxWeightForExercise.mockResolvedValue(0)
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(result.current.validatedSets['se-1_1'].isPr).toBe(false)
    })

    it('should accumulate totalVolume across multiple validated sets', async () => {
      const se1 = createMockSessionExercise('se-1', 2)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      // Flush the initial async effect before setting inputs (effect resets setInputs via getLastSetsForExercises)
      await act(async () => {})

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
        result.current.updateSetInput('se-1_2', 'weight', '60')
        result.current.updateSetInput('se-1_2', 'reps', '10')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 2)
      })

      expect(result.current.totalVolume).toBe(1200) // 60*10 + 60*10
    })

    it('should validate sets for different exercises independently', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const se2 = createMockSessionExercise('se-2', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any, se2 as any], 'history-1'))

      // Flush the initial async effect before setting inputs
      await act(async () => {})

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
        result.current.updateSetInput('se-2_1', 'weight', '100')
        result.current.updateSetInput('se-2_1', 'reps', '5')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
        await result.current.validateSet(se2 as any, 1)
      })

      expect(result.current.validatedSets['se-1_1']).toEqual({ weight: 60, reps: 10, isPr: false })
      expect(result.current.validatedSets['se-2_1']).toEqual({ weight: 100, reps: 5, isPr: false })
      expect(result.current.totalVolume).toBe(1100) // 60*10 + 100*5
    })

    it('should return false on saveWorkoutSet error', async () => {
      mockSaveWorkoutSet.mockRejectedValue(new Error('Save failed'))
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      // State should not have been updated
      expect(result.current.validatedSets['se-1_1']).toBeUndefined()
      expect(result.current.totalVolume).toBe(0)
    })

    it('should validate set using updated weight and reps from updateSetInput', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      // User sets weight to 80 and reps to 10
      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '80')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(mockSaveWorkoutSet).toHaveBeenCalledWith(
        expect.objectContaining({ weight: 80 })
      )
      expect(result.current.totalVolume).toBe(800) // 80 * 10
    })
  })

  // --- unvalidateSet ---

  describe('unvalidateSet', () => {
    it('should return false when historyId is empty', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], ''))

      let success: boolean
      await act(async () => {
        success = await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockDeleteWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when set is not validated', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockDeleteWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when exercise fetch returns null on unvalidate', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      // Set inputs and validate first
      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })
      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      // Make exercise fetch return null for the unvalidate call
      ;(se1 as any).exercise.fetch.mockResolvedValue(null)

      let success: boolean
      await act(async () => {
        success = await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockDeleteWorkoutSet).not.toHaveBeenCalled()
    })

    it('should delete set from DB and remove from validatedSets', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })
      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })
      expect(result.current.validatedSets['se-1_1']).toBeDefined()

      let success: boolean
      await act(async () => {
        success = await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(success!).toBe(true)
      expect(mockDeleteWorkoutSet).toHaveBeenCalledWith('history-1', 'ex-se-1', 1)
      expect(result.current.validatedSets['se-1_1']).toBeUndefined()
    })

    it('should subtract volume when unvalidating', async () => {
      const se1 = createMockSessionExercise('se-1', 2)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      // Flush the initial async effect before setting inputs
      await act(async () => {})

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
        result.current.updateSetInput('se-1_2', 'weight', '60')
        result.current.updateSetInput('se-1_2', 'reps', '10')
      })
      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
        await result.current.validateSet(se1 as any, 2)
      })
      expect(result.current.totalVolume).toBe(1200) // 2 × 60×10

      await act(async () => {
        await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(result.current.totalVolume).toBe(600) // 1 × 60×10
    })

    it('should return false on deleteWorkoutSet error', async () => {
      const se1 = createMockSessionExercise('se-1', 1)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '60')
        result.current.updateSetInput('se-1_1', 'reps', '10')
      })
      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      mockDeleteWorkoutSet.mockRejectedValue(new Error('Delete failed'))

      let success: boolean
      await act(async () => {
        success = await result.current.unvalidateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      // State should remain unchanged
      expect(result.current.validatedSets['se-1_1']).toBeDefined()
      expect(result.current.totalVolume).toBe(600)
    })
  })
})
