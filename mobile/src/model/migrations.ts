import { schemaMigrations, addColumns, unsafeExecuteSql, createTable } from '@nozbe/watermelondb/Schema/migrations'

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
        unsafeExecuteSql('CREATE INDEX IF NOT EXISTS sets_created_at ON sets (created_at);'),
      ],
    },
    {
      toVersion: 35,
      steps: [
        addColumns({
          table: 'histories',
          columns: [
            { name: 'is_abandoned', type: 'boolean', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 36,
      steps: [
        createTable({
          name: 'progress_photos',
          columns: [
            { name: 'date', type: 'number' },
            { name: 'photo_uri', type: 'string' },
            { name: 'category', type: 'string', isOptional: true },
            { name: 'note', type: 'string', isOptional: true },
            { name: 'body_measurement_id', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 37,
      steps: [
        addColumns({
          table: 'users',
          columns: [{ name: 'friend_code', type: 'string', isOptional: true }],
        }),
        createTable({
          name: 'friend_snapshots',
          columns: [
            { name: 'friend_code', type: 'string' },
            { name: 'display_name', type: 'string' },
            { name: 'total_xp', type: 'number' },
            { name: 'level', type: 'number' },
            { name: 'current_streak', type: 'number' },
            { name: 'total_tonnage', type: 'number' },
            { name: 'total_prs', type: 'number' },
            { name: 'total_sessions', type: 'number' },
            { name: 'imported_at', type: 'number' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 38,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'wearable_provider', type: 'string', isOptional: true },
            { name: 'wearable_sync_weight', type: 'boolean' },
            { name: 'wearable_last_sync_at', type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'wearable_sync_logs',
          columns: [
            { name: 'sync_at', type: 'number' },
            { name: 'provider', type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'records_synced', type: 'number', isOptional: true },
            { name: 'error_message', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 39,
      steps: [
        addColumns({
          table: 'sets',
          columns: [
            { name: 'set_type', type: 'string', isOptional: true },
            { name: 'rpe', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 40,
      steps: [
        createTable({
          name: 'sleep_records',
          columns: [
            { name: 'date', type: 'number' },
            { name: 'duration_minutes', type: 'number' },
            { name: 'deep_minutes', type: 'number', isOptional: true },
            { name: 'light_minutes', type: 'number', isOptional: true },
            { name: 'rem_minutes', type: 'number', isOptional: true },
            { name: 'awake_minutes', type: 'number', isOptional: true },
            { name: 'source', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'daily_vitals',
          columns: [
            { name: 'date', type: 'number' },
            { name: 'resting_hr', type: 'number', isOptional: true },
            { name: 'hrv_rmssd', type: 'number', isOptional: true },
            { name: 'source', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 41,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'unit_mode', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 42,
      steps: [
        addColumns({
          table: 'exercises',
          columns: [
            { name: 'is_favorite', type: 'boolean', isOptional: true },
          ],
        }),
      ],
    },
  ],
})
