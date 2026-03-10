/**
 * SessionExercise — Jointure entre Session et Exercise avec les paramètres cibles
 *
 * Champs superset/circuit :
 * - supersetId   : identifiant partagé entre les exercices d'un même groupe (null = pas de groupe)
 * - supersetType : 'superset' (alterner les exercices) ou 'circuit' (enchaîner sans repos)
 * - supersetPosition : ordre de l'exercice dans le groupe (0-based)
 *
 * Les exercices avec le même supersetId forment un bloc visuel dans SessionDetailScreen
 * et sont exécutés ensemble dans WorkoutScreen (rest timer seulement après un round complet).
 */

import { Model, Relation } from '@nozbe/watermelondb'
import { field, text, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import type Session from './Session'
import type Exercise from './Exercise'

export default class SessionExercise extends Model {
  static table = 'session_exercises'
  static associations = {
    sessions: { type: 'belongs_to', key: 'session_id' },
    exercises: { type: 'belongs_to', key: 'exercise_id' },
  } as const

  @field('position') position!: number
  @field('sets_target') setsTarget!: number | null
  @field('sets_target_max') setsTargetMax!: number | null
  @text('reps_target') repsTarget!: string | null
  @field('weight_target') weightTarget!: number | null
  @text('superset_id') supersetId!: string | null
  @text('superset_type') supersetType!: string | null
  @field('superset_position') supersetPosition!: number | null
  @text('notes') notes!: string | null
  @field('rest_time') restTime!: number | null

  @relation('sessions', 'session_id') session!: Relation<Session>
  @relation('exercises', 'exercise_id') exercise!: Relation<Exercise>
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}