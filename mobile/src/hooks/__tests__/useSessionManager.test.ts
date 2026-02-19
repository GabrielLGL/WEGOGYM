// Mock the database BEFORE imports to avoid SQLiteAdapter JSI initialization
jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}))
jest.mock('../../model/utils/databaseHelpers', () => ({
  getNextPosition: jest.fn(),
  parseNumericInput: jest.fn(),
  parseIntegerInput: jest.fn(),
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  validateWorkoutInput: jest.fn(),
}))
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  ToastAndroid: { show: jest.fn(), SHORT: 1 },
}))
jest.mock('@nozbe/watermelondb', () => ({
  Q: { where: jest.fn().mockReturnValue({}) },
}))

import { renderHook, act } from '@testing-library/react-native'
import { useSessionManager } from '../useSessionManager'
import { database } from '../../model/index'
import { getNextPosition, parseNumericInput, parseIntegerInput } from '../../model/utils/databaseHelpers'
import { validateWorkoutInput } from '../../model/utils/validationHelpers'
import { Platform, ToastAndroid } from 'react-native'

const mockWrite = database.write as jest.Mock
const mockGet = database.get as jest.Mock
const mockGetNextPosition = getNextPosition as jest.Mock
const mockParseNumericInput = parseNumericInput as jest.Mock
const mockParseIntegerInput = parseIntegerInput as jest.Mock
const mockValidateWorkoutInput = validateWorkoutInput as jest.Mock
const mockToastShow = ToastAndroid.show as jest.Mock

const mockSession = { id: 'sess-1' }

const createMockSessionExercise = (overrides: {
  id?: string
  setsTarget?: number
  repsTarget?: string
  weightTarget?: number
} = {}) => ({
  id: overrides.id ?? 'se-1',
  setsTarget: overrides.setsTarget ?? 3,
  repsTarget: overrides.repsTarget ?? '10',
  weightTarget: overrides.weightTarget ?? 60,
  exercise: { fetch: jest.fn().mockResolvedValue({ id: 'exo-1' }) },
  update: jest.fn().mockImplementation(async (fn: (se: Record<string, unknown>) => void) => {
    fn({ setsTarget: 0, repsTarget: '', weightTarget: 0 })
  }),
  destroyPermanently: jest.fn().mockResolvedValue(undefined),
})

describe('useSessionManager', () => {
  let mockCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockWrite.mockImplementation((fn: () => Promise<unknown>) => fn())
    mockGetNextPosition.mockResolvedValue(1)
    mockParseNumericInput.mockImplementation((v: string) => parseFloat(v) || 0)
    mockParseIntegerInput.mockImplementation((v: string) => parseInt(v, 10) || 0)
    mockValidateWorkoutInput.mockReturnValue({ valid: true })

    mockCreate = jest.fn().mockImplementation((fn: (record: Record<string, unknown>) => void) => {
      const record = {
        session: { set: jest.fn() },
        exercise: { set: jest.fn() },
        position: 0,
        setsTarget: 0,
        repsTarget: '',
        weightTarget: 0,
        sets: 0,
        weight: 0,
        reps: 0,
      }
      fn(record)
      return Promise.resolve(record)
    })

    mockGet.mockReturnValue({ create: mockCreate })
  })

  // --- Initial state ---

  describe('initial state', () => {
    it('should initialize with empty inputs', () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
      expect(result.current.selectedSessionExercise).toBeNull()
    })

    it('should expose all required functions', () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      expect(result.current).toHaveProperty('addExercise')
      expect(result.current).toHaveProperty('updateTargets')
      expect(result.current).toHaveProperty('removeExercise')
      expect(result.current).toHaveProperty('prepareEditTargets')
      expect(result.current).toHaveProperty('resetTargets')
    })

    it('should reflect isFormValid = true when inputs are valid', () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: true })
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      expect(result.current.isFormValid).toBe(true)
    })

    it('should reflect isFormValid = false when inputs are invalid', () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      expect(result.current.isFormValid).toBe(false)
    })
  })

  // --- addExercise ---

  describe('addExercise', () => {
    it('should return false when validation fails', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const { result } = renderHook(() => useSessionManager(mockSession as any))
      const mockExercise = { id: 'exo-1' }

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', mockExercise as any)
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should create session_exercise and performance_log on success', async () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))
      const mockExercise = { id: 'exo-1' }

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', mockExercise as any)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith('session_exercises')
      expect(mockGet).toHaveBeenCalledWith('performance_logs')
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('should call getNextPosition for the session', async () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))
      const mockExercise = { id: 'exo-1' }

      await act(async () => {
        await result.current.addExercise('exo-1', '3', '10', '60', mockExercise as any)
      })

      expect(mockGetNextPosition).toHaveBeenCalledWith('session_exercises', expect.anything())
    })

    it('should call onSuccess callback', async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useSessionManager(mockSession as any, onSuccess))
      const mockExercise = { id: 'exo-1' }

      await act(async () => {
        await result.current.addExercise('exo-1', '3', '10', '60', mockExercise as any)
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should return false on database error', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const { result } = renderHook(() => useSessionManager(mockSession as any))
      const mockExercise = { id: 'exo-1' }

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', mockExercise as any)
      })

      expect(success!).toBe(false)
    })
  })

  // --- updateTargets ---

  describe('updateTargets', () => {
    it('should return false when selectedSessionExercise is null', async () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
    })

    it('should return false when form is not valid', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should return false when exercise fetch returns null', async () => {
      const mockSE = createMockSessionExercise()
      mockSE.exercise.fetch.mockResolvedValue(null)
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE as any)
        result.current.setTargetSets('3')
        result.current.setTargetReps('10')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
    })

    it('should update targets and create performance_log', async () => {
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE as any)
        result.current.setTargetSets('4')
        result.current.setTargetReps('8')
        result.current.setTargetWeight('80')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockSE.update).toHaveBeenCalled()
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should call onSuccess and reset form after update', async () => {
      const onSuccess = jest.fn()
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any, onSuccess))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE as any)
        result.current.setTargetSets('4')
        result.current.setTargetReps('8')
        result.current.setTargetWeight('80')
      })

      await act(async () => {
        await result.current.updateTargets()
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
      expect(result.current.selectedSessionExercise).toBeNull()
    })

    it('should return false on database error', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE as any)
        result.current.setTargetSets('3')
        result.current.setTargetReps('10')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
    })
  })

  // --- removeExercise ---

  describe('removeExercise', () => {
    it('should destroy the session exercise inside database.write', async () => {
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      let success: boolean
      await act(async () => {
        success = await result.current.removeExercise(mockSE as any)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockSE.destroyPermanently).toHaveBeenCalled()
    })

    it('should show Android toast when Platform is android', async () => {
      ;(Platform as { OS: string }).OS = 'android'

      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        await result.current.removeExercise(mockSE as any)
      })

      expect(mockToastShow).toHaveBeenCalledWith('Retiré', ToastAndroid.SHORT)

      ;(Platform as { OS: string }).OS = 'ios'
    })

    it('should not show toast on non-android platforms', async () => {
      ;(Platform as { OS: string }).OS = 'ios'

      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      await act(async () => {
        await result.current.removeExercise(mockSE as any)
      })

      expect(mockToastShow).not.toHaveBeenCalled()
    })

    it('should return false on error', async () => {
      const mockSE = createMockSessionExercise()
      mockSE.destroyPermanently.mockRejectedValue(new Error('Delete failed'))
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      let success: boolean
      await act(async () => {
        success = await result.current.removeExercise(mockSE as any)
      })

      expect(success!).toBe(false)
    })
  })

  // --- prepareEditTargets ---

  describe('prepareEditTargets', () => {
    it('should populate state from session exercise', () => {
      const mockSE = createMockSessionExercise({ id: 'se-2', setsTarget: 4, repsTarget: '12', weightTarget: 75 })
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      act(() => {
        result.current.prepareEditTargets(mockSE as any)
      })

      expect(result.current.selectedSessionExercise).toBe(mockSE)
      expect(result.current.targetSets).toBe('4')
      expect(result.current.targetReps).toBe('12')
      expect(result.current.targetWeight).toBe('75')
    })

    it('should handle null/undefined optional fields gracefully', () => {
      const mockSE = {
        id: 'se-3',
        setsTarget: undefined,
        repsTarget: undefined,
        weightTarget: undefined,
        exercise: { fetch: jest.fn() },
        update: jest.fn(),
        destroyPermanently: jest.fn(),
      }
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      act(() => {
        result.current.prepareEditTargets(mockSE as any)
      })

      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
    })
  })

  // --- resetTargets ---

  describe('resetTargets', () => {
    it('should clear all target inputs', () => {
      const { result } = renderHook(() => useSessionManager(mockSession as any))

      act(() => {
        result.current.setTargetSets('3')
        result.current.setTargetReps('10')
        result.current.setTargetWeight('60')
      })

      act(() => {
        result.current.resetTargets()
      })

      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
    })
  })
})
