import { Model, Query, Relation } from '@nozbe/watermelondb'
import { field, date, text, relation, children, readonly } from '@nozbe/watermelondb/decorators'
import type Session from './Session'
import type Set from './Set'

export default class History extends Model {
  static table = 'histories'
  static associations = {
    sessions: { type: 'belongs_to', key: 'session_id' },
    sets: { type: 'has_many', foreignKey: 'history_id' },
  } as const

  @date('start_time') startTime!: Date
  @date('end_time') endTime!: Date | null
  @text('note') note!: string | null

  @field('session_id') sessionId!: string
  @relation('sessions', 'session_id') session!: Relation<Session>
  @children('sets') sets!: Query<Set>
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  @date('deleted_at') deletedAt!: Date | null
}