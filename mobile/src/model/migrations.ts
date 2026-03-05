import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations'

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
  ],
})
