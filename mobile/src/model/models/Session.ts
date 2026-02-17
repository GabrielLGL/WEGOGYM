import { Model, Relation, Query } from '@nozbe/watermelondb'
import { field, date, readonly, children, relation } from '@nozbe/watermelondb/decorators'
import type Program from './Program'
import type History from './History'
import type SessionExercise from './SessionExercise'

export default class Session extends Model {
  static table = 'sessions'
  static associations = {
    programs: { type: 'belongs_to', key: 'program_id' },
    histories: { type: 'has_many', foreignKey: 'session_id' },
    session_exercises: { type: 'has_many', foreignKey: 'session_id' },
  } as const

  @field('name') name!: string
  @field('position') position!: number // <--- AJOUT DU CHAMP POSITION
  @relation('programs', 'program_id') program!: Relation<Program>
  
  @children('histories') histories!: Query<History>
  @children('session_exercises') sessionExercises!: Query<SessionExercise>
  
  @readonly @date('created_at') createdAt!: Date
}