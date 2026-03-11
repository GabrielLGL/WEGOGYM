/**
 * Tests for dataManagementUtils.ts — deleteAllData
 */

import * as FileSystem from 'expo-file-system'

import { deleteAllData } from '../dataManagementUtils'
import { database } from '../../index'
import { deleteApiKey } from '../../../services/secureKeyStore'
import { cancelAllReminders } from '../../../services/notificationService'
import { mockUser } from './testFactories'

// Mock dependencies
jest.mock('../../index', () => ({
  database: {
    write: jest.fn(),
    get: jest.fn(),
    batch: jest.fn(),
  },
}))
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}))
jest.mock('../../../services/secureKeyStore', () => ({
  deleteApiKey: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('../../../services/notificationService', () => ({
  cancelAllReminders: jest.fn().mockResolvedValue(undefined),
}))

const mockWrite = database.write as jest.Mock
const mockGet = database.get as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation(async (fn: () => Promise<void>) => fn())
  ;(FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([])
})

function mockCollectionQuery(records: { prepareDestroyPermanently: () => unknown }[]) {
  return {
    query: jest.fn().mockReturnValue({
      fetch: jest.fn().mockResolvedValue(records),
    }),
  }
}

function makeRecord() {
  return { prepareDestroyPermanently: jest.fn().mockReturnValue('destroy-op') }
}

describe('deleteAllData', () => {
  it('deletes all records and resets user when user is provided', async () => {
    const record1 = makeRecord()
    const record2 = makeRecord()
    const collections: Record<string, ReturnType<typeof mockCollectionQuery>> = {
      programs: mockCollectionQuery([record1]),
      sessions: mockCollectionQuery([record2]),
      session_exercises: mockCollectionQuery([]),
      histories: mockCollectionQuery([]),
      sets: mockCollectionQuery([]),
      performance_logs: mockCollectionQuery([]),
      body_measurements: mockCollectionQuery([]),
      user_badges: mockCollectionQuery([]),
      exercises: mockCollectionQuery([]),
    }
    mockGet.mockImplementation((name: string) => collections[name])

    const testUser = mockUser({
      prepareUpdate: jest.fn((fn: (u: Record<string, unknown>) => void) => {
        const u: Record<string, unknown> = {}
        fn(u)
        expect(u.totalXp).toBe(0)
        expect(u.level).toBe(1)
        expect(u.onboardingCompleted).toBe(false)
        expect(u.disclaimerAccepted).toBe(false)
        expect(u.cguVersionAccepted).toBeNull()
        return 'user-update-op'
      }),
    })

    await deleteAllData(testUser)

    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(cancelAllReminders).toHaveBeenCalled()
    expect(deleteApiKey).toHaveBeenCalled()
  })

  it('works when user is null', async () => {
    const collections: Record<string, ReturnType<typeof mockCollectionQuery>> = {
      programs: mockCollectionQuery([]),
      sessions: mockCollectionQuery([]),
      session_exercises: mockCollectionQuery([]),
      histories: mockCollectionQuery([]),
      sets: mockCollectionQuery([]),
      performance_logs: mockCollectionQuery([]),
      body_measurements: mockCollectionQuery([]),
      user_badges: mockCollectionQuery([]),
      exercises: mockCollectionQuery([]),
    }
    mockGet.mockImplementation((name: string) => collections[name])

    await deleteAllData(null)

    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(cancelAllReminders).toHaveBeenCalled()
    expect(deleteApiKey).toHaveBeenCalled()
  })

  it('deletes export files from documentDirectory', async () => {
    const collections: Record<string, ReturnType<typeof mockCollectionQuery>> = {
      programs: mockCollectionQuery([]),
      sessions: mockCollectionQuery([]),
      session_exercises: mockCollectionQuery([]),
      histories: mockCollectionQuery([]),
      sets: mockCollectionQuery([]),
      performance_logs: mockCollectionQuery([]),
      body_measurements: mockCollectionQuery([]),
      user_badges: mockCollectionQuery([]),
      exercises: mockCollectionQuery([]),
    }
    mockGet.mockImplementation((name: string) => collections[name])
    ;(FileSystem.readDirectoryAsync as jest.Mock).mockResolvedValue([
      'kore-export-2026.json',
      'other-file.txt',
      'kore-export-old.json',
    ])

    await deleteAllData(null)

    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(2)
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      '/mock/documents/kore-export-2026.json',
      { idempotent: true },
    )
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
      '/mock/documents/kore-export-old.json',
      { idempotent: true },
    )
  })
})
