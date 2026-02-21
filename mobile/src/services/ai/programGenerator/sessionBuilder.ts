import type { Database } from '@nozbe/watermelondb'
import type { UserProfile, MuscleGroup, SplitType, PGGeneratedSession, PGSessionExercise, SetParams } from './types'
import { PARAMS_TABLE, MAX_TOTAL_SETS_PER_SESSION } from './tables'
import { selectExercisesForSession } from './exerciseSelector'

function buildSetParams(
  goal: UserProfile['goal'],
  isCompound: boolean,
  setsCount: number,
): SetParams {
  const p = PARAMS_TABLE[goal]
  return {
    sets: setsCount,
    repsMin: p.repsMin,
    repsMax: p.repsMax,
    restSeconds: isCompound ? p.restCompound : p.restIsolation,
    rir: p.rir,
    tempoEccentric: p.tempoEcc,
  }
}

function estimateDuration(exercises: PGSessionExercise[], goal: UserProfile['goal']): number {
  const p = PARAMS_TABLE[goal]
  return exercises.reduce((total, ex) => {
    const setTime = p.tempoEcc * p.repsMax + ex.params.restSeconds
    return total + ex.params.sets * setTime
  }, 0) / 60  // en minutes
}

export async function buildSession(
  dayIndex: number,
  musclesWithSets: Record<MuscleGroup, number>,
  profile: UserProfile,
  db: Database,
  splitType: SplitType,
): Promise<PGGeneratedSession> {
  const rawExercises = await selectExercisesForSession(musclesWithSets, profile, db)

  // Assigne les séries à chaque exercice
  let totalSets = 0
  const exercises: PGSessionExercise[] = []

  for (const ex of rawExercises) {
    if (totalSets >= MAX_TOTAL_SETS_PER_SESSION) break

    // Séries cibles pour ce muscle dans cette séance
    const primaryMuscle = ex.musclesPrimary[0]
    const targetSets = primaryMuscle ? (musclesWithSets[primaryMuscle] ?? 3) : 3

    // Détermine si compound (premiers exercices triés par nervousDemand desc = compound)
    const isCompound = exercises.length < rawExercises.length / 2

    const setsToAssign = Math.min(targetSets, MAX_TOTAL_SETS_PER_SESSION - totalSets)
    if (setsToAssign <= 0) break

    const params = buildSetParams(profile.goal, isCompound, setsToAssign)

    exercises.push({ ...ex, params })
    totalSets += setsToAssign
  }

  const musclesTargeted = Array.from(
    new Set(exercises.flatMap((e) => e.musclesPrimary))
  )

  return {
    dayOfWeek: dayIndex + 1,  // 1=lundi
    sessionType: splitType,
    musclesTargeted,
    totalSets,
    estimatedMinutes: Math.round(estimateDuration(exercises, profile.goal)),
    exercises,
  }
}
