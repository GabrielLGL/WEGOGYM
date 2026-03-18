/**
 * setQualityHelpers.ts — Analyse la consistance et qualite des series par exercice.
 * Mesure la variance du poids, la regularite des reps, et detecte les drop sets.
 */

export interface SetQualityEntry {
  exerciseId: string
  exerciseName: string
  totalSets: number
  avgWeight: number
  weightVariance: number
  avgReps: number
  repConsistency: number
  dropSetsDetected: number
  qualityScore: number
  grade: 'A' | 'B' | 'C' | 'D'
}

export interface SetQualityResult {
  entries: SetQualityEntry[]
  overallScore: number
  overallGrade: 'A' | 'B' | 'C' | 'D'
  mostConsistent: string | null
  leastConsistent: string | null
}

interface SetInput {
  weight: number
  reps: number
  exerciseId: string
  historyId: string
  createdAt: Date | number
}

interface ExerciseInput {
  id: string
  name: string
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sqDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length)
}

function toGrade(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

/**
 * Detecte les drop sets : sequences ou le poids diminue entre sets consecutifs
 * d'une meme history (seance).
 */
function countDropSets(sets: SetInput[]): number {
  // Group by historyId
  const byHistory = new Map<string, SetInput[]>()
  for (const s of sets) {
    const arr = byHistory.get(s.historyId)
    if (arr) arr.push(s)
    else byHistory.set(s.historyId, [s])
  }

  let drops = 0
  for (const group of byHistory.values()) {
    // Sort by createdAt
    group.sort((a, b) => {
      const ta = typeof a.createdAt === 'number' ? a.createdAt : a.createdAt.getTime()
      const tb = typeof b.createdAt === 'number' ? b.createdAt : b.createdAt.getTime()
      return ta - tb
    })
    for (let i = 1; i < group.length; i++) {
      if (group[i].weight < group[i - 1].weight && group[i - 1].weight > 0) {
        drops++
      }
    }
  }
  return drops
}

export function computeSetQuality(
  sets: SetInput[],
  exercises: ExerciseInput[],
  periodDays: number | null,
): SetQualityResult | null {
  const now = Date.now()
  const cutoff = periodDays ? now - periodDays * 86400000 : 0

  const filtered = periodDays
    ? sets.filter(s => {
        const t = typeof s.createdAt === 'number' ? s.createdAt : s.createdAt.getTime()
        return t >= cutoff
      })
    : sets

  // Group by exerciseId
  const byExercise = new Map<string, SetInput[]>()
  for (const s of filtered) {
    const arr = byExercise.get(s.exerciseId)
    if (arr) arr.push(s)
    else byExercise.set(s.exerciseId, [s])
  }

  const exerciseMap = new Map<string, string>()
  for (const ex of exercises) {
    exerciseMap.set(ex.id, ex.name)
  }

  const entries: SetQualityEntry[] = []

  for (const [exId, exSets] of byExercise.entries()) {
    if (exSets.length < 5) continue

    const weights = exSets.map(s => s.weight)
    const reps = exSets.map(s => s.reps)

    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length
    const avgReps = reps.reduce((a, b) => a + b, 0) / reps.length

    const weightSD = stdDev(weights)
    const weightVariance = avgWeight > 0 ? (weightSD / avgWeight) * 100 : 0

    const repSD = stdDev(reps)
    const repConsistency = avgReps > 0
      ? Math.max(0, Math.min(100, 100 - (repSD / avgReps) * 100))
      : 100

    const dropSetsDetected = countDropSets(exSets)

    const volumeBonus = Math.min(exSets.length, 20)
    const qualityScore = Math.max(0, Math.min(100,
      repConsistency * 0.5 +
      Math.max(0, 100 - weightVariance) * 0.3 +
      volumeBonus
    ))

    const grade = toGrade(qualityScore)

    entries.push({
      exerciseId: exId,
      exerciseName: exerciseMap.get(exId) || exId,
      totalSets: exSets.length,
      avgWeight: Math.round(avgWeight * 10) / 10,
      weightVariance: Math.round(weightVariance * 10) / 10,
      avgReps: Math.round(avgReps * 10) / 10,
      repConsistency: Math.round(repConsistency),
      dropSetsDetected,
      qualityScore: Math.round(qualityScore),
      grade,
    })
  }

  if (entries.length === 0) return null

  entries.sort((a, b) => b.qualityScore - a.qualityScore)

  const overallScore = Math.round(
    entries.reduce((sum, e) => sum + e.qualityScore, 0) / entries.length,
  )

  return {
    entries,
    overallScore,
    overallGrade: toGrade(overallScore),
    mostConsistent: entries.length > 0 ? entries[0].exerciseName : null,
    leastConsistent: entries.length > 1 ? entries[entries.length - 1].exerciseName : null,
  }
}
