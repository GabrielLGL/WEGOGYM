import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthObserver,
} from 'react-native-health'
import type { WearableServiceInterface, WeightRecord, WorkoutRecord, SleepRecord, VitalsRecord } from './wearableService'

const LBS_TO_KG = 0.453592

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
    write: [],
  },
}

function promisifyInit(): Promise<void> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(PERMISSIONS, (error: string) => {
      if (error) {
        reject(new Error(error))
      } else {
        resolve()
      }
    })
  })
}

export class HealthKitService implements WearableServiceInterface {
  private initialized = false

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await promisifyInit()
      this.initialized = true
    }
  }

  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((error: Object, available: boolean) => {
        resolve(!error && available)
      })
    })
  }

  async requestPermissions(): Promise<boolean> {
    try {
      await this.ensureInitialized()
      return true
    } catch {
      if (__DEV__) console.warn('[HealthKit] Permission request failed')
      return false
    }
  }

  async hasPermissions(): Promise<boolean> {
    // HealthKit ne permet pas de vérifier les permissions de lecture.
    // initHealthKit() ne fail pas si refusé — on tente une lecture test.
    try {
      await this.ensureInitialized()
      return true
    } catch {
      return false
    }
  }

  async fetchWeightRecords(from: Date, to: Date): Promise<WeightRecord[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      AppleHealthKit.getWeightSamples(
        {
          startDate: from.toISOString(),
          endDate: to.toISOString(),
          ascending: true,
        },
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(new Error(error))
            return
          }
          resolve(
            results.map((r) => ({
              weightKg: parseFloat((r.value * LBS_TO_KG).toFixed(1)),
              timestamp: new Date(r.startDate).getTime(),
              source: 'healthkit' as const,
            }))
          )
        }
      )
    })
  }

  async fetchWorkoutRecords(from: Date, to: Date): Promise<WorkoutRecord[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      AppleHealthKit.getSamples(
        {
          startDate: from.toISOString(),
          endDate: to.toISOString(),
          type: HealthObserver.Workout,
        },
        (error: string, results: HealthValue[]) => {
          if (error) {
            reject(new Error(error))
            return
          }
          resolve(
            results.map((r) => {
              const startMs = new Date(r.startDate).getTime()
              const endMs = new Date(r.endDate).getTime()
              return {
                startTime: startMs,
                endTime: endMs,
                durationMinutes: Math.round((endMs - startMs) / 60000),
                caloriesBurned: typeof r.value === 'number' ? r.value : undefined,
                activityType: 'workout',
                source: 'healthkit' as const,
              }
            })
          )
        }
      )
    })
  }

  // Stubs — implementation HealthKit en Phase iOS
  async fetchSleepRecords(_from: Date, _to: Date): Promise<SleepRecord[]> {
    return []
  }

  async fetchVitals(_from: Date, _to: Date): Promise<VitalsRecord[]> {
    return []
  }
}
