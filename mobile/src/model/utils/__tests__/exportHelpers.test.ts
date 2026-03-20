// Mocks AVANT les imports
import * as FileSystem from 'expo-file-system'
import { exportAllData, importAllData } from '../exportHelpers'
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

const mockWriteAsStringAsync = FileSystem.writeAsStringAsync as jest.Mock
const mockReadAsStringAsync = (FileSystem as unknown as { readAsStringAsync: jest.Mock }).readAsStringAsync
const mockDbGet = database.get as jest.Mock
const mockDbWrite = (database as unknown as { write: jest.Mock }).write
const mockDbBatch = (database as unknown as { batch: jest.Mock }).batch

function makeRecord(tableName: string, id: string, extra: Record<string, unknown> = {}) {
  return {
    _raw: { id, _status: 'synced', _changed: '', ...extra },
  }
}

function setupDb(tableData: Record<string, unknown[]>) {
  mockDbGet.mockImplementation((tableName: string) => ({
    query: () => ({
      fetch: () => Promise.resolve(tableData[tableName] ?? []),
    }),
  }))
}

describe('exportHelpers — exportAllData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('écrit un fichier JSON avec documentDirectory + nom daté', async () => {
    setupDb({})
    const filePath = await exportAllData()

    expect(filePath).toMatch(/^file:\/\/\/test-dir\/kore-export-\d{4}-\d{2}-\d{2}\.json$/)
    expect(mockWriteAsStringAsync).toHaveBeenCalledTimes(1)
    expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
      filePath,
      expect.any(String)
    )
  })

  it('exporte les metadata avec exportDate, appVersion et schemaVersion', async () => {
    setupDb({})
    await exportAllData()

    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.metadata).toBeDefined()
    expect(data.metadata.exportDate).toBeDefined()
    expect(data.metadata.appVersion).toBe('1.0.0')
    expect(data.metadata.schemaVersion).toBe(32)
  })

  it('inclut le compte par table dans metadata.tables', async () => {
    setupDb({
      programs: [makeRecord('programs', 'p1'), makeRecord('programs', 'p2')],
      exercises: [makeRecord('exercises', 'e1')],
    })

    await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.metadata.tables.programs).toBe(2)
    expect(data.metadata.tables.exercises).toBe(1)
  })

  it('exporte les données de la table programs', async () => {
    setupDb({
      programs: [makeRecord('programs', 'prog-1', { name: 'PPL' })],
    })

    await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(Array.isArray(data.programs)).toBe(true)
    expect(data.programs[0].id).toBe('prog-1')
    expect(data.programs[0].name).toBe('PPL')
  })

  it('exporte les champs users sans filtrage', async () => {
    setupDb({
      users: [makeRecord('users', 'user-1', { name: 'Jean', email: 'test@test.com' })],
    })

    await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.users[0].name).toBe('Jean')
    expect(data.users[0].email).toBe('test@test.com')
  })

  it('n\'altère pas les records non-users (conserve tous les champs)', async () => {
    setupDb({
      exercises: [makeRecord('exercises', 'ex-1', { name: 'Squat', muscles: '["Quadriceps"]' })],
    })

    await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.exercises[0].name).toBe('Squat')
    expect(data.exercises[0].muscles).toBe('["Quadriceps"]')
  })

  it('retourne le chemin du fichier créé', async () => {
    setupDb({})
    const filePath = await exportAllData()
    expect(typeof filePath).toBe('string')
    expect(filePath.startsWith('file:///test-dir/')).toBe(true)
  })
})

// ─── importAllData ───────────────────────────────────────────────────────────

describe('exportHelpers — importAllData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDbWrite.mockImplementation((cb: () => Promise<unknown>) => cb())
    mockDbBatch.mockResolvedValue(undefined)
  })

  it('reads JSON file and destroys existing records before creating new ones', async () => {
    const importData = {
      metadata: {
        exportDate: '2026-01-01',
        appVersion: '1.0.0',
        schemaVersion: 32,
        tables: { programs: 1 },
      },
      programs: [{ id: 'p1', name: 'PPL' }],
    }

    mockReadAsStringAsync.mockResolvedValue(JSON.stringify(importData))

    const mockPrepareDestroy = jest.fn().mockReturnValue({ _raw: { id: 'old' } })
    const mockPrepareCreate = jest.fn().mockReturnValue({ _raw: {} })

    mockDbGet.mockImplementation(() => ({
      query: () => ({
        fetch: () => Promise.resolve([{ prepareDestroyPermanently: mockPrepareDestroy }]),
      }),
      prepareCreate: mockPrepareCreate,
    }))

    await importAllData('file:///import.json')

    expect(mockReadAsStringAsync).toHaveBeenCalledWith('file:///import.json')
    expect(mockDbWrite).toHaveBeenCalled()
    expect(mockDbBatch).toHaveBeenCalled()
  })

  it('throws on invalid format (no metadata.tables)', async () => {
    mockReadAsStringAsync.mockResolvedValue(JSON.stringify({ bad: 'data' }))

    await expect(importAllData('file:///bad.json')).rejects.toThrow('métadonnées manquantes')
  })

  it('throws on invalid JSON', async () => {
    mockReadAsStringAsync.mockResolvedValue('not valid json{{{')

    await expect(importAllData('file:///bad.json')).rejects.toThrow('JSON valide')
  })

  it('throws when no known table has data', async () => {
    const importData = {
      metadata: {
        exportDate: '2026-01-01',
        appVersion: '1.0.0',
        schemaVersion: 32,
        tables: {},
      },
    }

    mockReadAsStringAsync.mockResolvedValue(JSON.stringify(importData))

    await expect(importAllData('file:///empty.json')).rejects.toThrow('Aucune donnée reconnue')
  })
})
