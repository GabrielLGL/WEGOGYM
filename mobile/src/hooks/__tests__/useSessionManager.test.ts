// Mock the database BEFORE imports to avoid SQLiteAdapter JSI initialization
import { renderHook, act } from '@testing-library/react-native'
import { useSessionManager } from '../useSessionManager'
import { database } from '../../model/index'
import { getNextPosition, parseNumericInput, parseIntegerInput } from '../../model/utils/databaseHelpers'
import { validateWorkoutInput } from '../../model/utils/validationHelpers'
import { Platform, ToastAndroid } from 'react-native'
import { mockSessionExercise, mockSession as mockSessionFactory, mockExercise } from '../../model/utils/__tests__/testFactories'

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

const mockWrite = database.write as jest.Mock
const mockGet = database.get as jest.Mock
const mockGetNextPosition = getNextPosition as jest.Mock
const mockParseNumericInput = parseNumericInput as jest.Mock
const mockParseIntegerInput = parseIntegerInput as jest.Mock
const mockValidateWorkoutInput = validateWorkoutInput as jest.Mock
const mockToastShow = ToastAndroid.show as jest.Mock

const testSession = mockSessionFactory({ id: 'sess-1' })

const createMockSessionExercise = (overrides: {
  id?: string
  setsTarget?: number
  setsTargetMax?: number
  repsTarget?: string
  weightTarget?: number
} = {}) =>
  mockSessionExercise({
    id: overrides.id ?? 'se-1',
    setsTarget: overrides.setsTarget ?? 3,
    setsTargetMax: overrides.setsTargetMax ?? 0,
    repsTarget: overrides.repsTarget ?? '10',
    weightTarget: overrides.weightTarget ?? 60,
    exercise: { id: 'exo-1', fetch: jest.fn().mockResolvedValue({ id: 'exo-1' }) },
    update: jest.fn().mockImplementation(async (fn: (se: Record<string, unknown>) => void) => {
      fn({ setsTarget: 0, setsTargetMax: 0, repsTarget: '', weightTarget: 0 })
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
        setsTargetMax: 0,
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
      const { result } = renderHook(() => useSessionManager(testSession))

      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
      expect(result.current.selectedSessionExercise).toBeNull()
    })

    it('should expose all required functions', () => {
      const { result } = renderHook(() => useSessionManager(testSession))

      expect(result.current).toHaveProperty('addExercise')
      expect(result.current).toHaveProperty('updateTargets')
      expect(result.current).toHaveProperty('removeExercise')
      expect(result.current).toHaveProperty('prepareEditTargets')
      expect(result.current).toHaveProperty('resetTargets')
    })

    it('should reflect isFormValid = true when inputs are valid', () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: true })
      const { result } = renderHook(() => useSessionManager(testSession))

      expect(result.current.isFormValid).toBe(true)
    })

    it('should reflect isFormValid = false when inputs are invalid', () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const { result } = renderHook(() => useSessionManager(testSession))

      expect(result.current.isFormValid).toBe(false)
    })
  })

  // --- addExercise ---

  describe('addExercise', () => {
    it('should return false when validation fails', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const { result } = renderHook(() => useSessionManager(testSession))
      const testExercise = mockExercise({ id: 'exo-1' })

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', testExercise)
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should return false when exercise is null or undefined', async () => {
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', null!)
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should create session_exercise and performance_log on success', async () => {
      const { result } = renderHook(() => useSessionManager(testSession))
      const testExercise = mockExercise({ id: 'exo-1' })

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', testExercise)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith('session_exercises')
      expect(mockGet).toHaveBeenCalledWith('performance_logs')
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('should call getNextPosition for the session', async () => {
      const { result } = renderHook(() => useSessionManager(testSession))
      const testExercise = mockExercise({ id: 'exo-1' })

      await act(async () => {
        await result.current.addExercise('exo-1', '3', '10', '60', testExercise)
      })

      expect(mockGetNextPosition).toHaveBeenCalledWith('session_exercises', expect.anything())
    })

    it('should call onSuccess callback', async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useSessionManager(testSession, onSuccess))
      const testExercise = mockExercise({ id: 'exo-1' })

      await act(async () => {
        await result.current.addExercise('exo-1', '3', '10', '60', testExercise)
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should return false on database error', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const { result } = renderHook(() => useSessionManager(testSession))
      const testExercise = mockExercise({ id: 'exo-1' })

      let success: boolean
      await act(async () => {
        success = await result.current.addExercise('exo-1', '3', '10', '60', testExercise)
      })

      expect(success!).toBe(false)
    })

  })

  // --- updateTargets ---

  describe('updateTargets', () => {
    it('should return false when selectedSessionExercise is null', async () => {
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
    })

    it('should return false when form is not valid', async () => {
      mockValidateWorkoutInput.mockReturnValue({ valid: false })
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
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
      ;(mockSE.exercise.fetch as jest.Mock).mockResolvedValue(null)
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
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
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
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
      const { result } = renderHook(() => useSessionManager(testSession, onSuccess))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
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
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
        result.current.setTargetSets('3')
        result.current.setTargetReps('10')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTargets()
      })

      expect(success!).toBe(false)
    })

    it('clamp les séries à 10 si la valeur dépasse le max', async () => {
      mockParseIntegerInput.mockReturnValue(99)
      const captured: Record<string, unknown> = { setsTarget: 0, setsTargetMax: 0, repsTarget: '', weightTarget: 0 }
      const mockSE = createMockSessionExercise()
      ;(mockSE.update as jest.Mock).mockImplementationOnce(
        async (fn: (se: Record<string, unknown>) => void) => { fn(captured) }
      )
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
        result.current.setTargetSets('99')
        result.current.setTargetReps('10')
      })

      await act(async () => {
        await result.current.updateTargets()
      })

      expect(captured.setsTarget).toBe(10)
    })

    it('clamp le poids à 999 si la valeur dépasse le max', async () => {
      mockParseNumericInput.mockReturnValue(1500)
      const captured: Record<string, unknown> = { setsTarget: 0, setsTargetMax: 0, repsTarget: '', weightTarget: 0 }
      const mockSE = createMockSessionExercise()
      ;(mockSE.update as jest.Mock).mockImplementationOnce(
        async (fn: (se: Record<string, unknown>) => void) => { fn(captured) }
      )
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        result.current.setSelectedSessionExercise(mockSE)
        result.current.setTargetSets('3')
        result.current.setTargetReps('10')
        result.current.setTargetWeight('1500')
      })

      await act(async () => {
        await result.current.updateTargets()
      })

      expect(captured.weightTarget).toBe(999)
    })
  })

  // --- removeExercise ---

  describe('removeExercise', () => {
    it('should destroy the session exercise inside database.write', async () => {
      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.removeExercise(mockSE)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockSE.destroyPermanently).toHaveBeenCalled()
    })

    it('should show Android toast when Platform is android', async () => {
      ;(Platform as { OS: string }).OS = 'android'

      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        await result.current.removeExercise(mockSE)
      })

      expect(mockToastShow).toHaveBeenCalledWith('Retiré', ToastAndroid.SHORT)

      ;(Platform as { OS: string }).OS = 'ios'
    })

    it('should not show toast on non-android platforms', async () => {
      ;(Platform as { OS: string }).OS = 'ios'

      const mockSE = createMockSessionExercise()
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        await result.current.removeExercise(mockSE)
      })

      expect(mockToastShow).not.toHaveBeenCalled()
    })

    it('should return false on error', async () => {
      const mockSE = createMockSessionExercise()
      ;(mockSE.destroyPermanently as jest.Mock).mockRejectedValue(new Error('Delete failed'))
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.removeExercise(mockSE)
      })

      expect(success!).toBe(false)
    })
  })

  // --- prepareEditTargets ---

  describe('prepareEditTargets', () => {
    it('should populate state from session exercise', () => {
      const mockSE = createMockSessionExercise({ id: 'se-2', setsTarget: 4, repsTarget: '12', weightTarget: 75 })
      const { result } = renderHook(() => useSessionManager(testSession))

      act(() => {
        result.current.prepareEditTargets(mockSE)
      })

      expect(result.current.selectedSessionExercise).toBe(mockSE)
      expect(result.current.targetSets).toBe('4')
      expect(result.current.targetReps).toBe('12')
      expect(result.current.targetWeight).toBe('75')
    })

    it('should handle null/undefined optional fields gracefully', () => {
      const mockSE = mockSessionExercise({
        id: 'se-3',
        setsTarget: null,
        repsTarget: null,
        weightTarget: null,
      })
      const { result } = renderHook(() => useSessionManager(testSession))

      act(() => {
        result.current.prepareEditTargets(mockSE)
      })

      expect(result.current.targetSets).toBe('')
      expect(result.current.targetReps).toBe('')
      expect(result.current.targetWeight).toBe('')
    })
  })

  // --- resetTargets ---

  describe('resetTargets', () => {
    it('should clear all target inputs', () => {
      const { result } = renderHook(() => useSessionManager(testSession))

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

  // --- reorderExercises ---

  describe('reorderExercises', () => {
    let mockBatch: jest.Mock

    beforeEach(() => {
      mockBatch = jest.fn().mockResolvedValue(undefined)
      ;(database as unknown as { batch: jest.Mock }).batch = mockBatch
    })

    it('should call database.write and database.batch with prepared updates', async () => {
      const mockPrepareUpdate = jest.fn().mockImplementation((fn: (se: Record<string, unknown>) => void) => {
        const se: Record<string, unknown> = { position: -1 }
        fn(se)
        return se
      })
      const items = [
        mockSessionExercise({ id: 'se-1', prepareUpdate: mockPrepareUpdate }),
        mockSessionExercise({ id: 'se-2', prepareUpdate: mockPrepareUpdate }),
      ]
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.reorderExercises(items)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockBatch).toHaveBeenCalledTimes(1)
      expect(mockPrepareUpdate).toHaveBeenCalledTimes(2)
    })

    it('should set position = index for each item', async () => {
      const capturedPositions: number[] = []
      const mockPrepareUpdate = jest.fn().mockImplementation((fn: (se: Record<string, unknown>) => void) => {
        const se: Record<string, unknown> = { position: -1 }
        fn(se)
        capturedPositions.push(se.position as number)
        return se
      })
      const items = [
        mockSessionExercise({ id: 'se-1', prepareUpdate: mockPrepareUpdate }),
        mockSessionExercise({ id: 'se-2', prepareUpdate: mockPrepareUpdate }),
        mockSessionExercise({ id: 'se-3', prepareUpdate: mockPrepareUpdate }),
      ]
      const { result } = renderHook(() => useSessionManager(testSession))

      await act(async () => {
        await result.current.reorderExercises(items)
      })

      expect(capturedPositions).toEqual([0, 1, 2])
    })

    it('should return true with an empty items array', async () => {
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.reorderExercises([])
      })

      expect(success!).toBe(true)
    })

    it('should return false on error', async () => {
      mockWrite.mockRejectedValueOnce(new Error('Write failed'))
      const { result } = renderHook(() => useSessionManager(testSession))

      let success: boolean
      await act(async () => {
        success = await result.current.reorderExercises([])
      })

      expect(success!).toBe(false)
    })
  })
})
