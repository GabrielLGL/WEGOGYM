// Mocks AVANT les imports
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test-dir/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
  },
}))

import * as FileSystem from 'expo-file-system'
import { exportAllData } from '../exportHelpers'
import { database } from '../../index'

const mockWriteAsStringAsync = FileSystem.writeAsStringAsync as jest.Mock
const mockDbGet = database.get as jest.Mock

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
    const filePath = await exportAllData()

    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.metadata).toBeDefined()
    expect(data.metadata.exportDate).toBeDefined()
    expect(data.metadata.appVersion).toBe('1.0.0')
    expect(data.metadata.schemaVersion).toBe(31)
  })

  it('inclut le compte par table dans metadata.tables', async () => {
    setupDb({
      programs: [makeRecord('programs', 'p1'), makeRecord('programs', 'p2')],
      exercises: [makeRecord('exercises', 'e1')],
    })

    const filePath = await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.metadata.tables.programs).toBe(2)
    expect(data.metadata.tables.exercises).toBe(1)
  })

  it('exporte les données de la table programs', async () => {
    setupDb({
      programs: [makeRecord('programs', 'prog-1', { name: 'PPL' })],
    })

    const filePath = await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(Array.isArray(data.programs)).toBe(true)
    expect(data.programs[0].id).toBe('prog-1')
    expect(data.programs[0].name).toBe('PPL')
  })

  it('filtre ai_api_key de la table users', async () => {
    setupDb({
      users: [makeRecord('users', 'user-1', { ai_api_key: 'secret-key', name: 'Jean' })],
    })

    const filePath = await exportAllData()
    const written = mockWriteAsStringAsync.mock.calls[0][1] as string
    const data = JSON.parse(written)

    expect(data.users[0].name).toBe('Jean')
    expect(data.users[0].ai_api_key).toBeUndefined()
  })

  it('n\'altère pas les records non-users (conserve tous les champs)', async () => {
    setupDb({
      exercises: [makeRecord('exercises', 'ex-1', { name: 'Squat', muscles: '["Quadriceps"]' })],
    })

    const filePath = await exportAllData()
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
