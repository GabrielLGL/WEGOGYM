import {
  initialize,
  getSdkStatus,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  SdkAvailabilityStatus,
} from 'react-native-health-connect'
import type { WearableServiceInterface, WeightRecord, WorkoutRecord, SleepRecord, VitalsRecord } from './wearableService'
import { SleepStageType } from 'react-native-health-connect'

const PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Weight' as const },
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
  { accessType: 'read' as const, recordType: 'SleepSession' as const },
  { accessType: 'read' as const, recordType: 'RestingHeartRate' as const },
  { accessType: 'read' as const, recordType: 'HeartRateVariabilityRmssd' as const },
]

export class HealthConnectService implements WearableServiceInterface {
  private initialized = false

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      const result = await initialize()
      if (__DEV__) console.log('[HealthConnect] initialize result:', result)
      this.initialized = result
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const status = await getSdkStatus()
      if (__DEV__) console.log('[HealthConnect] SDK status:', status, '(3 = available)')
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return false
      await this.ensureInitialized()
      return this.initialized
    } catch (e) {
      if (__DEV__) console.warn('[HealthConnect] isAvailable error:', e)
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      await this.ensureInitialized()

      // Check already granted permissions first
      const alreadyGranted = await getGrantedPermissions()
      if (__DEV__) console.log('[HealthConnect] Already granted:', alreadyGranted.length, alreadyGranted)

      const granted = await requestPermission(PERMISSIONS)
      if (__DEV__) console.log('[HealthConnect] requestPermission result:', granted.length, granted)
      return granted.length > 0
    } catch (e) {
      if (__DEV__) console.warn('[HealthConnect] Permission request failed:', e)
      return false
    }
  }

  async hasPermissions(): Promise<boolean> {
    try {
      await this.ensureInitialized()
      // Health Connect ne fournit pas de check direct des permissions.
      // On tente une lecture minimale pour vérifier.
      await readRecords('Weight', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 1000).toISOString(),
          endTime: new Date().toISOString(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  async fetchWeightRecords(from: Date, to: Date): Promise<WeightRecord[]> {
    await this.ensureInitialized()

    const { records } = await readRecords('Weight', {
      timeRangeFilter: {
        operator: 'between',
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
    })

    return records.map((record) => ({
      weightKg: record.weight.inKilograms,
      timestamp: new Date(record.time).getTime(),
      source: 'health_connect' as const,
    }))
  }

  async fetchWorkoutRecords(from: Date, to: Date): Promise<WorkoutRecord[]> {
    await this.ensureInitialized()

    const { records } = await readRecords('ExerciseSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
    })

    return records.map((record) => {
      const startMs = new Date(record.startTime).getTime()
      const endMs = new Date(record.endTime).getTime()
      return {
        startTime: startMs,
        endTime: endMs,
        durationMinutes: Math.round((endMs - startMs) / 60000),
        activityType: String(record.exerciseType ?? 'unknown'),
        source: 'health_connect' as const,
      }
    })
  }

  async fetchSleepRecords(from: Date, to: Date): Promise<SleepRecord[]> {
    await this.ensureInitialized()

    const { records } = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: from.toISOString(),
        endTime: to.toISOString(),
      },
    })

    return records.map((record) => {
      const startMs = new Date(record.startTime).getTime()
      const endMs = new Date(record.endTime).getTime()
      const totalMin = Math.round((endMs - startMs) / 60000)

      // Aggregate stage durations
      let deepMin = 0
      let lightMin = 0
      let remMin = 0
      let awakeMin = 0
      let hasStages = false

      if (record.stages && record.stages.length > 0) {
        hasStages = true
        for (const stage of record.stages) {
          const stageMs = new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()
          const stageMin = Math.round(stageMs / 60000)
          switch (stage.stage) {
            case SleepStageType.DEEP:
              deepMin += stageMin
              break
            case SleepStageType.LIGHT:
            case SleepStageType.SLEEPING:
              lightMin += stageMin
              break
            case SleepStageType.REM:
              remMin += stageMin
              break
            case SleepStageType.AWAKE:
            case SleepStageType.OUT_OF_BED:
              awakeMin += stageMin
              break
          }
        }
      }

      // Actual sleep = sum of sleep stages (more accurate than total - awake)
      const actualSleepMin = hasStages ? (deepMin + lightMin + remMin) : totalMin

      return {
        startTime: startMs,
        endTime: endMs,
        durationMinutes: actualSleepMin,
        deepMinutes: hasStages ? deepMin : null,
        lightMinutes: hasStages ? lightMin : null,
        remMinutes: hasStages ? remMin : null,
        awakeMinutes: hasStages ? awakeMin : null,
        source: 'health_connect' as const,
      }
    })
  }

  async fetchVitals(from: Date, to: Date): Promise<VitalsRecord[]> {
    await this.ensureInitialized()

    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: from.toISOString(),
      endTime: to.toISOString(),
    }

    // Fetch both in parallel
    const [hrResult, hrvResult] = await Promise.all([
      readRecords('RestingHeartRate', { timeRangeFilter }).catch(() => ({ records: [] })),
      readRecords('HeartRateVariabilityRmssd', { timeRangeFilter }).catch(() => ({ records: [] })),
    ])

    // Group by day — one VitalsRecord per day
    const byDay = new Map<string, VitalsRecord>()

    for (const record of hrResult.records) {
      const dayKey = new Date(record.time).toISOString().slice(0, 10)
      const existing = byDay.get(dayKey)
      if (existing) {
        existing.restingHr = record.beatsPerMinute
      } else {
        byDay.set(dayKey, {
          timestamp: new Date(record.time).getTime(),
          restingHr: record.beatsPerMinute,
          hrvRmssd: null,
          source: 'health_connect',
        })
      }
    }

    for (const record of hrvResult.records) {
      const dayKey = new Date(record.time).toISOString().slice(0, 10)
      const existing = byDay.get(dayKey)
      if (existing) {
        existing.hrvRmssd = record.heartRateVariabilityMillis
      } else {
        byDay.set(dayKey, {
          timestamp: new Date(record.time).getTime(),
          restingHr: null,
          hrvRmssd: record.heartRateVariabilityMillis,
          source: 'health_connect',
        })
      }
    }

    return Array.from(byDay.values())
  }
}
