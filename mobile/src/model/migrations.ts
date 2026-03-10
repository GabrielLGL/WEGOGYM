import { schemaMigrations, addColumns, unsafeExecuteSql } from '@nozbe/watermelondb/Schema/migrations'

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 27,
      steps: [
        addColumns({
          table: 'session_exercises',
          columns: [
            { name: 'superset_id', type: 'string', isOptional: true },
            { name: 'superset_type', type: 'string', isOptional: true },
            { name: 'superset_position', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 28,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'tutorial_completed', type: 'boolean' },
          ],
        }),
      ],
    },
    {
      toVersion: 29,
      steps: [
        addColumns({
          table: 'session_exercises',
          columns: [
            { name: 'notes', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 30,
      steps: [
        addColumns({
          table: 'session_exercises',
          columns: [
            { name: 'rest_time', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 31,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'reminders_enabled', type: 'boolean' },
            { name: 'reminder_days', type: 'string', isOptional: true },
            { name: 'reminder_hour', type: 'number' },
            { name: 'reminder_minute', type: 'number' },
          ],
        }),
      ],
    },
    {
      // v32: ai_api_key removed from schema (column stays in SQLite, ignored by model)
      // Data already migrated to expo-secure-store via secureKeyStore.migrateKeyFromDB()
      toVersion: 32,
      steps: [],
    },
    {
      toVersion: 33,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'disclaimer_accepted', type: 'boolean' },
            { name: 'cgu_version_accepted', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 34,
      steps: [
        unsafeExecuteSql('CREATE INDEX IF NOT EXISTS sets_created_at ON sets (created_at)'),
      ],
    },
  ],
})
