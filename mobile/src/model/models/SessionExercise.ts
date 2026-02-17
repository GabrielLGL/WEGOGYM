import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import type Session from './Session'
import type Exercise from './Exercise'

export default class SessionExercise extends Model {
  static table = 'session_exercises'
  static associations = {
    sessions: { type: 'belongs_to', key: 'session_id' },
    exercises: { type: 'belongs_to', key: 'exercise_id' },
  } as const

  @field('position') position!: number
  @field('sets_target') setsTarget?: number
  @field('reps_target') repsTarget?: string
  @field('weight_target') weightTarget?: number // <--- AJOUT DU POIDS

  @relation('sessions', 'session_id') session!: Relation<Session>
  @relation('exercises', 'exercise_id') exercise!: Relation<Exercise>
  
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}