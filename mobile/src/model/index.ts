import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { mySchema } from './schema'

import Program from './models/Program'
import Session from './models/Session'
import History from './models/History'
import Set from './models/Set'
import Exercise from './models/Exercise'
import User from './models/User'
import SessionExercise from './models/SessionExercise'
import PerformanceLog from './models/PerformanceLog'

const adapter = new SQLiteAdapter({
  schema: mySchema,
  jsi: true,
  onSetUpError: error => {
    if (__DEV__) console.error("Erreur chargement DB:", error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [
    Program,
    Session,
    History,
    Set,
    Exercise,
    User,
    SessionExercise,
    PerformanceLog
  ],
})