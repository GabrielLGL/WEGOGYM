/**
 * Typed mock factories for WatermelonDB models in tests.
 *
 * Each factory returns a typed mock object cast to the real model type.
 * Overrides are type-checked against the mock shape, so field renames
 * in models will cause compile errors in tests — unlike raw `as any`.
 *
 * The `as unknown as RealModel` cast is centralized here instead of
 * scattered across 12 test files as `as any`.
 */
import type SessionExercise from '../../models/SessionExercise'
import type Session from '../../models/Session'
import type Program from '../../models/Program'
import type User from '../../models/User'
import type Exercise from '../../models/Exercise'
import type SetModel from '../../models/Set'
import type History from '../../models/History'
import type PerformanceLog from '../../models/PerformanceLog'
import type BodyMeasurement from '../../models/BodyMeasurement'
import type { Database } from '@nozbe/watermelondb'

// ---------------------------------------------------------------------------
// Mock method types (WatermelonDB Model base methods)
// ---------------------------------------------------------------------------

type MockModelMethods = {
  update: jest.Mock
  prepareUpdate: jest.Mock
  destroyPermanently: jest.Mock
  prepareDestroyPermanently: jest.Mock
}

function baseMethods(): MockModelMethods {
  return {
    update: jest.fn().mockImplementation(async (fn: (record: Record<string, unknown>) => void) => {
      fn({})
    }),
    prepareUpdate: jest.fn().mockImplementation((fn: (record: Record<string, unknown>) => void) => {
      const record: Record<string, unknown> = {}
      fn(record)
      return record
    }),
    destroyPermanently: jest.fn().mockResolvedValue(undefined),
    prepareDestroyPermanently: jest.fn().mockReturnValue({ type: 'destroy' }),
  }
}

// ---------------------------------------------------------------------------
// MockSessionExercise
// ---------------------------------------------------------------------------

type MockSessionExerciseFields = {
  id: string
  position: number
  setsTarget: number | null
  setsTargetMax: number | null
  repsTarget: string | null
  weightTarget: number | null
  supersetId: string | null
  supersetType: string | null
  supersetPosition: number | null
  notes: string | null
  restTime: number | null
  exercise: { id: string; fetch: jest.Mock }
  session: { id: string; fetch: jest.Mock }
}

export type MockSessionExercise = MockSessionExerciseFields & MockModelMethods

export function mockSessionExercise(
  overrides: Partial<MockSessionExerciseFields & MockModelMethods> = {},
): SessionExercise {
  const id = overrides.id ?? 'se-1'
  const mock: MockSessionExercise = {
    id,
    position: 0,
    setsTarget: 3,
    setsTargetMax: 0,
    repsTarget: '10',
    weightTarget: 60,
    supersetId: null,
    supersetType: null,
    supersetPosition: null,
    notes: null,
    restTime: null,
    exercise: {
      id: `ex-${id}`,
      fetch: jest.fn().mockResolvedValue({ id: `ex-${id}` }),
    },
    session: {
      id: 'sess-1',
      fetch: jest.fn().mockResolvedValue({ id: 'sess-1' }),
    },
    ...baseMethods(),
    ...overrides,
  }
  return mock as unknown as SessionExercise
}

// ---------------------------------------------------------------------------
// MockSession
// ---------------------------------------------------------------------------

type MockSessionFields = {
  id: string
  name: string
  position: number
  programId: string
  program: { id: string; fetch: jest.Mock; set: jest.Mock }
  sessionExercises: { fetch: jest.Mock }
}

export type MockSession = MockSessionFields & MockModelMethods

export function mockSession(
  overrides: Partial<MockSessionFields & MockModelMethods> = {},
): Session {
  const id = overrides.id ?? 'sess-1'
  const programId = overrides.programId ?? 'prog-1'
  const mock: MockSession = {
    id,
    name: 'Session 1',
    position: 0,
    programId,
    program: {
      id: programId,
      fetch: jest.fn().mockResolvedValue({ id: programId }),
      set: jest.fn(),
    },
    sessionExercises: {
      fetch: jest.fn().mockResolvedValue([]),
    },
    ...baseMethods(),
    ...overrides,
  }
  return mock as unknown as Session
}

// ---------------------------------------------------------------------------
// MockProgram
// ---------------------------------------------------------------------------

type MockProgramFields = {
  id: string
  name: string
  position: number | null
  equipment: string | null
  frequency: number | null
  sessions: { fetch: jest.Mock }
  duplicate: jest.Mock
}

export type MockProgram = MockProgramFields & MockModelMethods

export function mockProgram(
  overrides: Partial<MockProgramFields & MockModelMethods> = {},
): Program {
  const id = overrides.id ?? 'prog-1'
  const mock: MockProgram = {
    id,
    name: 'Program 1',
    position: 0,
    equipment: null,
    frequency: null,
    sessions: { fetch: jest.fn().mockResolvedValue([]) },
    duplicate: jest.fn().mockResolvedValue(undefined),
    ...baseMethods(),
    ...overrides,
  }
  return mock as unknown as Program
}

// ---------------------------------------------------------------------------
// MockUser
// ---------------------------------------------------------------------------

type MockUserFields = {
  id: string
  email: string
  timerEnabled: boolean
  vibrationEnabled: boolean
  timerSoundEnabled: boolean
  restDuration: number
  onboardingCompleted: boolean
  userLevel: string | null
  userGoal: string | null
  name: string | null
  aiProvider: string | null
  totalXp: number
  level: number
  currentStreak: number
  bestStreak: number
  streakTarget: number
  totalTonnage: number
  lastWorkoutWeek: string | null
  totalPrs: number
  themeMode: string | null
  languageMode: string | null
  tutorialCompleted: boolean
  disclaimerAccepted: boolean
  cguVersionAccepted: string | null
  remindersEnabled: boolean
  reminderDays: string | null
  reminderHour: number
  reminderMinute: number
}

export type MockUser = MockUserFields & MockModelMethods

export function mockUser(
  overrides: Partial<MockUserFields & MockModelMethods> = {},
): User {
  const mock: MockUser = {
    id: 'user-1',
    email: '',
    timerEnabled: true,
    vibrationEnabled: true,
    timerSoundEnabled: true,
    restDuration: 60,
    onboardingCompleted: false,
    userLevel: null,
    userGoal: null,
    name: null,
    aiProvider: 'offline',
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    bestStreak: 0,
    streakTarget: 3,
    totalTonnage: 0,
    lastWorkoutWeek: null,
    totalPrs: 0,
    themeMode: null,
    languageMode: null,
    tutorialCompleted: false,
    disclaimerAccepted: false,
    cguVersionAccepted: null,
    remindersEnabled: false,
    reminderDays: null,
    reminderHour: 18,
    reminderMinute: 0,
    ...baseMethods(),
    ...overrides,
  }
  return mock as unknown as User
}

// ---------------------------------------------------------------------------
// MockExercise
// ---------------------------------------------------------------------------

type MockExerciseFields = {
  id: string
  name: string
  isCustom: boolean
  muscles: string[]
  _muscles: string
  equipment?: string
  notes?: string
  animationKey?: string
  description?: string
}

export type MockExercise = MockExerciseFields & MockModelMethods

export function mockExercise(
  overrides: Partial<MockExerciseFields & MockModelMethods> = {},
): Exercise {
  const muscles = overrides.muscles ?? []
  const mock: MockExercise = {
    id: 'exo-1',
    name: 'Exercise 1',
    isCustom: false,
    muscles,
    _muscles: JSON.stringify(muscles),
    equipment: undefined,
    notes: undefined,
    animationKey: undefined,
    description: undefined,
    ...baseMethods(),
    ...overrides,
  }
  return mock as unknown as Exercise
}

// ---------------------------------------------------------------------------
// MockSet
// ---------------------------------------------------------------------------

type MockSetFields = {
  id: string
  weight: number
  reps: number
  setOrder: number
  isPr: boolean
  historyId: string
  exerciseId: string
  history: { id: string }
  exercise: { id: string }
  createdAt: Date
}

export type MockSet = MockSetFields

export function mockSet(
  overrides: Partial<MockSetFields> = {},
): SetModel {
  const mock: MockSet = {
    id: 'set-1',
    weight: 0,
    reps: 0,
    setOrder: 1,
    isPr: false,
    historyId: 'h-1',
    exerciseId: 'exo-1',
    createdAt: new Date(),
    history: { id: overrides.historyId ?? 'h-1' },
    exercise: { id: overrides.exerciseId ?? 'exo-1' },
    ...overrides,
  }
  return mock as unknown as SetModel
}

// ---------------------------------------------------------------------------
// MockHistory
// ---------------------------------------------------------------------------

type MockHistoryFields = {
  id: string
  startTime: Date
  endTime: Date | null
  note: string | null
  sessionId: string
  session: { id: string }
  deletedAt: Date | null
  isAbandoned: boolean
}

export type MockHistory = MockHistoryFields

export function mockHistory(
  overrides: Partial<MockHistoryFields> = {},
): History {
  const mock: MockHistory = {
    id: 'h-1',
    startTime: new Date(),
    endTime: null,
    note: null,
    sessionId: 'sess-1',
    session: { id: overrides.sessionId ?? 'sess-1' },
    deletedAt: null,
    isAbandoned: false,
    ...overrides,
  }
  return mock as unknown as History
}

// ---------------------------------------------------------------------------
// MockDatabase
// ---------------------------------------------------------------------------

type MockDatabaseFields = {
  get: jest.Mock
  write: jest.Mock
  batch: jest.Mock
}

export type MockDatabase = MockDatabaseFields

export function mockDatabase(
  overrides: Partial<MockDatabaseFields> = {},
): Database {
  const mock: MockDatabase = {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
    write: jest.fn(async (fn: () => Promise<void>) => fn()),
    batch: jest.fn(),
    ...overrides,
  }
  return mock as unknown as Database
}

// ---------------------------------------------------------------------------
// MockPerformanceLog
// ---------------------------------------------------------------------------

type MockPerformanceLogFields = {
  id: string
  sets: number
  weight: number
  reps: number
  exercise: { id: string; fetch: jest.Mock }
  createdAt: Date
}

export type MockPerformanceLog = MockPerformanceLogFields

export function mockPerformanceLog(
  overrides: Partial<MockPerformanceLogFields> = {},
): PerformanceLog {
  const mock: MockPerformanceLog = {
    id: 'pl-1',
    sets: 3,
    weight: 60,
    reps: 10,
    exercise: {
      id: 'exo-1',
      fetch: jest.fn().mockResolvedValue({ id: 'exo-1' }),
    },
    createdAt: new Date(),
    ...overrides,
  }
  return mock as unknown as PerformanceLog
}

// ---------------------------------------------------------------------------
// MockBodyMeasurement
// ---------------------------------------------------------------------------

type MockBodyMeasurementFields = {
  id: string
  date: number
  weight: number | null
  waist: number | null
  hips: number | null
  chest: number | null
  arms: number | null
  createdAt: Date
}

export type MockBodyMeasurement = MockBodyMeasurementFields

export function mockBodyMeasurement(
  overrides: Partial<MockBodyMeasurementFields> = {},
): BodyMeasurement {
  const mock: MockBodyMeasurement = {
    id: 'bm-1',
    date: Date.now(),
    weight: 80,
    waist: null,
    hips: null,
    chest: null,
    arms: null,
    createdAt: new Date(),
    ...overrides,
  }
  return mock as unknown as BodyMeasurement
}
