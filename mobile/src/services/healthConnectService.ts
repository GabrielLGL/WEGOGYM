import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect'
import type { WearableServiceInterface, WeightRecord, WorkoutRecord } from './wearableService'

const PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Weight' as const },
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
]

export class HealthConnectService implements WearableServiceInterface {
  private initialized = false

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      const result = await initialize()
      this.initialized = result
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized()
      return this.initialized
    } catch {
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      await this.ensureInitialized()
      const granted = await requestPermission(PERMISSIONS)
      return granted.length === PERMISSIONS.length
    } catch {
      if (__DEV__) console.warn('[HealthConnect] Permission request failed')
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
}
