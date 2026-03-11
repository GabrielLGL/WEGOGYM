import * as FileSystem from 'expo-file-system'
import { Model } from '@nozbe/watermelondb'
import { database } from '../index'
import { mySchema } from '../schema'

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
  'user_badges',
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

/** Build a whitelist of allowed columns per table from the schema. */
function getAllowedColumns(): Record<string, Set<string>> {
  const result: Record<string, Set<string>> = {}
  for (const tableName of Object.keys(mySchema.tables)) {
    const table = mySchema.tables[tableName]
    const cols = new Set<string>(['id', '_status', '_changed'])
    for (const col of table.columnArray) {
      cols.add(col.name)
    }
    result[tableName] = cols
  }
  return result
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
      schemaVersion: mySchema.version,
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

export async function importAllData(fileUri: string): Promise<void> {
  const jsonString = await FileSystem.readAsStringAsync(fileUri)

  let data: ExportData
  try {
    data = JSON.parse(jsonString) as ExportData
  } catch {
    throw new Error('Le fichier sélectionné n\'est pas un JSON valide.')
  }

  if (!data.metadata?.tables || typeof data.metadata.tables !== 'object') {
    throw new Error('Format de fichier invalide : métadonnées manquantes.')
  }

  // Validate that at least one known table has data
  const hasKnownTable = TABLE_NAMES.some(t => Array.isArray(data[t]))
  if (!hasKnownTable) {
    throw new Error('Aucune donnée reconnue dans le fichier.')
  }

  const allowedColumns = getAllowedColumns()

  // Fetch existing records OUTSIDE write() to avoid WatermelonDB deadlock
  const existingRecords: Model[] = []
  for (const tableName of TABLE_NAMES) {
    const records = await database.get(tableName).query().fetch()
    existingRecords.push(...records)
  }

  await database.write(async () => {
    const ops: Model[] = existingRecords.map(r => r.prepareDestroyPermanently())

    for (const tableName of TABLE_NAMES) {
      const rows = (data[tableName] ?? []) as Record<string, unknown>[]
      const allowed = allowedColumns[tableName]
      if (!allowed) continue

      for (const raw of rows) {
        // Filter out unknown columns
        const filtered: Record<string, unknown> = {}
        for (const key of Object.keys(raw)) {
          if (allowed.has(key)) {
            filtered[key] = raw[key]
          }
        }

        ops.push(
          database.get(tableName).prepareCreate(record => {
            Object.assign(
              (record as unknown as { _raw: Record<string, unknown> })._raw,
              filtered
            )
          })
        )
      }
    }

    await database.batch(...ops)
  })
}
