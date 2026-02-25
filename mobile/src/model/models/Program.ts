import { Model, Q, Query } from '@nozbe/watermelondb'
import { text, field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import type Session from './Session'
import type SessionExercise from './SessionExercise'

export default class Program extends Model {
  static table = 'programs'
  static associations = {
    sessions: { type: 'has_many', foreignKey: 'program_id' },
  } as const

  @text('name') name!: string
  @field('position') position?: number
  @text('equipment') equipment!: string | null
  @field('frequency') frequency!: number | null
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  @children('sessions') sessions!: Query<Session>

  async duplicate() {
    const db = this.database

    await db.write(async () => {
      const count = await db.get<Program>('programs').query().fetchCount()

      const newProgram = await db.get<Program>('programs').create(p => {
        p.name = `${this.name} (Copie)`
        p.position = count
        p.equipment = this.equipment
        p.frequency = this.frequency
      })

      const originalSessions = await this.sessions.fetch()

      for (const session of originalSessions) {
        const newSession = await db.get<Session>('sessions').create(s => {
          s.name = session.name
          s.position = session.position
          s.program.set(newProgram)
        })

        const sessionExos = await db
          .get<SessionExercise>('session_exercises')
          .query(Q.where('session_id', session.id))
          .fetch()

        for (const se of sessionExos) {
          const exercise = await se.exercise.fetch()
          if (exercise) {
            await db.get<SessionExercise>('session_exercises').create(newSE => {
              newSE.session.set(newSession)
              newSE.exercise.set(exercise)
              newSE.position = se.position
              newSE.setsTarget = se.setsTarget
              newSE.repsTarget = se.repsTarget
              newSE.weightTarget = se.weightTarget
            })
          }
        }
      }
    })
  }
}
