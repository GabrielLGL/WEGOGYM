import * as FileSystem from 'expo-file-system'
import { database } from '../index'

const TABLE_NAMES = [
  'programs',
  'sessions',
  'session_exercises',
  'exercises',
  'performance_logs',
  'histories',
  'sets',
  'body_measurements',
  'users',
] as const

interface ExportMetadata {
  exportDate: string
  appVersion: string
  schemaVersion: number
  tables: Record<string, number>
}

export interface ExportData {
  metadata: ExportMetadata
  [tableName: string]: unknown
}

function formatExportDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function sanitizeUserRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const { ai_api_key: _removed, ...safe } = raw
  return safe
}

export async function exportAllData(): Promise<string> {
  const data: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      schemaVersion: 20,
      tables: {},
    },
  }

  for (const tableName of TABLE_NAMES) {
    const records = await database.get(tableName).query().fetch()
    const rawRecords = records.map(r => {
      const raw = { ...(r as unknown as { _raw: Record<string, unknown> })._raw }
      if (tableName === 'users') {
        return sanitizeUserRecord(raw)
      }
      return raw
    })
    data[tableName] = rawRecords
    data.metadata.tables[tableName] = rawRecords.length
  }

  const jsonString = JSON.stringify(data, null, 2)
  const dateStr = formatExportDate()
  const fileName = `kore-export-${dateStr}.json`
  const filePath = `${FileSystem.documentDirectory}${fileName}`

  await FileSystem.writeAsStringAsync(filePath, jsonString)

  return filePath
}
