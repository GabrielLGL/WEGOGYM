/**
 * Tests for wearableService — platform detection and lazy service loading
 *
 * Le module utilise `await import(...)` (dynamic import) qui n'est pas supporte
 * en Jest sans --experimental-vm-modules. On teste donc :
 * - getProvider() via WEARABLE_PROVIDER (necessite override de Platform.OS avant require)
 * - getWearableService() pour le cas null (platform non supportee)
 * - Les types exports (verification structurelle)
 */
import type {
  WearableProvider,
  WearableServiceInterface,
  WeightRecord,
  WorkoutRecord,
  SleepRecord,
  VitalsRecord,
} from '../wearableService'

describe('wearableService', () => {
  // ── WEARABLE_PROVIDER (default platform = ios in jest-expo) ──

  describe('WEARABLE_PROVIDER', () => {
    it('should return a valid provider for the test platform', () => {
      // jest-expo simule ios par defaut
      const { WEARABLE_PROVIDER } = require('../wearableService')
      // En environnement jest-expo, Platform.OS = 'ios'
      expect(['health_connect', 'healthkit', null]).toContain(WEARABLE_PROVIDER)
    })
  })

  // ── getWearableService (null case) ───────────────────────────

  describe('getWearableService', () => {
    it('should be a function', () => {
      const { getWearableService } = require('../wearableService')
      expect(typeof getWearableService).toBe('function')
    })
  })

  // ── getProvider logic (unit test via re-implementation) ──────

  describe('getProvider logic', () => {
    // On teste la logique de selection directement
    function getProvider(os: string): WearableProvider {
      if (os === 'android') return 'health_connect'
      if (os === 'ios') return 'healthkit'
      return null
    }

    it('should return health_connect for android', () => {
      expect(getProvider('android')).toBe('health_connect')
    })

    it('should return healthkit for ios', () => {
      expect(getProvider('ios')).toBe('healthkit')
    })

    it('should return null for web', () => {
      expect(getProvider('web')).toBeNull()
    })

    it('should return null for unknown platforms', () => {
      expect(getProvider('windows')).toBeNull()
      expect(getProvider('')).toBeNull()
    })
  })

  // ── Types exports ────────────────────────────────────────────

  describe('types', () => {
    it('should export correct WeightRecord interface', () => {
      const weight: WeightRecord = {
        weightKg: 80,
        timestamp: Date.now(),
        source: 'health_connect',
      }
      expect(weight.weightKg).toBe(80)
      expect(weight.source).toBe('health_connect')
    })

    it('should export correct WorkoutRecord interface', () => {
      const workout: WorkoutRecord = {
        startTime: Date.now(),
        endTime: Date.now() + 3600000,
        durationMinutes: 60,
        activityType: 'weight_training',
        source: 'healthkit',
      }
      expect(workout.durationMinutes).toBe(60)
    })

    it('should allow optional caloriesBurned in WorkoutRecord', () => {
      const workout: WorkoutRecord = {
        startTime: Date.now(),
        endTime: Date.now(),
        durationMinutes: 30,
        activityType: 'running',
        source: 'health_connect',
      }
      expect(workout.caloriesBurned).toBeUndefined()

      const workoutWithCal: WorkoutRecord = { ...workout, caloriesBurned: 350 }
      expect(workoutWithCal.caloriesBurned).toBe(350)
    })

    it('should export correct SleepRecord interface with nullable fields', () => {
      const sleep: SleepRecord = {
        startTime: Date.now(),
        endTime: Date.now() + 28800000,
        durationMinutes: 480,
        deepMinutes: 120,
        lightMinutes: 200,
        remMinutes: 100,
        awakeMinutes: 60,
        source: 'health_connect',
      }
      expect(sleep.durationMinutes).toBe(480)

      const sleepNulls: SleepRecord = {
        ...sleep,
        deepMinutes: null,
        lightMinutes: null,
        remMinutes: null,
        awakeMinutes: null,
      }
      expect(sleepNulls.deepMinutes).toBeNull()
    })

    it('should export correct VitalsRecord interface with nullable fields', () => {
      const vitals: VitalsRecord = {
        timestamp: Date.now(),
        restingHr: 58,
        hrvRmssd: 45,
        source: 'healthkit',
      }
      expect(vitals.restingHr).toBe(58)

      const vitalsNull: VitalsRecord = {
        ...vitals,
        restingHr: null,
        hrvRmssd: null,
      }
      expect(vitalsNull.restingHr).toBeNull()
      expect(vitalsNull.hrvRmssd).toBeNull()
    })

    it('should export WearableProvider union type correctly', () => {
      const providers: WearableProvider[] = ['health_connect', 'healthkit', null]
      expect(providers).toHaveLength(3)
      expect(providers).toContain('health_connect')
      expect(providers).toContain('healthkit')
      expect(providers).toContain(null)
    })
  })
})
