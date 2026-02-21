import type { Database } from '@nozbe/watermelondb'
import type { UserProfile, MuscleGroup, PGGeneratedProgram, PGGeneratedSession } from './types'
import type { GeneratedPlan, GeneratedSession, GeneratedExercise } from '../types'
import { determineSplit, buildWeeklySchedule } from './splitStrategy'
import { calcWeeklyVolumeByMuscle, distributeVolumeToSessions } from './volumeCalculator'
import { buildSession } from './sessionBuilder'
import { PARAMS_TABLE } from './tables'

export type { UserProfile, PGGeneratedProgram, PGGeneratedSession }

/**
 * Génère un programme complet (4 semaines) à partir d'un profil utilisateur.
 * 100% offline, déterministe, zéro appel réseau.
 */
export async function generateProgram(
  profile: UserProfile,
  db: Database,
): Promise<PGGeneratedProgram> {
  const splitType = determineSplit(profile)
  const schedule = buildWeeklySchedule(splitType, profile.daysPerWeek)
  const weeklyVolume = calcWeeklyVolumeByMuscle(profile)
  const sessionVolumes = distributeVolumeToSessions(weeklyVolume, schedule)

  const sessions: PGGeneratedSession[] = []
  for (let i = 0; i < profile.daysPerWeek; i++) {
    const session = await buildSession(i, sessionVolumes[i], profile, db, splitType)
    sessions.push(session)
  }

  return {
    id: `pg_${Date.now()}`,
    createdAt: new Date(),
    profile,
    splitType,
    weeksCount: 4,
    sessionsPerWeek: sessions,
    weeklyVolumeByMuscle: weeklyVolume,
  }
}

/**
 * Convertit un PGGeneratedProgram vers le format GeneratedPlan
 * pour être sauvegardé via importGeneratedPlan() existant.
 */
export function toDatabasePlan(program: PGGeneratedProgram, programName: string): GeneratedPlan {
  const p = PARAMS_TABLE[program.profile.goal]

  const sessions: GeneratedSession[] = program.sessionsPerWeek.map((session, i) => {
    const exercises: GeneratedExercise[] = session.exercises.map((ex) => ({
      exerciseName: ex.exerciseName,
      setsTarget: ex.params.sets,
      repsTarget: `${ex.params.repsMin}-${ex.params.repsMax}`,
      weightTarget: 0,  // pas de poids initial — l'utilisateur définit
      restSeconds: ex.params.restSeconds,
      rpe: p.rir + 7,   // approximation RPE depuis RIR (RIR 2 ≈ RPE 8)
    }))

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    const dayName = dayNames[(session.dayOfWeek - 1) % 7]

    return {
      name: `Séance ${i + 1} — ${dayName}`,
      exercises,
    }
  })

  return {
    name: programName,
    sessions,
    includeDeload: false,
  }
}

export { determineSplit, buildWeeklySchedule } from './splitStrategy'
export { calcWeeklyVolumeByMuscle, distributeVolumeToSessions } from './volumeCalculator'
