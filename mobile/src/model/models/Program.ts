/**
 * Program — Modèle WatermelonDB pour un programme d'entraînement
 *
 * Relation : Program (1:N) → Session (1:N) → SessionExercise
 *
 * La méthode duplicate() crée une copie profonde :
 * - Nouveau programme avec " (Copie)" suffixé au nom
 * - Toutes les sessions dupliquées avec leurs exercices
 * - Les groupes superset/circuit reçoivent de nouveaux IDs
 *   (via supersetIdMap) pour rester liés entre eux sans conflits
 */

import { Model, Q, Query } from '@nozbe/watermelondb'
import { text, field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import type Exercise from './Exercise'
import type Session from './Session'
import type SessionExercise from './SessionExercise'

export default class Program extends Model {
  static table = 'programs'
  static associations = {
    sessions: { type: 'has_many', foreignKey: 'program_id' },
  } as const

  @text('name') name!: string
  @field('position') position!: number | null
  @text('equipment') equipment!: string | null
  @field('frequency') frequency!: number | null
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  @children('sessions') sessions!: Query<Session>

  async duplicate() {
    const db = this.database

    // Reads outside write transaction
    const count = await db.get<Program>('programs').query().fetchCount()
    const originalSessions = await this.sessions.fetch()
    const sessionIds = originalSessions.map(s => s.id)

    const allSessionExos = sessionIds.length > 0
      ? await db.get<SessionExercise>('session_exercises')
          .query(Q.where('session_id', Q.oneOf(sessionIds)))
          .fetch()
      : []

    // Batch-fetch all referenced exercises
    const exerciseIds = [...new Set(allSessionExos.map(se => se.exercise.id))]
    const exercises = exerciseIds.length > 0
      ? await db.get<Exercise>('exercises')
          .query(Q.where('id', Q.oneOf(exerciseIds)))
          .fetch()
      : []
    const exerciseMap = new Map(exercises.map(e => [e.id, e]))

    // Group session exercises by session ID
    const exosBySession = new Map<string, SessionExercise[]>()
    for (const se of allSessionExos) {
      const list = exosBySession.get(se.session.id) ?? []
      list.push(se)
      exosBySession.set(se.session.id, list)
    }

    // Build all records with prepareCreate
    const batch: Model[] = []

    const newProgram = db.get<Program>('programs').prepareCreate(p => {
      p.name = `${this.name} (Copie)`
      p.position = count
      p.equipment = this.equipment
      p.frequency = this.frequency
    })
    batch.push(newProgram)

    for (const session of originalSessions) {
      const newSession = db.get<Session>('sessions').prepareCreate(s => {
        s.name = session.name
        s.position = session.position
        s.program.set(newProgram)
      })
      batch.push(newSession)

      const sessionExos = exosBySession.get(session.id) ?? []
      const supersetIdMap = new Map<string, string>()

      for (const se of sessionExos) {
        const exercise = exerciseMap.get(se.exercise.id)
        if (!exercise) continue

        let newSupersetId: string | null = null
        if (se.supersetId) {
          if (!supersetIdMap.has(se.supersetId)) {
            supersetIdMap.set(se.supersetId, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
          }
          newSupersetId = supersetIdMap.get(se.supersetId)!
        }

        batch.push(
          db.get<SessionExercise>('session_exercises').prepareCreate(newSE => {
            newSE.session.set(newSession)
            newSE.exercise.set(exercise)
            newSE.position = se.position
            newSE.setsTarget = se.setsTarget
            newSE.setsTargetMax = se.setsTargetMax
            newSE.repsTarget = se.repsTarget
            newSE.weightTarget = se.weightTarget
            newSE.supersetId = newSupersetId
            newSE.supersetType = se.supersetType ?? null
            newSE.supersetPosition = se.supersetPosition ?? null
            newSE.notes = se.notes
            newSE.restTime = se.restTime ?? null
          })
        )
      }
    }

    await db.write(async () => {
      await db.batch(...batch)
    })
  }
}
