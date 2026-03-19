/**
 * schema.ts — Schéma de la base de données WatermelonDB (SQLite)
 *
 * Version actuelle : 39
 *
 * Tables et relations principales :
 * - programs          : Programmes d'entraînement (nom, position, équipement)
 * - sessions          : Séances appartenant à un programme (program_id)
 * - session_exercises : Exercices d'une séance avec cibles (sets, reps, poids, repos, superset)
 * - exercises         : Catalogue d'exercices (nom, muscles, équipement, isCustom)
 * - histories         : Séances réalisées — soft-delete via deleted_at (start_time, end_time)
 * - sets              : Séries réelles effectuées (poids, reps, PR détecté)
 * - performance_logs  : Historique des cibles (pour calculer les charges via l'IA)
 * - users             : Préférences + gamification (XP, niveau, streak, thème, langue)
 * - user_badges       : Badges débloqués par l'utilisateur
 * - body_measurements : Mensurations corporelles (poids, tour de taille, etc.)
 * - progress_photos   : Photos de progression (front, side, back)
 *
 * IMPORTANT : Chaque @field/@text/@date dans un modèle DOIT avoir sa colonne ici et vice versa.
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
  version: 39, // v39 : set_type + rpe fields in sets table
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
        { name: 'superset_id', type: 'string', isOptional: true },
        { name: 'superset_type', type: 'string', isOptional: true },
        { name: 'superset_position', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'rest_time', type: 'number', isOptional: true },
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

            {name: 'total_xp', type: 'number'},
            {name: 'level', type: 'number'},
            {name: 'current_streak', type: 'number'},
            {name: 'best_streak', type: 'number'},
            {name: 'streak_target', type: 'number'},
            {name: 'total_tonnage', type: 'number'},
            {name: 'last_workout_week', type: 'string', isOptional: true},
            {name: 'total_prs', type: 'number'},
            {name: 'theme_mode', type: 'string', isOptional: true},
            {name: 'language_mode', type: 'string', isOptional: true},
            {name: 'tutorial_completed', type: 'boolean'},
            {name: 'reminders_enabled', type: 'boolean'},
            {name: 'reminder_days', type: 'string', isOptional: true},
            {name: 'reminder_hour', type: 'number'},
            {name: 'reminder_minute', type: 'number'},
            {name: 'disclaimer_accepted', type: 'boolean'},
            {name: 'cgu_version_accepted', type: 'string', isOptional: true},
            {name: 'friend_code', type: 'string', isOptional: true},
            {name: 'wearable_provider', type: 'string', isOptional: true},
            {name: 'wearable_sync_weight', type: 'boolean', isOptional: false},
            {name: 'wearable_last_sync_at', type: 'number', isOptional: true},
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
        name: 'progress_photos',
        columns: [
            {name: 'date', type: 'number'},
            {name: 'photo_uri', type: 'string'},
            {name: 'category', type: 'string', isOptional: true},
            {name: 'note', type: 'string', isOptional: true},
            {name: 'body_measurement_id', type: 'string', isOptional: true},
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
        { name: 'is_abandoned', type: 'boolean', isOptional: true },
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
        { name: 'set_type', type: 'string', isOptional: true },
        { name: 'rpe', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
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
      ]
    }),
    tableSchema({
      name: 'wearable_sync_logs',
      columns: [
        { name: 'sync_at', type: 'number' },
        { name: 'provider', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'records_synced', type: 'number', isOptional: true },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
