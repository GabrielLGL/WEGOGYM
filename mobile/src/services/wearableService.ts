import { Platform } from 'react-native'

// --- Types partagés ---

export interface WeightRecord {
  weightKg: number
  timestamp: number // unix ms
  source: 'health_connect' | 'healthkit'
}

export interface WorkoutRecord {
  startTime: number
  endTime: number
  durationMinutes: number
  caloriesBurned?: number
  activityType: string
  source: 'health_connect' | 'healthkit'
}

export interface WearableServiceInterface {
  /** Vérifie si le provider est disponible sur cette plateforme */
  isAvailable(): Promise<boolean>

  /** Demande les permissions de lecture */
  requestPermissions(): Promise<boolean>

  /** Vérifie si les permissions sont déjà accordées */
  hasPermissions(): Promise<boolean>

  /** Importe les pesées depuis la période donnée */
  fetchWeightRecords(from: Date, to: Date): Promise<WeightRecord[]>

  /** Importe les séances sport depuis la période donnée */
  fetchWorkoutRecords(from: Date, to: Date): Promise<WorkoutRecord[]>
}

// --- Sélection automatique par plateforme ---

export type WearableProvider = 'health_connect' | 'healthkit' | null

function getProvider(): WearableProvider {
  if (Platform.OS === 'android') return 'health_connect'
  if (Platform.OS === 'ios') return 'healthkit'
  return null
}

export const WEARABLE_PROVIDER: WearableProvider = getProvider()

let _service: WearableServiceInterface | null = null

export async function getWearableService(): Promise<WearableServiceInterface | null> {
  if (_service) return _service

  if (Platform.OS === 'android') {
    const { HealthConnectService } = await import('./healthConnectService')
    _service = new HealthConnectService()
    return _service
  }

  if (Platform.OS === 'ios') {
    const { HealthKitService } = await import('./healthKitService')
    _service = new HealthKitService()
    return _service
  }

  return null
}
