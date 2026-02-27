import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 25, // v25 : vibration_enabled + timer_sound_enabled
  tables: [
    tableSchema({
      name: 'programs',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'position', type: 'number', isOptional: true },
        { name: 'equipment', type: 'string', isOptional: true },
        { name: 'frequency', type: 'number', isOptional: true },
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
        { name: 'sets_target_max', type: 'number', isOptional: true },
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
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'animation_key', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
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
            {name: 'name', type: 'string', isOptional: true},
            {name: 'timer_enabled', type: 'boolean'},
            {name: 'vibration_enabled', type: 'boolean'},
            {name: 'timer_sound_enabled', type: 'boolean'},
            {name: 'rest_duration', type: 'number'},
            {name: 'onboarding_completed', type: 'boolean'},
            {name: 'user_level', type: 'string', isOptional: true},
            {name: 'user_goal', type: 'string', isOptional: true},
            {name: 'ai_provider', type: 'string', isOptional: true},
            {name: 'ai_api_key', type: 'string', isOptional: true},
            {name: 'total_xp', type: 'number'},
            {name: 'level', type: 'number'},
            {name: 'current_streak', type: 'number'},
            {name: 'best_streak', type: 'number'},
            {name: 'streak_target', type: 'number'},
            {name: 'total_tonnage', type: 'number'},
            {name: 'last_workout_week', type: 'string', isOptional: true},
            {name: 'total_prs', type: 'number'},
            {name: 'theme_mode', type: 'string', isOptional: true},
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'}
        ]
    }),
    tableSchema({
        name: 'user_badges',
        columns: [
            {name: 'badge_id', type: 'string'},
            {name: 'unlocked_at', type: 'number'},
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'},
        ]
    }),
    tableSchema({
        name: 'body_measurements',
        columns: [
            {name: 'date', type: 'number'},
            {name: 'weight', type: 'number', isOptional: true},
            {name: 'waist', type: 'number', isOptional: true},
            {name: 'hips', type: 'number', isOptional: true},
            {name: 'chest', type: 'number', isOptional: true},
            {name: 'arms', type: 'number', isOptional: true},
            {name: 'created_at', type: 'number'},
            {name: 'updated_at', type: 'number'},
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
