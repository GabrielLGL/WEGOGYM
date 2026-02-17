import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 14, // <--- ON PASSE EN VERSION 14
  tables: [
    tableSchema({
      name: 'programs',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'position', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sessions',
      columns: [
        { name: 'program_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'position', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'session_exercises',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
        { name: 'sets_target', type: 'number', isOptional: true },
        { name: 'reps_target', type: 'string', isOptional: true },
        { name: 'weight_target', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'is_custom', type: 'boolean' },
        { name: 'muscles', type: 'string', isOptional: true },
        { name: 'equipment', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    tableSchema({
      name: 'performance_logs',
      columns: [
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'sets', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
        name: 'users',
        columns: [
            {name: 'email', type: 'string'},
            {name: 'timer_enabled', type: 'boolean'},
            {name: 'rest_duration', type: 'number'}, // <--- NOUVELLE COLONNE POUR LA DURÉE
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'}
        ]
    }),
    tableSchema({
      name: 'histories',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'start_time', type: 'number' },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'sets',
      columns: [
        { name: 'history_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'weight', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'set_order', type: 'number' },
        { name: 'is_pr', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
