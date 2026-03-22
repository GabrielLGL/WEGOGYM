import { database } from './index'
import type { Model } from '@nozbe/watermelondb'
import type Program from './models/Program'
import type Session from './models/Session'
import type SessionExercise from './models/SessionExercise'
import type Exercise from './models/Exercise'
import type History from './models/History'
import type SetRecord from './models/Set'
import type PerformanceLog from './models/PerformanceLog'
import type BodyMeasurement from './models/BodyMeasurement'
import type User from './models/User'

// --- Types ---
type SetTuple = [weight: number, reps: number]

interface ExerciseDef {
  name: string
  setsTarget: number
  repsTarget: string
  weightTarget?: number
}

interface SessionDef {
  name: string
  position: number
  exercises: ExerciseDef[]
}

interface ProgramDef {
  name: string
  position: number
  sessions: SessionDef[]
}

interface WorkoutExercise {
  name: string
  sets: SetTuple[]
}

interface WorkoutDef {
  sessionName: string
  daysAgo: number
  durationMin: number
  note: string | null
  exercises: WorkoutExercise[]
}

interface MeasurementDef {
  daysAgo: number
  weight: number
  waist: number
  hips: number
  chest: number
  arms: number
}

// --- Programmes ---
const PROGRAMS: ProgramDef[] = [
  {
    name: 'Push Pull Legs',
    position: 0,
    sessions: [
      {
        name: 'Push', position: 0,
        exercises: [
          { name: 'Développé Couché Barre', setsTarget: 4, repsTarget: '10', weightTarget: 80 },
          { name: 'Développé Incliné Haltères', setsTarget: 3, repsTarget: '12', weightTarget: 30 },
          { name: 'Écartés Poulie', setsTarget: 3, repsTarget: '15' },
          { name: 'Développé Militaire', setsTarget: 4, repsTarget: '8', weightTarget: 50 },
          { name: 'Élévations Latérales', setsTarget: 3, repsTarget: '15', weightTarget: 12 },
          { name: 'Extensions Poulie Haute', setsTarget: 3, repsTarget: '12', weightTarget: 25 },
        ],
      },
      {
        name: 'Pull', position: 1,
        exercises: [
          { name: 'Tractions', setsTarget: 4, repsTarget: '8' },
          { name: 'Rowing Barre', setsTarget: 4, repsTarget: '10', weightTarget: 70 },
          { name: 'Tirage Poitrine', setsTarget: 3, repsTarget: '12', weightTarget: 55 },
          { name: 'Face Pull', setsTarget: 3, repsTarget: '15', weightTarget: 20 },
          { name: 'Curl Barre EZ', setsTarget: 3, repsTarget: '12', weightTarget: 30 },
          { name: 'Curl Marteau', setsTarget: 3, repsTarget: '10', weightTarget: 14 },
        ],
      },
      {
        name: 'Legs', position: 2,
        exercises: [
          { name: 'Squat Arrière', setsTarget: 5, repsTarget: '5', weightTarget: 100 },
          { name: 'Presse à Cuisses', setsTarget: 4, repsTarget: '12', weightTarget: 180 },
          { name: 'Leg Extension', setsTarget: 3, repsTarget: '15', weightTarget: 40 },
          { name: 'Soulevé de Terre Roumain', setsTarget: 4, repsTarget: '10', weightTarget: 80 },
          { name: 'Leg Curl Allongé', setsTarget: 3, repsTarget: '12', weightTarget: 35 },
          { name: 'Extensions Mollets Debout', setsTarget: 4, repsTarget: '15', weightTarget: 60 },
        ],
      },
    ],
  },
  {
    name: 'Full Body',
    position: 1,
    sessions: [
      {
        name: 'Full Body A', position: 0,
        exercises: [
          { name: 'Squat Arrière', setsTarget: 4, repsTarget: '8', weightTarget: 90 },
          { name: 'Développé Couché Barre', setsTarget: 4, repsTarget: '8', weightTarget: 75 },
          { name: 'Rowing Barre', setsTarget: 4, repsTarget: '8', weightTarget: 65 },
          { name: 'Développé Militaire', setsTarget: 3, repsTarget: '10', weightTarget: 40 },
          { name: 'Curl Haltères', setsTarget: 3, repsTarget: '12', weightTarget: 14 },
        ],
      },
      {
        name: 'Full Body B', position: 1,
        exercises: [
          { name: 'Soulevé de Terre', setsTarget: 4, repsTarget: '5', weightTarget: 120 },
          { name: 'Développé Incliné Haltères', setsTarget: 4, repsTarget: '10', weightTarget: 28 },
          { name: 'Tractions', setsTarget: 4, repsTarget: '8' },
          { name: 'Élévations Latérales', setsTarget: 3, repsTarget: '15', weightTarget: 10 },
          { name: 'Dips (Triceps focus)', setsTarget: 3, repsTarget: '10' },
        ],
      },
    ],
  },
  {
    name: 'Cardio & Abdos',
    position: 2,
    sessions: [
      {
        name: 'HIIT', position: 0,
        exercises: [
          { name: 'Tapis de Course', setsTarget: 1, repsTarget: '1' },
          { name: 'Burpees', setsTarget: 3, repsTarget: '15' },
          { name: 'Mountain Climbers', setsTarget: 3, repsTarget: '20' },
          { name: 'Corde à sauter', setsTarget: 3, repsTarget: '1' },
        ],
      },
      {
        name: 'Core', position: 1,
        exercises: [
          { name: 'Crunch', setsTarget: 4, repsTarget: '20' },
          { name: 'Relevé de jambes', setsTarget: 3, repsTarget: '15' },
          { name: 'Planche', setsTarget: 3, repsTarget: '1' },
          { name: 'Russian Twist', setsTarget: 3, repsTarget: '20', weightTarget: 10 },
          { name: 'Gainage Latéral', setsTarget: 3, repsTarget: '1' },
        ],
      },
    ],
  },
]

// --- Helpers pour générer un historique réaliste sur 6 mois ---

/** Arrondit au 0.5 le plus proche (ex: 77.3 → 77.5) */
const r = (v: number) => Math.round(v * 2) / 2

/** Simple random int [min, max] déterministe via seed */
let _seed = 42
const rand = (min: number, max: number) => {
  _seed = (_seed * 16807 + 0) % 2147483647
  return min + (_seed % (max - min + 1))
}

/** Génère des sets avec rampe ascendante réaliste */
const makeSets = (baseW: number, baseR: number, count: number): SetTuple[] => {
  const sets: SetTuple[] = []
  for (let i = 0; i < count; i++) {
    const w = r(baseW + (i * baseW * 0.03))
    const reps = Math.max(1, baseR - i)
    sets.push([w, reps])
  }
  return sets
}

/** Définitions de progression par exercice (poids de départ, reps, nb sets) */
interface ProgressDef {
  name: string
  startWeight: number
  reps: number
  sets: number
  weeklyGain: number // kg/semaine
}

const PUSH_PROG: ProgressDef[] = [
  { name: 'Développé Couché Barre', startWeight: 60, reps: 10, sets: 4, weeklyGain: 1.0 },
  { name: 'Développé Incliné Haltères', startWeight: 20, reps: 12, sets: 3, weeklyGain: 0.5 },
  { name: 'Écartés Poulie', startWeight: 10, reps: 15, sets: 3, weeklyGain: 0.3 },
  { name: 'Développé Militaire', startWeight: 35, reps: 8, sets: 4, weeklyGain: 0.8 },
  { name: 'Élévations Latérales', startWeight: 6, reps: 15, sets: 3, weeklyGain: 0.2 },
  { name: 'Extensions Poulie Haute', startWeight: 15, reps: 12, sets: 3, weeklyGain: 0.3 },
]

const PULL_PROG: ProgressDef[] = [
  { name: 'Tractions', startWeight: 0, reps: 6, sets: 4, weeklyGain: 0 },
  { name: 'Rowing Barre', startWeight: 50, reps: 10, sets: 4, weeklyGain: 0.8 },
  { name: 'Tirage Poitrine', startWeight: 40, reps: 12, sets: 3, weeklyGain: 0.5 },
  { name: 'Face Pull', startWeight: 12, reps: 15, sets: 3, weeklyGain: 0.3 },
  { name: 'Curl Barre EZ', startWeight: 20, reps: 12, sets: 3, weeklyGain: 0.4 },
  { name: 'Curl Marteau', startWeight: 8, reps: 10, sets: 3, weeklyGain: 0.2 },
]

const LEGS_PROG: ProgressDef[] = [
  { name: 'Squat Arrière', startWeight: 70, reps: 5, sets: 5, weeklyGain: 1.5 },
  { name: 'Presse à Cuisses', startWeight: 120, reps: 12, sets: 4, weeklyGain: 2.0 },
  { name: 'Leg Extension', startWeight: 25, reps: 15, sets: 3, weeklyGain: 0.5 },
  { name: 'Soulevé de Terre Roumain', startWeight: 50, reps: 10, sets: 4, weeklyGain: 1.2 },
  { name: 'Leg Curl Allongé', startWeight: 20, reps: 12, sets: 3, weeklyGain: 0.5 },
  { name: 'Extensions Mollets Debout', startWeight: 35, reps: 15, sets: 4, weeklyGain: 0.8 },
]

const FB_A_PROG: ProgressDef[] = [
  { name: 'Squat Arrière', startWeight: 65, reps: 8, sets: 4, weeklyGain: 1.0 },
  { name: 'Développé Couché Barre', startWeight: 55, reps: 8, sets: 4, weeklyGain: 0.8 },
  { name: 'Rowing Barre', startWeight: 45, reps: 8, sets: 4, weeklyGain: 0.7 },
  { name: 'Développé Militaire', startWeight: 30, reps: 10, sets: 3, weeklyGain: 0.5 },
  { name: 'Curl Haltères', startWeight: 8, reps: 12, sets: 3, weeklyGain: 0.2 },
]

const FB_B_PROG: ProgressDef[] = [
  { name: 'Soulevé de Terre', startWeight: 80, reps: 5, sets: 4, weeklyGain: 1.5 },
  { name: 'Développé Incliné Haltères', startWeight: 18, reps: 10, sets: 4, weeklyGain: 0.4 },
  { name: 'Tractions', startWeight: 0, reps: 6, sets: 4, weeklyGain: 0 },
  { name: 'Élévations Latérales', startWeight: 6, reps: 15, sets: 3, weeklyGain: 0.2 },
  { name: 'Dips (Triceps focus)', startWeight: 0, reps: 8, sets: 3, weeklyGain: 0 },
]

const HIIT_PROG: ProgressDef[] = [
  { name: 'Tapis de Course', startWeight: 0, reps: 1, sets: 1, weeklyGain: 0 },
  { name: 'Burpees', startWeight: 0, reps: 12, sets: 3, weeklyGain: 0 },
  { name: 'Mountain Climbers', startWeight: 0, reps: 15, sets: 3, weeklyGain: 0 },
  { name: 'Corde à sauter', startWeight: 0, reps: 1, sets: 3, weeklyGain: 0 },
]

const CORE_PROG: ProgressDef[] = [
  { name: 'Crunch', startWeight: 0, reps: 15, sets: 4, weeklyGain: 0 },
  { name: 'Relevé de jambes', startWeight: 0, reps: 12, sets: 3, weeklyGain: 0 },
  { name: 'Planche', startWeight: 0, reps: 1, sets: 3, weeklyGain: 0 },
  { name: 'Russian Twist', startWeight: 5, reps: 15, sets: 3, weeklyGain: 0.2 },
  { name: 'Gainage Latéral', startWeight: 0, reps: 1, sets: 3, weeklyGain: 0 },
]

const NOTES = [
  null, null, null, null, null, // majorité sans note
  'Bonne séance', 'Fatigue', 'Grosse énergie', 'Pas top, mal dormi',
  'Séance rapide mais efficace', 'Pump incroyable', null, null,
  'Focus sur la contraction', 'Dernière série difficile',
]

/**
 * Génère ~80 workouts sur 180 jours en suivant un cycle PPL principal
 * avec quelques Full Body et Cardio intercalés.
 */
function generateWorkouts(): WorkoutDef[] {
  _seed = 42 // reset seed pour résultats déterministes
  const workouts: WorkoutDef[] = []

  // Planning : PPL-rest-PPL-rest avec variantes
  // Cycle de 8 jours : Push-Pull-Legs-Rest-FB/HIIT-Push-Pull-Legs (puis rest 1-2j)
  const schedule: { session: string; prog: ProgressDef[] }[] = [
    { session: 'Push', prog: PUSH_PROG },
    { session: 'Pull', prog: PULL_PROG },
    { session: 'Legs', prog: LEGS_PROG },
  ]

  const extras: { session: string; prog: ProgressDef[] }[] = [
    { session: 'Full Body A', prog: FB_A_PROG },
    { session: 'Full Body B', prog: FB_B_PROG },
    { session: 'HIIT', prog: HIIT_PROG },
    { session: 'Core', prog: CORE_PROG },
  ]

  let day = 180 // commence il y a 180 jours
  let weekNum = 0
  let pplCycle = 0

  while (day > 0) {
    // Un cycle PPL complet
    for (let i = 0; i < 3 && day > 0; i++) {
      const s = schedule[i]
      const w = weekNum
      const exercises: WorkoutExercise[] = s.prog.map(p => {
        const baseW = p.startWeight + p.weeklyGain * w
        // Tractions/bodyweight : progression en reps, pas en poids
        if (p.startWeight === 0 && p.weeklyGain === 0) {
          const reps = Math.min(p.reps + Math.floor(w * 0.15), p.reps + 6)
          return {
            name: p.name,
            sets: Array.from({ length: p.sets }, (_, j) => [0, Math.max(1, reps - j)] as SetTuple),
          }
        }
        return { name: p.name, sets: makeSets(baseW, p.reps, p.sets) }
      })

      const duration = rand(45, 80)
      const noteIdx = rand(0, NOTES.length - 1)
      workouts.push({
        sessionName: s.session,
        daysAgo: day,
        durationMin: duration,
        note: NOTES[noteIdx],
        exercises,
      })
      day -= rand(1, 2) // 1-2 jours entre séances PPL
    }

    // Jour de repos
    day -= rand(1, 2)

    // Une séance extra tous les ~2 cycles PPL
    if (pplCycle % 2 === 0 && day > 0) {
      const extra = extras[pplCycle % extras.length]
      const exercises: WorkoutExercise[] = extra.prog.map(p => {
        const baseW = p.startWeight + p.weeklyGain * weekNum
        if (p.startWeight === 0 && p.weeklyGain === 0) {
          const reps = Math.min(p.reps + Math.floor(weekNum * 0.1), p.reps + 4)
          return {
            name: p.name,
            sets: Array.from({ length: p.sets }, (_, j) => [0, Math.max(1, reps - j)] as SetTuple),
          }
        }
        return { name: p.name, sets: makeSets(baseW, p.reps, p.sets) }
      })
      workouts.push({
        sessionName: extra.session,
        daysAgo: day,
        durationMin: rand(35, 55),
        note: null,
        exercises,
      })
      day -= rand(1, 2)
    }

    // Repos entre cycles
    day -= rand(1, 2)
    pplCycle++
    weekNum = Math.floor((180 - day) / 7)
  }

  return workouts
}

// --- Historique des séances (6 derniers mois, ~80 séances) ---
const WORKOUTS: WorkoutDef[] = generateWorkouts()

// --- Mesures corporelles (progression sur 6 mois, bi-mensuel) ---
const MEASUREMENTS: MeasurementDef[] = [
  { daysAgo: 180, weight: 85.0, waist: 88, hips: 100, chest: 103, arms: 35 },
  { daysAgo: 165, weight: 84.5, waist: 87.5, hips: 100, chest: 103.5, arms: 35 },
  { daysAgo: 150, weight: 84.0, waist: 87, hips: 99.5, chest: 104, arms: 35.5 },
  { daysAgo: 135, weight: 83.5, waist: 86.5, hips: 99, chest: 104.5, arms: 35.5 },
  { daysAgo: 120, weight: 83.0, waist: 86, hips: 99, chest: 105, arms: 36 },
  { daysAgo: 105, weight: 82.5, waist: 85.5, hips: 98.5, chest: 105.5, arms: 36 },
  { daysAgo: 90, weight: 82.0, waist: 85, hips: 98, chest: 106, arms: 36.5 },
  { daysAgo: 75, weight: 81.5, waist: 84.5, hips: 98, chest: 106.5, arms: 36.5 },
  { daysAgo: 60, weight: 81.0, waist: 84, hips: 97.5, chest: 107, arms: 37 },
  { daysAgo: 45, weight: 80.5, waist: 83, hips: 97, chest: 107.5, arms: 37 },
  { daysAgo: 30, weight: 80.0, waist: 82.5, hips: 97, chest: 108, arms: 37.5 },
  { daysAgo: 15, weight: 79.5, waist: 82, hips: 96.5, chest: 108, arms: 37.5 },
  { daysAgo: 1, weight: 79.0, waist: 81, hips: 96, chest: 108.5, arms: 38 },
]

const DAY_MS = 24 * 60 * 60 * 1000

/** Accès typé aux colonnes raw pour backdater les timestamps readonly (seed data) */
const raw = (record: Model) =>
  record._raw as unknown as Record<string, number | string | boolean | null>

export const seedDevData = async () => {
  try {
    await database.write(async () => {
      // Guard : ne pas re-seeder si des programmes existent déjà
      const programCount = await database.get<Program>('programs').query().fetchCount()
      if (__DEV__) console.log(`[SeedDev] programCount = ${programCount}`)
      if (programCount > 0) return

      // Récupérer tous les exercices existants → Map<nom, Exercise>
      const allExercises = await database.get<Exercise>('exercises').query().fetch()
      if (__DEV__) console.log(`[SeedDev] exercises found = ${allExercises.length}`)
      const byName = new Map(allExercises.map(e => [e.name, e]))

      const batch: Model[] = []
      const sessionsByName = new Map<string, Session>()

      // === Programmes, Sessions, SessionExercises ===
      for (const progDef of PROGRAMS) {
        const program = database.get<Program>('programs').prepareCreate(p => {
          p.name = progDef.name
          p.position = progDef.position
        })
        batch.push(program)

        for (const sessDef of progDef.sessions) {
          const session = database.get<Session>('sessions').prepareCreate(s => {
            s.name = sessDef.name
            s.position = sessDef.position
            s.program.set(program)
          })
          batch.push(session)
          sessionsByName.set(sessDef.name, session)

          for (let i = 0; i < sessDef.exercises.length; i++) {
            const exoDef = sessDef.exercises[i]
            const exercise = byName.get(exoDef.name)
            if (!exercise) continue

            batch.push(
              database.get<SessionExercise>('session_exercises').prepareCreate(se => {
                se.session.set(session)
                se.exercise.set(exercise)
                se.position = i
                se.setsTarget = exoDef.setsTarget
                se.repsTarget = exoDef.repsTarget
                if (exoDef.weightTarget !== undefined) {
                  se.weightTarget = exoDef.weightTarget
                }
              })
            )
          }
        }
      }

      // === Historiques, Sets, PerformanceLogs ===
      const now = Date.now()
      const prTracker = new Map<string, number>()

      for (const w of WORKOUTS) {
        const session = sessionsByName.get(w.sessionName)
        if (!session) continue

        const startTime = now - w.daysAgo * DAY_MS
        const endTime = startTime + w.durationMin * 60 * 1000

        const history = database.get<History>('histories').prepareCreate(h => {
          h.session.set(session)
          h.startTime = new Date(startTime)
          h.endTime = new Date(endTime)
          if (w.note) h.note = w.note
          raw(h).created_at = startTime
          raw(h).updated_at = startTime
        })
        batch.push(history)

        // Pré-calculer les PRs pour ce workout (un seul PR par exercice)
        const exercisePRWeight = new Map<string, number>()
        for (const exo of w.exercises) {
          const maxW = Math.max(...exo.sets.map(([wt]) => wt))
          const prevMax = prTracker.get(exo.name) ?? 0
          if (maxW > 0 && maxW > prevMax) {
            exercisePRWeight.set(exo.name, maxW)
            prTracker.set(exo.name, maxW)
          }
        }

        for (const exo of w.exercises) {
          const exercise = byName.get(exo.name)
          if (!exercise) continue

          let bestWeight = 0
          let bestReps = 0
          let prMarked = false
          const prWeight = exercisePRWeight.get(exo.name)

          for (let i = 0; i < exo.sets.length; i++) {
            const [weight, reps] = exo.sets[i]
            const isPr = !prMarked && prWeight !== undefined && weight === prWeight
            if (isPr) prMarked = true

            if (weight > bestWeight || (weight === bestWeight && reps > bestReps)) {
              bestWeight = weight
              bestReps = reps
            }

            batch.push(
              database.get<SetRecord>('sets').prepareCreate(s => {
                s.history.set(history)
                s.exercise.set(exercise)
                s.weight = weight
                s.reps = reps
                s.setOrder = i
                s.isPr = isPr
                raw(s).created_at = startTime
                raw(s).updated_at = startTime
              })
            )
          }

          // PerformanceLog — résumé de la séance pour cet exercice
          batch.push(
            database.get<PerformanceLog>('performance_logs').prepareCreate(pl => {
              pl.exercise.set(exercise)
              pl.sets = exo.sets.length
              pl.weight = bestWeight
              pl.reps = bestReps
              raw(pl).created_at = startTime
            })
          )
        }
      }

      // === Mesures corporelles ===
      for (const m of MEASUREMENTS) {
        const ts = now - m.daysAgo * DAY_MS
        batch.push(
          database.get<BodyMeasurement>('body_measurements').prepareCreate(bm => {
            bm.date = ts
            bm.weight = m.weight
            bm.waist = m.waist
            bm.hips = m.hips
            bm.chest = m.chest
            bm.arms = m.arms
            raw(bm).created_at = ts
            raw(bm).updated_at = ts
          })
        )
      }

      // === Mise à jour utilisateur ===
      const users = await database.get<User>('users').query().fetch()
      if (users.length > 0) {
        batch.push(
          users[0].prepareUpdate(u => {
            u.name = 'Gabriel'
            u.onboardingCompleted = true
            u.restDuration = 90
          })
        )
      }

      await database.batch(batch)
    })
  } catch (error) {
    if (__DEV__) console.error('❌ Erreur seedDevData:', error)
  }
}
