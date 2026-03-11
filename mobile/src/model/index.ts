import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { mySchema } from './schema'
import { migrations } from './migrations'

import Program from './models/Program'
import Session from './models/Session'
import History from './models/History'
import Set from './models/Set'
import Exercise from './models/Exercise'
import User from './models/User'
import SessionExercise from './models/SessionExercise'
import PerformanceLog from './models/PerformanceLog'
import BodyMeasurement from './models/BodyMeasurement'
import UserBadge from './models/UserBadge'
import ProgressPhoto from './models/ProgressPhoto'
import FriendSnapshot from './models/FriendSnapshot'
import WearableSyncLog from './models/WearableSyncLog'

const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations,
  // JSI désactivé : incompatible avec Bridgeless (New Architecture Expo 52).
  // WatermelonDB 0.28.x utilise l'ancienne bridge registration (non-TurboModule) —
  // elle ne fonctionne pas en mode Bridgeless (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED).
  // L'adapteur async est utilisé à la place — performance correcte pour ce projet.
  jsi: false,
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
    PerformanceLog,
    BodyMeasurement,
    UserBadge,
    ProgressPhoto,
    FriendSnapshot,
    WearableSyncLog,
  ],
})