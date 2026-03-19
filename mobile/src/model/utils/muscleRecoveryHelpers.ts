/**
 * muscleRecoveryHelpers — Estimation de la récupération musculaire par groupe
 *
 * Éphémère — aucune persistance DB, calculé à la volée.
 */

import { MUSCLES_LIST } from '../constants'
import type { ThemeColors } from '../../theme'

export type RecoveryStatus = 'fresh' | 'recovered' | 'recovering' | 'fatigued'

export interface MuscleRecoveryEntry {
  muscle: string
  recoveryPercent: number
  status: RecoveryStatus
  hoursElapsed: number
}

interface SetInput {
  weight: number
  reps: number
  exerciseId: string
  createdAt: Date | number
}

interface ExerciseInput {
  id: string
  muscles: string[]
}

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const SEVEN_DAYS_MS = 7 * DAY_MS

// Temps de récupération de base par catégorie de muscle (en heures)
const LARGE_MUSCLES = new Set(['Pecs', 'Dos', 'Quadriceps', 'Ischios'])
const MEDIUM_MUSCLES = new Set(['Epaules', 'Trapèzes'])
const SMALL_MUSCLES = new Set(['Biceps', 'Triceps', 'Abdos', 'Mollets'])

function getBaseRecoveryHours(muscle: string): number {
  if (LARGE_MUSCLES.has(muscle)) return 72
  if (MEDIUM_MUSCLES.has(muscle)) return 60
  if (SMALL_MUSCLES.has(muscle)) return 48
  if (muscle === 'Cardio') return 24
  return 60
}

function getTs(d: Date | number): number {
  return d instanceof Date ? d.getTime() : d
}

function getStatus(percent: number): RecoveryStatus {
  if (percent >= 100) return 'fresh'
  if (percent >= 70) return 'recovered'
  if (percent >= 40) return 'recovering'
  return 'fatigued'
}

const STATUS_ORDER: Record<RecoveryStatus, number> = {
  fatigued: 0,
  recovering: 1,
  recovered: 2,
  fresh: 3,
}

/**
 * Calcule l'état de récupération estimé pour chaque groupe musculaire.
 */
export function computeMuscleRecovery(
  sets: SetInput[],
  exercises: ExerciseInput[],
): MuscleRecoveryEntry[] {
  const now = Date.now()
  const sevenDaysAgo = now - SEVEN_DAYS_MS

  // Index exercices par id
  const exerciseMap = new Map<string, ExerciseInput>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex)
  }

  // Pour chaque muscle : dernier timestamp + volume du même jour
  const muscleLastTs = new Map<string, number>()
  const muscleDayVolume = new Map<string, number>()

  for (const s of sets) {
    const ts = getTs(s.createdAt)
    if (ts < sevenDaysAgo) continue

    const ex = exerciseMap.get(s.exerciseId)
    if (!ex) continue

    for (const muscle of ex.muscles) {
      const prevTs = muscleLastTs.get(muscle)
      if (prevTs === undefined || ts > prevTs) {
        muscleLastTs.set(muscle, ts)
        muscleDayVolume.set(muscle, 0)
      }

      // Accumuler le volume si même jour que le dernier set
      const lastTs = muscleLastTs.get(muscle)!
      const sameDay = Math.abs(ts - lastTs) < DAY_MS
      if (sameDay) {
        muscleDayVolume.set(muscle, (muscleDayVolume.get(muscle) ?? 0) + s.weight * s.reps)
      }
    }
  }

  const entries: MuscleRecoveryEntry[] = []

  for (const muscle of MUSCLES_LIST) {
    const lastTs = muscleLastTs.get(muscle)
    if (lastTs === undefined) continue

    const hoursElapsed = (now - lastTs) / HOUR_MS
    let recoveryTime = getBaseRecoveryHours(muscle)

    // Volume élevé → temps de récup plus long
    const dayVolume = muscleDayVolume.get(muscle) ?? 0
    if (dayVolume > 2000) {
      recoveryTime += 12
    }

    const recoveryPercent = Math.min(100, (hoursElapsed / recoveryTime) * 100)
    const status = getStatus(recoveryPercent)

    entries.push({
      muscle,
      recoveryPercent: Math.round(recoveryPercent),
      status,
      hoursElapsed: Math.round(hoursElapsed),
    })
  }

  // Tri : fatigued en premier, fresh en dernier
  entries.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])

  return entries
}

/**
 * Retourne la couleur associée à un statut de récupération.
 */
export function getRecoveryColor(status: RecoveryStatus, colors: ThemeColors): string {
  switch (status) {
    case 'fresh': return colors.primary
    case 'recovered': return '#10B981'
    case 'recovering': return '#F59E0B'
    case 'fatigued': return colors.danger
  }
}
