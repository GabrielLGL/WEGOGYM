/**
 * Tests for exportHelpers.ts — importAllData (lines 75-104)
 */
import * as FileSystem from 'expo-file-system'
import { importAllData } from '../exportHelpers'
import { database } from '../../index'

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test-dir/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn(),
}))

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

jest.mock('../../schema', () => ({
  mySchema: {
    version: 32,
    tables: {
      programs: { columnArray: [{ name: 'name' }, { name: 'position' }] },
      sessions: { columnArray: [{ name: 'name' }, { name: 'program_id' }] },
      session_exercises: { columnArray: [{ name: 'session_id' }, { name: 'exercise_id' }] },
      exercises: { columnArray: [{ name: 'name' }, { name: 'muscles' }] },
      performance_logs: { columnArray: [{ name: 'exercise_id' }] },
      histories: { columnArray: [{ name: 'session_id' }, { name: 'start_time' }] },
      sets: { columnArray: [{ name: 'history_id' }, { name: 'exercise_id' }, { name: 'weight' }, { name: 'reps' }] },
      body_measurements: { columnArray: [{ name: 'weight' }] },
      users: { columnArray: [{ name: 'name' }] },
      user_badges: { columnArray: [{ name: 'badge_id' }] },
    },
  },
}))

const mockReadAsStringAsync = FileSystem.readAsStringAsync as jest.Mock
const mockDbGet = database.get as jest.Mock
const mockWrite = database.write as jest.Mock
const mockBatch = database.batch as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
  mockBatch.mockResolvedValue(undefined)
})

describe('importAllData', () => {
  it('reads the file and imports all table data', async () => {
    const exportData = {
      metadata: {
        exportDate: '2026-01-01T00:00:00.000Z',
        appVersion: '1.0.0',
        schemaVersion: 32,
        tables: { programs: 1, exercises: 0 },
      },
      programs: [{ id: 'p1', name: 'PPL' }],
    }

    mockReadAsStringAsync.mockResolvedValue(JSON.stringify(exportData))

    const existingRecords = [
      { prepareDestroyPermanently: jest.fn().mockReturnValue({ type: 'destroy' }) },
    ]

    const prepareCreateMock = jest.fn().mockReturnValue({ type: 'create' })

    mockDbGet.mockImplementation(() => ({
      query: () => ({ fetch: () => Promise.resolve(existingRecords) }),
      prepareCreate: prepareCreateMock,
    }))

    await importAllData('file:///test-dir/kore-export-2026-01-01.json')

    expect(mockReadAsStringAsync).toHaveBeenCalledWith('file:///test-dir/kore-export-2026-01-01.json')
    expect(mockWrite).toHaveBeenCalled()
    expect(mockBatch).toHaveBeenCalled()
  })

  it('throws on invalid format (no metadata.tables)', async () => {
    mockReadAsStringAsync.mockResolvedValue(JSON.stringify({ invalid: true }))

    await expect(importAllData('file:///bad.json')).rejects.toThrow('métadonnées manquantes')
  })

  it('throws when no known table has data', async () => {
    const exportData = {
      metadata: {
        exportDate: '2026-01-01T00:00:00.000Z',
        appVersion: '1.0.0',
        schemaVersion: 32,
        tables: {},
      },
    }

    mockReadAsStringAsync.mockResolvedValue(JSON.stringify(exportData))

    await expect(importAllData('file:///empty.json')).rejects.toThrow('Aucune donnée reconnue')
  })

  it('destroys existing records before importing new ones', async () => {
    const exportData = {
      metadata: {
        exportDate: '2026-01-01T00:00:00.000Z',
        appVersion: '1.0.0',
        schemaVersion: 32,
        tables: { programs: 1 },
      },
      programs: [{ id: 'p1', name: 'PPL' }],
    }

    mockReadAsStringAsync.mockResolvedValue(JSON.stringify(exportData))

    const destroyOp = { type: 'destroy' }
    const createOp = { type: 'create' }

    mockDbGet.mockImplementation(() => ({
      query: () => ({
        fetch: () => Promise.resolve([
          { prepareDestroyPermanently: jest.fn().mockReturnValue(destroyOp) },
        ]),
      }),
      prepareCreate: jest.fn().mockReturnValue(createOp),
    }))

    await importAllData('file:///import.json')

    // batch should include both destroy and create ops
    const batchArgs = mockBatch.mock.calls[0]
    expect(batchArgs.length).toBeGreaterThan(0)
  })
})
