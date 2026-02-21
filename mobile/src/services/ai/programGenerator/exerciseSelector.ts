import type { Database } from '@nozbe/watermelondb'
import Exercise from '../../../model/models/Exercise'
import type { UserProfile, MuscleGroup, MovementPattern, PGSessionExercise } from './types'
import { EQUIPMENT_TO_DB, MUSCLE_TO_DB, INJURY_ZONE_TO_BODY_ZONE } from './types'
import { MUSCLE_TO_PATTERN } from './tables'
import type { ExerciseType } from '../types'
import { EXERCISE_METADATA } from '../exerciseMetadata'

// Dérive nervousDemand depuis ExerciseType
function toNervousDemand(type: ExerciseType): 1 | 2 | 3 {
  if (type === 'compound_heavy') return 3
  if (type === 'compound' || type === 'accessory') return 2
  return 1
}

// Dérive movementPattern depuis le muscle primaire français
function toMovementPattern(primaryMuscleFr: string): MovementPattern {
  // Map FR → MuscleGroup (EN)
  const FR_TO_MUSCLE: Record<string, MuscleGroup> = {
    'Pecs': 'chest', 'Dos': 'back', 'Epaules': 'shoulders',
    'Biceps': 'biceps', 'Triceps': 'triceps', 'Quadriceps': 'quads',
    'Ischios': 'hamstrings', 'Mollets': 'calves', 'Abdos': 'core', 'Trapèzes': 'traps',
  }
  const muscleEn = FR_TO_MUSCLE[primaryMuscleFr]
  return muscleEn ? MUSCLE_TO_PATTERN[muscleEn] : 'push'
}

export async function selectExercisesForSession(
  musclesWithSets: Record<MuscleGroup, number>,
  profile: UserProfile,
  db: Database,
): Promise<Omit<PGSessionExercise, 'params'>[]> {
  // 1. Charge tous les exercices
  const exercises = await db.get<Exercise>('exercises').query().fetch()

  // 2. Ensemble des equipment DB valides selon le profil
  const validEquipmentDB = new Set(
    profile.equipment.flatMap((eq) => EQUIPMENT_TO_DB[eq])
  )

  // 3. Muscles ciblés cette séance (noms FR)
  const targetMusclesFR = new Set(
    (Object.keys(musclesWithSets) as MuscleGroup[])
      .filter((m) => musclesWithSets[m] > 0)
      .map((m) => MUSCLE_TO_DB[m])
  )

  // 4. Zones d'injury à éviter (EN)
  const injuryBodyZones = new Set(profile.injuries)

  // 5. Mapping AILevel → int pour comparaison
  const levelOrder: Record<string, number> = { 'débutant': 0, 'intermédiaire': 1, 'avancé': 2 }
  const profileLevelInt = profile.level === 'beginner' ? 0 : profile.level === 'intermediate' ? 1 : 2

  type Candidate = {
    exerciseId: string
    exerciseName: string
    musclesPrimary: MuscleGroup[]
    nervousDemand: 1 | 2 | 3
    movementPattern: MovementPattern
  }

  const candidates: Candidate[] = []

  for (const ex of exercises) {
    const meta = EXERCISE_METADATA[ex.name]
    if (!meta) continue

    // Filtre equipment
    const exEquipment = ex.equipment ?? ''
    if (exEquipment && !validEquipmentDB.has(exEquipment)) continue
    if (!exEquipment && !profile.equipment.includes('bodyweight')) continue

    // Filtre muscles cibles
    const exMusclesFR: string[] = Array.isArray(ex.muscles) ? ex.muscles : []
    const matchesMuscle = exMusclesFR.some((m) => targetMusclesFR.has(m))
    if (!matchesMuscle) continue

    // Filtre difficulty
    const metaLevelInt = levelOrder[meta.minLevel] ?? 0
    if (metaLevelInt > profileLevelInt) continue

    // Filtre injuries
    const injuryZonesFR = meta.injuryRisk ?? []
    const hasConflict = injuryZonesFR.some((zone) => {
      const bodyZone = INJURY_ZONE_TO_BODY_ZONE[zone]
      return bodyZone && injuryBodyZones.has(bodyZone)
    })
    if (hasConflict) continue

    // Dérive musclesPrimary (EN)
    const primaryMuscleEn: MuscleGroup | undefined = (Object.entries(MUSCLE_TO_DB) as [MuscleGroup, string][])
      .find(([, fr]) => fr === meta.primaryMuscle)?.[0]
    const musclesPrimary: MuscleGroup[] = primaryMuscleEn ? [primaryMuscleEn] : []

    candidates.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      musclesPrimary,
      nervousDemand: toNervousDemand(meta.type),
      movementPattern: toMovementPattern(meta.primaryMuscle),
    })
  }

  // 6. Tri : nervousDemand desc
  candidates.sort((a, b) => b.nervousDemand - a.nervousDemand)

  // 7. Limite : max 2 exercices par primaryMuscle pour éviter redondance
  const muscleCount: Partial<Record<MuscleGroup, number>> = {}
  const selected: Candidate[] = []
  for (const c of candidates) {
    const primary = c.musclesPrimary[0]
    if (!primary) { selected.push(c); continue }
    const count = muscleCount[primary] ?? 0
    if (count < 2) {
      selected.push(c)
      muscleCount[primary] = count + 1
    }
  }

  return selected.map((c, i) => ({
    exerciseId: c.exerciseId,
    exerciseName: c.exerciseName,
    musclesPrimary: c.musclesPrimary,
    order: i + 1,
  }))
}
