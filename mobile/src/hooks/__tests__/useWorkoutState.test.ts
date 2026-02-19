// Mock helpers BEFORE imports to avoid SQLiteAdapter initialization
jest.mock('../../model/utils/databaseHelpers', () => ({
  saveWorkoutSet: jest.fn(),
  getMaxWeightForExercise: jest.fn(),
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  validateSetInput: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react-native'
import { useWorkoutState } from '../useWorkoutState'
import { saveWorkoutSet, getMaxWeightForExercise } from '../../model/utils/databaseHelpers'
import { validateSetInput } from '../../model/utils/validationHelpers'

const mockSaveWorkoutSet = saveWorkoutSet as jest.Mock
const mockGetMaxWeightForExercise = getMaxWeightForExercise as jest.Mock
const mockValidateSetInput = validateSetInput as jest.Mock

const createMockSessionExercise = (
  id: string,
  setsTarget = 3,
  weightTarget: number | null = 60,
  repsTarget: string | null = '10'
) => ({
  id,
  setsTarget,
  weightTarget,
  repsTarget,
  exercise: {
    fetch: jest.fn().mockResolvedValue({ id: `ex-${id}` }),
  },
})

describe('useWorkoutState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateSetInput.mockReturnValue({ valid: true })
    mockGetMaxWeightForExercise.mockResolvedValue(0)
    mockSaveWorkoutSet.mockResolvedValue(undefined)
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

    it('should build initial inputs from session exercises', () => {
      const se1 = createMockSessionExercise('se-1', 3, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '60', reps: '10' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '60', reps: '10' })
      expect(result.current.setInputs['se-1_3']).toEqual({ weight: '60', reps: '10' })
    })

    it('should handle null weightTarget and repsTarget as empty strings', () => {
      const se1 = createMockSessionExercise('se-1', 2, null, null)
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '', reps: '' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '', reps: '' })
    })

    it('should handle 0 setsTarget (no keys created)', () => {
      const se1 = createMockSessionExercise('se-1', 0, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toBeUndefined()
    })

    it('should build inputs for multiple exercises', () => {
      const se1 = createMockSessionExercise('se-1', 2, 50, '8')
      const se2 = createMockSessionExercise('se-2', 1, 100, '5')
      const { result } = renderHook(() => useWorkoutState([se1 as any, se2 as any], 'history-1'))

      expect(result.current.setInputs['se-1_1']).toEqual({ weight: '50', reps: '8' })
      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '50', reps: '8' })
      expect(result.current.setInputs['se-2_1']).toEqual({ weight: '100', reps: '5' })
    })
  })

  // --- updateSetInput ---

  describe('updateSetInput', () => {
    it('should update the weight field for a specific key', () => {
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '75')
      })

      expect(result.current.setInputs['se-1_1'].weight).toBe('75')
      expect(result.current.setInputs['se-1_1'].reps).toBe('10') // unchanged
    })

    it('should update the reps field for a specific key', () => {
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'reps', '12')
      })

      expect(result.current.setInputs['se-1_1'].reps).toBe('12')
      expect(result.current.setInputs['se-1_1'].weight).toBe('60') // unchanged
    })

    it('should preserve other set inputs when updating one', () => {
      const se1 = createMockSessionExercise('se-1', 2, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '80')
      })

      expect(result.current.setInputs['se-1_2']).toEqual({ weight: '60', reps: '10' })
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
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.validateSet(se1 as any, 1)
      })

      expect(success!).toBe(false)
      expect(mockSaveWorkoutSet).not.toHaveBeenCalled()
    })

    it('should return false when exercise fetch returns null', async () => {
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
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
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

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
      const se1 = createMockSessionExercise('se-1', 1, 60, '10') // new weight is 60
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

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
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(result.current.validatedSets['se-1_1'].isPr).toBe(false)
    })

    it('should not mark as PR when maxWeight is 0 (no history)', async () => {
      mockGetMaxWeightForExercise.mockResolvedValue(0)
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      expect(result.current.validatedSets['se-1_1'].isPr).toBe(false)
    })

    it('should accumulate totalVolume across multiple validated sets', async () => {
      const se1 = createMockSessionExercise('se-1', 2, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      await act(async () => {
        await result.current.validateSet(se1 as any, 1)
      })

      await act(async () => {
        await result.current.validateSet(se1 as any, 2)
      })

      expect(result.current.totalVolume).toBe(1200) // 60*10 + 60*10
    })

    it('should validate sets for different exercises independently', async () => {
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const se2 = createMockSessionExercise('se-2', 1, 100, '5')
      const { result } = renderHook(() => useWorkoutState([se1 as any, se2 as any], 'history-1'))

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
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
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

    it('should validate set using updated weight from updateSetInput', async () => {
      const se1 = createMockSessionExercise('se-1', 1, 60, '10')
      const { result } = renderHook(() => useWorkoutState([se1 as any], 'history-1'))

      // User changes weight to 80
      act(() => {
        result.current.updateSetInput('se-1_1', 'weight', '80')
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
})
