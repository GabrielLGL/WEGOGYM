// Mock the database BEFORE imports to avoid SQLiteAdapter JSI initialization
jest.mock('../../model/index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}))
jest.mock('../../model/utils/databaseHelpers', () => ({
  getNextPosition: jest.fn(),
}))
jest.mock('../../model/utils/validationHelpers', () => ({
  isValidText: jest.fn(),
}))
jest.mock('@nozbe/watermelondb', () => ({
  Q: { where: jest.fn().mockReturnValue({}) },
}))

import { renderHook, act } from '@testing-library/react-native'
import { useProgramManager } from '../useProgramManager'
import { database } from '../../model/index'
import { getNextPosition } from '../../model/utils/databaseHelpers'
import { isValidText } from '../../model/utils/validationHelpers'

const mockWrite = database.write as jest.Mock
const mockGet = database.get as jest.Mock
const mockGetNextPosition = getNextPosition as jest.Mock
const mockIsValidText = isValidText as jest.Mock

const createMockProgram = (id = 'prog-1', name = 'Program 1') => ({
  id,
  name,
  update: jest.fn().mockImplementation(async (fn: (p: { name: string; position: number }) => void) => {
    fn({ name: '', position: 0 })
  }),
  destroyPermanently: jest.fn().mockResolvedValue(undefined),
  duplicate: jest.fn().mockResolvedValue(undefined),
})

const createMockSession = (id = 'sess-1', name = 'Session 1', programId = 'prog-1') => {
  const mockParentProgram = createMockProgram(programId)
  return {
    id,
    name,
    program: {
      id: programId,
      fetch: jest.fn().mockResolvedValue(mockParentProgram),
      set: jest.fn(),
    },
    update: jest.fn().mockImplementation(async (fn: (s: { name: string; position: number; program: { set: jest.Mock } }) => void) => {
      fn({ name: '', position: 0, program: { set: jest.fn() } })
    }),
    destroyPermanently: jest.fn().mockResolvedValue(undefined),
  }
}

describe('useProgramManager', () => {
  let mockCreate: jest.Mock
  let mockQuery: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockWrite.mockImplementation((fn: () => Promise<unknown>) => fn())
    mockGetNextPosition.mockResolvedValue(1)
    mockIsValidText.mockReturnValue(true)

    mockCreate = jest.fn().mockImplementation((fn: (record: Record<string, unknown>) => void) => {
      const record = {
        id: 'new-record',
        name: '',
        position: 0,
        program: { set: jest.fn() },
        session: { set: jest.fn() },
        exercise: { set: jest.fn() },
      }
      fn(record)
      return Promise.resolve(record)
    })

    mockQuery = jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue([]),
    })

    mockGet.mockReturnValue({ create: mockCreate, query: mockQuery })
  })

  // --- Initial state ---

  describe('initial state', () => {
    it('should initialize with empty form fields', () => {
      const { result } = renderHook(() => useProgramManager())

      expect(result.current.programNameInput).toBe('')
      expect(result.current.sessionNameInput).toBe('')
      expect(result.current.isRenamingProgram).toBe(false)
      expect(result.current.isRenamingSession).toBe(false)
      expect(result.current.selectedProgram).toBeNull()
      expect(result.current.selectedSession).toBeNull()
      expect(result.current.targetProgram).toBeNull()
    })

    it('should expose all required functions', () => {
      const { result } = renderHook(() => useProgramManager())

      expect(result.current).toHaveProperty('saveProgram')
      expect(result.current).toHaveProperty('duplicateProgram')
      expect(result.current).toHaveProperty('deleteProgram')
      expect(result.current).toHaveProperty('saveSession')
      expect(result.current).toHaveProperty('duplicateSession')
      expect(result.current).toHaveProperty('deleteSession')
      expect(result.current).toHaveProperty('moveSession')
      expect(result.current).toHaveProperty('prepareRenameProgram')
      expect(result.current).toHaveProperty('prepareRenameSession')
      expect(result.current).toHaveProperty('resetProgramForm')
      expect(result.current).toHaveProperty('resetSessionForm')
    })
  })

  // --- saveProgram ---

  describe('saveProgram', () => {
    it('should return false when programNameInput is invalid', async () => {
      mockIsValidText.mockReturnValue(false)
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.saveProgram()
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should create a new program when not renaming', async () => {
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setProgramNameInput('Mon Programme')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveProgram()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith('programs')
      expect(mockCreate).toHaveBeenCalled()
      expect(mockGetNextPosition).toHaveBeenCalledWith('programs')
    })

    it('should rename existing program when isRenamingProgram is true', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.prepareRenameProgram(mockProgram as any)
        result.current.setProgramNameInput('Nouveau Nom')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveProgram()
      })

      expect(success!).toBe(true)
      expect(mockProgram.update).toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should call onSuccess callback after creation', async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useProgramManager(onSuccess))

      await act(async () => {
        result.current.setProgramNameInput('Mon Programme')
      })

      await act(async () => {
        await result.current.saveProgram()
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should reset program form after success', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.prepareRenameProgram(mockProgram as any)
        result.current.setProgramNameInput('Nouveau Nom')
      })

      await act(async () => {
        await result.current.saveProgram()
      })

      expect(result.current.programNameInput).toBe('')
      expect(result.current.isRenamingProgram).toBe(false)
      expect(result.current.selectedProgram).toBeNull()
    })

    it('should return false on database error', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setProgramNameInput('Mon Programme')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveProgram()
      })

      expect(success!).toBe(false)
    })
  })

  // --- duplicateProgram ---

  describe('duplicateProgram', () => {
    it('should return false when selectedProgram is null', async () => {
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateProgram()
      })

      expect(success!).toBe(false)
    })

    it('should call duplicate on selected program', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateProgram()
      })

      expect(success!).toBe(true)
      expect(mockProgram.duplicate).toHaveBeenCalled()
    })

    it('should clear selectedProgram and call onSuccess after duplication', async () => {
      const onSuccess = jest.fn()
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager(onSuccess))

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      await act(async () => {
        await result.current.duplicateProgram()
      })

      expect(result.current.selectedProgram).toBeNull()
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should return false on error', async () => {
      const mockProgram = createMockProgram()
      mockProgram.duplicate.mockRejectedValue(new Error('Duplicate failed'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateProgram()
      })

      expect(success!).toBe(false)
    })
  })

  // --- deleteProgram ---

  describe('deleteProgram', () => {
    it('should return false when selectedProgram is null', async () => {
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteProgram()
      })

      expect(success!).toBe(false)
    })

    it('should destroy selected program inside database.write', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteProgram()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockProgram.destroyPermanently).toHaveBeenCalled()
    })

    it('should clear selectedProgram after deletion', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      await act(async () => {
        await result.current.deleteProgram()
      })

      expect(result.current.selectedProgram).toBeNull()
    })

    it('should return false on error', async () => {
      const mockProgram = createMockProgram()
      mockProgram.destroyPermanently.mockRejectedValue(new Error('Delete failed'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteProgram()
      })

      expect(success!).toBe(false)
    })
  })

  // --- saveSession ---

  describe('saveSession', () => {
    it('should return false when sessionNameInput is invalid', async () => {
      mockIsValidText.mockReturnValue(false)
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.saveSession()
      })

      expect(success!).toBe(false)
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('should create new session when targetProgram is set', async () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSessionNameInput('Ma Séance')
        result.current.setTargetProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveSession()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith('sessions')
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should rename existing session when isRenamingSession is true', async () => {
      const mockSession = createMockSession()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.prepareRenameSession(mockSession as any)
        result.current.setSessionNameInput('Nouveau Nom')
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveSession()
      })

      expect(success!).toBe(true)
      expect(mockSession.update).toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should call onSuccess and reset session form after success', async () => {
      const onSuccess = jest.fn()
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager(onSuccess))

      await act(async () => {
        result.current.setSessionNameInput('Ma Séance')
        result.current.setTargetProgram(mockProgram as any)
      })

      await act(async () => {
        await result.current.saveSession()
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(result.current.sessionNameInput).toBe('')
      expect(result.current.isRenamingSession).toBe(false)
      expect(result.current.targetProgram).toBeNull()
      expect(result.current.selectedSession).toBeNull()
    })

    it('should return false on database error', async () => {
      mockWrite.mockRejectedValue(new Error('DB error'))
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSessionNameInput('Ma Séance')
        result.current.setTargetProgram(mockProgram as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.saveSession()
      })

      expect(success!).toBe(false)
    })
  })

  // --- duplicateSession ---

  describe('duplicateSession', () => {
    it('should return false when selectedSession is null', async () => {
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateSession()
      })

      expect(success!).toBe(false)
    })

    it('should duplicate session with no exercises', async () => {
      const mockSession = createMockSession()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateSession()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(result.current.selectedSession).toBeNull()
    })

    it('should duplicate session exercises when present', async () => {
      const mockSession = createMockSession()
      const mockExercise = { id: 'exo-1' }
      const mockSE = {
        id: 'se-1',
        position: 1,
        setsTarget: 3,
        repsTarget: '10',
        weightTarget: 60,
        exercise: { fetch: jest.fn().mockResolvedValue(mockExercise) },
      }
      mockQuery.mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockSE]) })

      const onSuccess = jest.fn()
      const { result } = renderHook(() => useProgramManager(onSuccess))

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateSession()
      })

      expect(success!).toBe(true)
      expect(onSuccess).toHaveBeenCalled()
      // create called for new session + new session_exercise
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('should return false on error', async () => {
      const mockSession = createMockSession()
      mockWrite.mockRejectedValue(new Error('Duplicate failed'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.duplicateSession()
      })

      expect(success!).toBe(false)
    })
  })

  // --- deleteSession ---

  describe('deleteSession', () => {
    it('should return false when selectedSession is null', async () => {
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteSession()
      })

      expect(success!).toBe(false)
    })

    it('should destroy selected session inside database.write', async () => {
      const mockSession = createMockSession()
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteSession()
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockSession.destroyPermanently).toHaveBeenCalled()
      expect(result.current.selectedSession).toBeNull()
    })

    it('should return false on error', async () => {
      const mockSession = createMockSession()
      mockSession.destroyPermanently.mockRejectedValue(new Error('Delete failed'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.deleteSession()
      })

      expect(success!).toBe(false)
    })
  })

  // --- moveSession ---

  describe('moveSession', () => {
    it('should return false when selectedSession is null', async () => {
      const targetProg = createMockProgram('prog-2')
      const { result } = renderHook(() => useProgramManager())

      let success: boolean
      await act(async () => {
        success = await result.current.moveSession(targetProg as any)
      })

      expect(success!).toBe(false)
    })

    it('should update session program and position', async () => {
      const mockSession = createMockSession()
      const targetProg = createMockProgram('prog-2', 'Target Program')
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.moveSession(targetProg as any)
      })

      expect(success!).toBe(true)
      expect(mockWrite).toHaveBeenCalled()
      expect(mockSession.update).toHaveBeenCalled()
      expect(mockGetNextPosition).toHaveBeenCalled()
    })

    it('should call onSuccess and clear session after move', async () => {
      const onSuccess = jest.fn()
      const mockSession = createMockSession()
      const targetProg = createMockProgram('prog-2', 'Target Program')
      const { result } = renderHook(() => useProgramManager(onSuccess))

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      await act(async () => {
        await result.current.moveSession(targetProg as any)
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(result.current.selectedSession).toBeNull()
    })

    it('should return false on error', async () => {
      const mockSession = createMockSession()
      const targetProg = createMockProgram('prog-2')
      mockWrite.mockRejectedValue(new Error('Move failed'))
      const { result } = renderHook(() => useProgramManager())

      await act(async () => {
        result.current.setSelectedSession(mockSession as any)
      })

      let success: boolean
      await act(async () => {
        success = await result.current.moveSession(targetProg as any)
      })

      expect(success!).toBe(false)
    })
  })

  // --- prepareRenameProgram ---

  describe('prepareRenameProgram', () => {
    it('should set selectedProgram, programNameInput and isRenamingProgram', () => {
      const mockProgram = createMockProgram('p1', 'Test Program')
      const { result } = renderHook(() => useProgramManager())

      act(() => {
        result.current.prepareRenameProgram(mockProgram as any)
      })

      expect(result.current.selectedProgram).toBe(mockProgram)
      expect(result.current.programNameInput).toBe('Test Program')
      expect(result.current.isRenamingProgram).toBe(true)
    })
  })

  // --- prepareRenameSession ---

  describe('prepareRenameSession', () => {
    it('should set selectedSession, sessionNameInput and isRenamingSession', () => {
      const mockSession = createMockSession('s1', 'Test Session')
      const { result } = renderHook(() => useProgramManager())

      act(() => {
        result.current.prepareRenameSession(mockSession as any)
      })

      expect(result.current.selectedSession).toBe(mockSession)
      expect(result.current.sessionNameInput).toBe('Test Session')
      expect(result.current.isRenamingSession).toBe(true)
    })
  })

  // --- resetProgramForm ---

  describe('resetProgramForm', () => {
    it('should clear program name, renaming flag and selected program', () => {
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      act(() => {
        result.current.prepareRenameProgram(mockProgram as any)
      })

      act(() => {
        result.current.resetProgramForm()
      })

      expect(result.current.programNameInput).toBe('')
      expect(result.current.isRenamingProgram).toBe(false)
      expect(result.current.selectedProgram).toBeNull()
    })
  })

  // --- resetSessionForm ---

  describe('resetSessionForm', () => {
    it('should clear session name, renaming flag, targetProgram and selectedSession', () => {
      const mockSession = createMockSession()
      const mockProgram = createMockProgram()
      const { result } = renderHook(() => useProgramManager())

      act(() => {
        result.current.prepareRenameSession(mockSession as any)
        result.current.setTargetProgram(mockProgram as any)
      })

      act(() => {
        result.current.resetSessionForm()
      })

      expect(result.current.sessionNameInput).toBe('')
      expect(result.current.isRenamingSession).toBe(false)
      expect(result.current.targetProgram).toBeNull()
      expect(result.current.selectedSession).toBeNull()
    })
  })
})
