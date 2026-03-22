import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import User from '../model/models/User'
import BodyMeasurement from '../model/models/BodyMeasurement'
import SleepRecordModel from '../model/models/SleepRecord'
import DailyVitals from '../model/models/DailyVitals'
import WearableSyncLog from '../model/models/WearableSyncLog'
import { getWearableService, WEARABLE_PROVIDER } from './wearableService'
import type { WearableServiceInterface } from './wearableService'

const SYNC_COOLDOWN_MS = 30 * 60 * 1000 // 30 minutes
const BACKFILL_DAYS = 30

export interface SyncResult {
  status: 'success' | 'error' | 'skipped'
  recordsSynced: number
}

/**
 * Check if a sync is needed (cooldown not elapsed)
 */
function isSyncNeeded(user: User): boolean {
  if (!user.wearableProvider) return false
  const lastSync = user.wearableLastSyncAt
  if (!lastSync) return true
  const elapsed = Date.now() - new Date(lastSync).getTime()
  return elapsed >= SYNC_COOLDOWN_MS
}

/** Day boundaries for deduplication */
function getDayBounds(timestamp: number): { start: number; end: number } {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  const start = d.getTime()
  d.setHours(23, 59, 59, 999)
  return { start, end: d.getTime() }
}

/** Sync weight records → body_measurements */
async function syncWeights(service: WearableServiceInterface, from: Date, to: Date): Promise<number> {
  const weights = await service.fetchWeightRecords(from, to)
  if (__DEV__) console.log(`[WearableSync] Fetched ${weights.length} weight records`)
  let count = 0

  if (weights.length > 0) {
    await database.write(async () => {
      const collection = database.get<BodyMeasurement>('body_measurements')
      for (const w of weights) {
        const { start, end } = getDayBounds(w.timestamp)
        const existing = await collection.query(
          Q.where('date', Q.gte(start)),
          Q.where('date', Q.lte(end))
        ).fetchCount()

        if (existing === 0) {
          await collection.create(m => {
            m.date = w.timestamp
            m.weight = w.weightKg
          })
          count++
        }
      }
    })
  }

  return count
}

/**
 * Sync sleep records → sleep_records
 * Dedup: keep longest session per 24h period (00h-00h based on end time).
 * Sessions < 3h stored but won't count for sleep score (handled by helpers).
 */
async function syncSleep(service: WearableServiceInterface, from: Date, to: Date): Promise<number> {
  const sleepRecords = await service.fetchSleepRecords(from, to)
  if (__DEV__) console.log(`[WearableSync] Fetched ${sleepRecords.length} sleep records`)
  let count = 0

  if (sleepRecords.length === 0) return 0

  // Group by day (based on end time = wake time)
  const byDay = new Map<string, typeof sleepRecords[0]>()
  for (const s of sleepRecords) {
    const dayKey = new Date(s.endTime).toISOString().slice(0, 10)
    const existing = byDay.get(dayKey)
    if (!existing || s.durationMinutes > existing.durationMinutes) {
      byDay.set(dayKey, s)
    }
  }

  await database.write(async () => {
    const collection = database.get<SleepRecordModel>('sleep_records')
    for (const s of byDay.values()) {
      const { start, end } = getDayBounds(s.endTime)
      const existing = await collection.query(
        Q.where('date', Q.gte(start)),
        Q.where('date', Q.lte(end))
      ).fetchCount()

      if (existing === 0) {
        await collection.create(r => {
          r.date = s.endTime
          r.durationMinutes = s.durationMinutes
          r.deepMinutes = s.deepMinutes
          r.lightMinutes = s.lightMinutes
          r.remMinutes = s.remMinutes
          r.awakeMinutes = s.awakeMinutes
          r.source = s.source
        })
        count++
      }
    }
  })

  return count
}

/** Sync vitals (resting HR, HRV) → daily_vitals */
async function syncVitals(service: WearableServiceInterface, from: Date, to: Date): Promise<number> {
  const vitals = await service.fetchVitals(from, to)
  if (__DEV__) console.log(`[WearableSync] Fetched ${vitals.length} vitals records`)
  let count = 0

  if (vitals.length === 0) return 0

  await database.write(async () => {
    const collection = database.get<DailyVitals>('daily_vitals')
    for (const v of vitals) {
      const { start, end } = getDayBounds(v.timestamp)
      const existing = await collection.query(
        Q.where('date', Q.gte(start)),
        Q.where('date', Q.lte(end))
      ).fetchCount()

      if (existing === 0) {
        await collection.create(r => {
          r.date = v.timestamp
          r.restingHr = v.restingHr
          r.hrvRmssd = v.hrvRmssd
          r.source = v.source
        })
        count++
      }
    }
  })

  return count
}

/**
 * Perform a full wearable sync (weight + sleep + vitals).
 * @param forceBackfill — if true, ignore cooldown and sync from 30 days ago (used after granting new permissions)
 */
export async function performWearableSync(user: User, forceBackfill = false): Promise<SyncResult> {
  if (!forceBackfill && !isSyncNeeded(user)) {
    return { status: 'skipped', recordsSynced: 0 }
  }

  try {
    const service = await getWearableService()
    if (!service) return { status: 'skipped', recordsSynced: 0 }

    // On force backfill : purge sleep/vitals existants pour re-syncer proprement
    if (forceBackfill) {
      await database.write(async () => {
        const oldSleep = await database.get<SleepRecordModel>('sleep_records').query().fetch()
        const oldVitals = await database.get<DailyVitals>('daily_vitals').query().fetch()
        const batch = [
          ...oldSleep.map(r => r.prepareDestroyPermanently()),
          ...oldVitals.map(r => r.prepareDestroyPermanently()),
        ]
        if (batch.length > 0) await database.batch(...batch)
      })
    }

    const lastSync = forceBackfill ? null : user.wearableLastSyncAt
    const from = lastSync ? new Date(lastSync) : new Date(Date.now() - BACKFILL_DAYS * 86400000)
    const to = new Date()

    // Fetch all data types in parallel
    const [weightCount, sleepCount, vitalsCount] = await Promise.all([
      syncWeights(service, from, to).catch(() => 0),
      syncSleep(service, from, to).catch(() => 0),
      syncVitals(service, from, to).catch(() => 0),
    ])

    const totalSynced = weightCount + sleepCount + vitalsCount

    await database.write(async () => {
      await database.get<WearableSyncLog>('wearable_sync_logs').create(log => {
        log.syncAt = new Date()
        log.provider = WEARABLE_PROVIDER ?? 'unknown'
        log.status = 'success'
        log.recordsSynced = totalSynced
      })

      await user.update(u => {
        u.wearableLastSyncAt = new Date()
      })
    })

    if (__DEV__) console.log(`[WearableSync] Done: ${weightCount} weights, ${sleepCount} sleep, ${vitalsCount} vitals`)

    return { status: 'success', recordsSynced: totalSynced }
  } catch (error) {
    if (__DEV__) console.error('[WearableSync] Sync error:', error)

    try {
      await database.write(async () => {
        await database.get<WearableSyncLog>('wearable_sync_logs').create(log => {
          log.syncAt = new Date()
          log.provider = WEARABLE_PROVIDER ?? 'unknown'
          log.status = 'error'
          log.errorMessage = error instanceof Error ? error.message : 'Unknown error'
        })
      })
    } catch {
      // Ignore logging error
    }

    return { status: 'error', recordsSynced: 0 }
  }
}
