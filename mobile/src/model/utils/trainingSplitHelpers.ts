/**
 * trainingSplitHelpers.ts — Détection du pattern d'entraînement
 *
 * Classifie chaque séance en type de split (Push/Pull/Legs, Upper/Lower, etc.)
 * et analyse le pattern dominant sur une période donnée.
 */

export type SplitType =
  | 'push'       // Pecs, Epaules, Triceps
  | 'pull'       // Dos, Trapèzes, Biceps
  | 'legs'       // Quadriceps, Ischios, Mollets
  | 'upper'      // Push + Pull muscles
  | 'lower'      // Legs muscles
  | 'fullBody'   // ≥ 3 catégories touchées
  | 'cardio'     // Cardio uniquement
  | 'arms'       // Biceps + Triceps dominants
  | 'other'      // Inclassable

export interface SessionSplit {
  date: number
  splitType: SplitType
  muscles: string[]
  exerciseCount: number
  setsCount: number
}

export interface SplitAnalysis {
  sessions: SessionSplit[]
  distribution: Record<SplitType, number>
  dominantPattern: string
  consistency: number
}

const PUSH_MUSCLES = ['Pecs', 'Epaules', 'Triceps']
const PULL_MUSCLES = ['Dos', 'Trapèzes', 'Biceps']
const LEG_MUSCLES = ['Quadriceps', 'Ischios', 'Mollets']

/**
 * Classifie une séance par type de split basé sur les muscles travaillés.
 */
export function classifySession(muscles: string[]): SplitType {
  if (muscles.length === 0) return 'other'

  const isCardioOnly = muscles.length === 1 && muscles[0] === 'Cardio'
  if (isCardioOnly) return 'cardio'

  const nonCardio = muscles.filter(m => m !== 'Cardio')

  const pushCount = nonCardio.filter(m => PUSH_MUSCLES.includes(m)).length
  const pullCount = nonCardio.filter(m => PULL_MUSCLES.includes(m)).length
  const legCount = nonCardio.filter(m => LEG_MUSCLES.includes(m)).length
  const total = nonCardio.length

  if (total === 0) return 'cardio'

  // ≥ 3 catégories avec au moins 1 muscle → fullBody
  const categories = [pushCount > 0, pullCount > 0, legCount > 0].filter(Boolean).length
  if (categories >= 3) return 'fullBody'

  const hasPush = pushCount > 0
  const hasPull = pullCount > 0
  const hasLegs = legCount > 0

  // Push + Pull sans legs → upper
  if (hasPush && hasPull && !hasLegs) return 'upper'

  // Legs sans push/pull → lower
  if (hasLegs && !hasPush && !hasPull) return 'lower'

  // Push dominant (>50%)
  if (hasPush && pushCount / total > 0.5) return 'push'

  // Pull dominant (>50%)
  if (hasPull && pullCount / total > 0.5) return 'pull'

  // Legs dominant (>50%)
  if (hasLegs && legCount / total > 0.5) return 'legs'

  // Arms : Biceps + Triceps dominants (sans Pecs/Dos importants)
  const armsCount = nonCardio.filter(m => m === 'Biceps' || m === 'Triceps').length
  if (armsCount >= 2 && armsCount / total > 0.5) return 'arms'

  // Single category fallback
  if (hasPush && !hasPull && !hasLegs) return 'push'
  if (hasPull && !hasPush && !hasLegs) return 'pull'
  if (hasLegs && !hasPush && !hasPull) return 'legs'

  return 'other'
}

const EMPTY_DISTRIBUTION: Record<SplitType, number> = {
  push: 0,
  pull: 0,
  legs: 0,
  upper: 0,
  lower: 0,
  fullBody: 0,
  cardio: 0,
  arms: 0,
  other: 0,
}

/**
 * Analyse le pattern d'entraînement sur les N derniers jours.
 */
export function analyzeTrainingSplit(
  sets: Array<{ exerciseId: string; createdAt: Date | number }>,
  exercises: Array<{ id: string; muscles: string[] }>,
  histories: Array<{ createdAt: Date | number; deletedAt: Date | null; isAbandoned: boolean }>,
  periodDays = 30,
): SplitAnalysis {
  const now = Date.now()
  const cutoff = now - periodDays * 24 * 60 * 60 * 1000

  // Construire un index exerciseId → muscles
  const exerciseMusles = new Map<string, string[]>()
  for (const ex of exercises) {
    exerciseMusles.set(ex.id, ex.muscles ?? [])
  }

  // Dates des séances valides (non supprimées, non abandonnées)
  const validHistoryDates = new Set<string>()
  for (const h of histories) {
    if (h.deletedAt !== null || h.isAbandoned) continue
    const ts = typeof h.createdAt === 'number' ? h.createdAt : h.createdAt.getTime()
    if (ts >= cutoff) {
      const day = new Date(ts).toISOString().slice(0, 10)
      validHistoryDates.add(day)
    }
  }

  // Grouper les sets par jour
  const dayMap = new Map<string, { exerciseIds: Set<string>; setsCount: number; ts: number }>()

  for (const s of sets) {
    const ts = typeof s.createdAt === 'number' ? s.createdAt : s.createdAt.getTime()
    if (ts < cutoff) continue

    const day = new Date(ts).toISOString().slice(0, 10)
    if (!validHistoryDates.has(day)) continue

    const entry = dayMap.get(day) ?? { exerciseIds: new Set(), setsCount: 0, ts }
    entry.exerciseIds.add(s.exerciseId)
    entry.setsCount += 1
    if (ts > entry.ts) entry.ts = ts
    dayMap.set(day, entry)
  }

  // Construire les sessions
  const sessions: SessionSplit[] = []
  for (const [, entry] of dayMap) {
    const allMuscles = new Set<string>()
    for (const exId of entry.exerciseIds) {
      const ms = exerciseMusles.get(exId) ?? []
      for (const m of ms) allMuscles.add(m)
    }
    const muscles = Array.from(allMuscles)
    sessions.push({
      date: entry.ts,
      splitType: classifySession(muscles),
      muscles,
      exerciseCount: entry.exerciseIds.size,
      setsCount: entry.setsCount,
    })
  }

  sessions.sort((a, b) => a.date - b.date)

  // Distribution
  const distribution: Record<SplitType, number> = { ...EMPTY_DISTRIBUTION }
  for (const s of sessions) {
    distribution[s.splitType] += 1
  }

  const total = sessions.length

  if (total === 0) {
    return { sessions: [], distribution, dominantPattern: 'mixed', consistency: 0 }
  }

  // Détecter le pattern dominant
  let dominantPattern: string
  const pushR = distribution.push / total
  const pullR = distribution.pull / total
  const legsR = distribution.legs / total
  const upperR = distribution.upper / total
  const lowerR = distribution.lower / total
  const fullBodyR = distribution.fullBody / total

  if (pushR >= 0.2 && pullR >= 0.2 && legsR >= 0.2) {
    dominantPattern = 'ppl'
  } else if (upperR >= 0.3 && lowerR >= 0.3) {
    dominantPattern = 'upperLower'
  } else if (fullBodyR >= 0.5) {
    dominantPattern = 'fullBody'
  } else {
    dominantPattern = 'mixed'
  }

  // Consistency : % de séances qui suivent le pattern dominant
  let consistentCount = 0
  if (dominantPattern === 'ppl') {
    consistentCount = distribution.push + distribution.pull + distribution.legs
  } else if (dominantPattern === 'upperLower') {
    consistentCount = distribution.upper + distribution.lower
  } else if (dominantPattern === 'fullBody') {
    consistentCount = distribution.fullBody
  } else {
    // mixed : la catégorie majoritaire
    const maxCount = Math.max(...Object.values(distribution))
    consistentCount = maxCount
  }

  const consistency = Math.round((consistentCount / total) * 100)

  return { sessions, distribution, dominantPattern, consistency }
}
