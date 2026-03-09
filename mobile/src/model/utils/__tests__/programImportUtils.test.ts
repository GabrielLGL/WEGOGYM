/**
 * Tests for programImportUtils.ts — DB-dependent, mocked.
 */
import { importPresetProgram, markOnboardingCompleted } from '../programImportUtils'
import { database } from '../../index'
import type { PresetProgram } from '../../onboardingPrograms'

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

const mockGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock
const mockBatch = database.batch as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
  mockBatch.mockResolvedValue(undefined)
})

// ─── importPresetProgram ──────────────────────────────────────────────────────

describe('importPresetProgram', () => {
  const preset: PresetProgram = {
    name: 'Programme Test',
    description: 'Programme de test',
    sessions: [
      {
        name: 'Séance A',
        exercises: [
          { exerciseName: 'Bench Press', setsTarget: 3, repsTarget: '10', weightTarget: 0 },
        ],
      },
    ],
  }

  function setupMocks(exercises: { name: string; id: string }[] = [], programCount = 0) {
    const mockPrepareCreate = jest.fn().mockReturnValue({ id: 'new-record' })
    mockGet.mockImplementation((collection: string) => {
      if (collection === 'exercises') {
        return {
          query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(exercises) }),
        }
      }
      if (collection === 'programs') {
        return {
          query: jest.fn().mockReturnValue({ fetchCount: jest.fn().mockResolvedValue(programCount) }),
          prepareCreate: mockPrepareCreate,
        }
      }
      return { prepareCreate: mockPrepareCreate }
    })
    return mockPrepareCreate
  }

  it('calls database.write and database.batch', async () => {
    setupMocks([{ id: 'e1', name: 'Bench Press' }])

    // Need to make prepareCreate chainable
    mockWrite.mockImplementation(async (cb: () => Promise<unknown>) => {
      await cb()
    })

    await importPresetProgram(preset)
    expect(mockWrite).toHaveBeenCalled()
  })

  it('does not throw for a preset with no exercises found', async () => {
    setupMocks([]) // no exercises in DB
    await expect(importPresetProgram(preset)).resolves.not.toThrow()
  })

  it('handles preset with no sessions gracefully', async () => {
    const emptyPreset: PresetProgram = { name: 'Empty', description: '', sessions: [] }
    setupMocks([])
    await expect(importPresetProgram(emptyPreset)).resolves.not.toThrow()
  })
})

// ─── markOnboardingCompleted ──────────────────────────────────────────────────

describe('markOnboardingCompleted', () => {
  it('calls database.write', async () => {
    const mockUpdate = jest.fn().mockImplementation((cb: (u: Record<string, unknown>) => void) => {
      cb({ onboardingCompleted: false })
    })
    const mockUser = { update: mockUpdate }
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([mockUser]) }) })

    await markOnboardingCompleted()
    expect(mockWrite).toHaveBeenCalled()
  })

  it('does nothing when no users exist', async () => {
    mockGet.mockReturnValue({ query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) })
    await expect(markOnboardingCompleted()).resolves.not.toThrow()
  })

  it('sets onboardingCompleted to true', async () => {
    const capturedUser: Record<string, unknown> = { onboardingCompleted: false }
    const mockUpdate = jest.fn().mockImplementation((cb: (u: Record<string, unknown>) => void) => {
      cb(capturedUser)
    })
    mockGet.mockReturnValue({
      query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([{ update: mockUpdate }]) }),
    })

    await markOnboardingCompleted()
    expect(capturedUser.onboardingCompleted).toBe(true)
  })
})
