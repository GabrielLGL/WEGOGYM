/**
 * dataManagementUtils.ts — Gestion des données utilisateur (suppression totale)
 */

import { Q } from '@nozbe/watermelondb'
import * as FileSystem from 'expo-file-system'
import { database } from '../index'
import User from '../models/User'
import { cancelAllReminders } from '../../services/notificationService'

/**
 * Supprime toutes les données utilisateur (programmes, historiques, sets, etc.)
 * et réinitialise le profil utilisateur.
 *
 * @param user - L'instance User à réinitialiser (peut être null)
 *
 * @example
 * ```ts
 * await deleteAllData(user)
 * ```
 */
export async function deleteAllData(user: User | null): Promise<void> {
  await database.write(async () => {
    const programs = await database.get('programs').query().fetch()
    const sessions = await database.get('sessions').query().fetch()
    const sessionExercises = await database.get('session_exercises').query().fetch()
    const histories = await database.get('histories').query().fetch()
    const sets = await database.get('sets').query().fetch()
    const performanceLogs = await database.get('performance_logs').query().fetch()
    const bodyMeasurements = await database.get('body_measurements').query().fetch()
    const userBadges = await database.get('user_badges').query().fetch()
    const customExercises = await database.get('exercises').query(Q.where('is_custom', true)).fetch()
    const progressPhotos = await database.get('progress_photos').query().fetch()
    const friendSnapshots = await database.get('friend_snapshots').query().fetch()
    const wearableSyncLogs = await database.get('wearable_sync_logs').query().fetch()

    const allRecords = [
      ...programs,
      ...sessions,
      ...sessionExercises,
      ...histories,
      ...sets,
      ...performanceLogs,
      ...bodyMeasurements,
      ...userBadges,
      ...customExercises,
      ...progressPhotos,
      ...friendSnapshots,
      ...wearableSyncLogs,
    ]

    const batchOps = [
      ...allRecords.map(record => record.prepareDestroyPermanently()),
      ...(user ? [user.prepareUpdate(u => {
        u.name = null
        u.email = ''
        u.totalXp = 0
        u.level = 1
        u.currentStreak = 0
        u.bestStreak = 0
        u.totalTonnage = 0
        u.totalPrs = 0
        u.onboardingCompleted = false
        u.userLevel = null
        u.userGoal = null
        u.lastWorkoutWeek = null
        u.remindersEnabled = false
        u.reminderDays = null
        u.reminderHour = 18
        u.reminderMinute = 0
        u.tutorialCompleted = false
        u.aiProvider = null
        u.streakTarget = 3
        u.timerEnabled = true
        u.vibrationEnabled = true
        u.timerSoundEnabled = true
        u.restDuration = 90
        u.disclaimerAccepted = false
        u.cguVersionAccepted = null
      })] : []),
    ]
    await database.batch(...batchOps)
  })

  try { await cancelAllReminders() } catch (e) { if (__DEV__) console.warn('[deleteAllData] cancelAllReminders failed:', e) }

  // Delete export files from documentDirectory
  try {
    if (FileSystem.documentDirectory) {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
      const exportFiles = files.filter(f => f.startsWith('kore-export-') && f.endsWith('.json'))
      for (const file of exportFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`, { idempotent: true })
      }
    }
  } catch (e) { if (__DEV__) console.warn('[deleteAllData] file cleanup failed:', e) }
}
