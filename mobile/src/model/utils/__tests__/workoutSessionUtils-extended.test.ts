/**
 * Extended tests for workoutSessionUtils.ts — softDeleteHistory + edge cases
 */
jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}))

import { softDeleteHistory, getLastSessionVolume } from '../workoutSessionUtils'
import { database } from '../../index'

const mockGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
})

// ─── softDeleteHistory ───────────────────────────────────────────────────────

describe('softDeleteHistory', () => {
  it('sets deletedAt to a Date via database.write', async () => {
    const capturedUpdate: Record<string, unknown> = {}
    const mockUpdate = jest.fn().mockImplementation((cb: (h: Record<string, unknown>) => void) => {
      const record: Record<string, unknown> = { deletedAt: null }
      cb(record)
      Object.assign(capturedUpdate, record)
    })
    mockGet.mockReturnValue({
      find: jest.fn().mockResolvedValue({ update: mockUpdate }),
    })

    await softDeleteHistory('h1')

    expect(mockWrite).toHaveBeenCalled()
    expect(capturedUpdate.deletedAt).toBeInstanceOf(Date)
  })
})

// ─── getLastSessionVolume — additional edge cases ────────────────────────────

describe('getLastSessionVolume — edge cases', () => {
  it('picks the most recent completed history when multiple exist', async () => {
    const histories = [
      {
        id: 'h-old',
        startTime: new Date(2026, 0, 1),
        endTime: new Date(2026, 0, 1, 1),
      },
      {
        id: 'h-recent',
        startTime: new Date(2026, 0, 5),
        endTime: new Date(2026, 0, 5, 1),
      },
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      if (collection === 'sets') {
        return {
          query: jest.fn().mockReturnValue({
            fetch: jest.fn().mockResolvedValue([
              { weight: 80, reps: 8 }, // 640
            ]),
          }),
        }
      }
      return {}
    })

    const result = await getLastSessionVolume('sess1', 'h-other')
    expect(result).toBe(640)
  })

  it('returns 0 when the most recent session has no sets', async () => {
    const histories = [
      {
        id: 'h1',
        startTime: new Date(2026, 0, 1),
        endTime: new Date(2026, 0, 1, 1),
      },
    ]

    mockGet.mockImplementation((collection: string) => {
      if (collection === 'histories') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(histories) }) }
      }
      if (collection === 'sets') {
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
      }
      return {}
    })

    const result = await getLastSessionVolume('sess1', 'h-other')
    expect(result).toBe(0)
  })
})
