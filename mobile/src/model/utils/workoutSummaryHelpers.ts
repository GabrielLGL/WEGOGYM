/**
 * workoutSummaryHelpers — Résumé compact de la dernière séance.
 *
 * Utilisé par HomeScreen pour afficher la carte "Dernière séance".
 */

export interface WorkoutSummary {
  sessionName: string
  programName: string | null
  date: Date
  durationMinutes: number
  totalVolume: number        // kg
  totalSets: number
  totalReps: number
  density: number            // kg/min
  prsHit: number             // nombre de PRs dans cette séance
  topExercise: string | null // exercice avec le plus gros volume
  timeAgo: string            // "il y a 2h", "hier", "il y a 3j"
}

interface HistoryInput {
  id: string
  startedAt: Date | number
  completedAt: Date | number | null
  isAbandoned: boolean
  sessionId: string
}

interface SetInput {
  weight: number
  reps: number
  exerciseId: string
  historyId: string
  isPr: boolean
}

interface ExerciseInput {
  id: string
  name: string
}

interface SessionInput {
  id: string
  name: string
  programId: string
}

interface ProgramInput {
  id: string
  name: string
}

/**
 * Formate "il y a Xh", "hier", "il y a Xj" / "Xh ago", "yesterday", "Xd ago"
 */
export function formatTimeAgo(date: Date, language: 'fr' | 'en'): string {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH = Math.floor(diffMs / 3_600_000)
  const diffD = Math.floor(diffMs / 86_400_000)

  if (language === 'fr') {
    if (diffMin < 60) return `il y a ${Math.max(1, diffMin)}min`
    if (diffH < 24) return `il y a ${diffH}h`
    if (diffD === 1) return 'hier'
    return `il y a ${diffD}j`
  }
  // en
  if (diffMin < 60) return `${Math.max(1, diffMin)}min ago`
  if (diffH < 24) return `${diffH}h ago`
  if (diffD === 1) return 'yesterday'
  return `${diffD}d ago`
}

/**
 * Construit le résumé de la dernière séance.
 */
export function computeWorkoutSummary(
  histories: HistoryInput[],
  sets: SetInput[],
  exercises: ExerciseInput[],
  sessions: SessionInput[],
  programs: ProgramInput[],
  language: 'fr' | 'en',
): WorkoutSummary | null {
  // 1. Trouver la dernière history (non abandonnée, triée par startedAt desc)
  const completed = histories
    .filter(h => !h.isAbandoned && h.completedAt != null)
    .sort((a, b) => {
      const ta = typeof a.startedAt === 'number' ? a.startedAt : a.startedAt.getTime()
      const tb = typeof b.startedAt === 'number' ? b.startedAt : b.startedAt.getTime()
      return tb - ta
    })

  if (completed.length === 0) return null

  const last = completed[0]
  const startMs = typeof last.startedAt === 'number' ? last.startedAt : last.startedAt.getTime()
  const endMs = typeof last.completedAt === 'number' ? last.completedAt : (last.completedAt as Date).getTime()

  // 2. Filtrer les sets de cette history
  const historySets = sets.filter(s => s.historyId === last.id)
  if (historySets.length === 0) return null

  // 3. totalVolume = somme(weight * reps)
  const totalVolume = historySets.reduce((acc, s) => acc + s.weight * s.reps, 0)

  // 4. durationMinutes
  const durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60_000))

  // 5. density = totalVolume / durationMinutes
  const density = totalVolume / durationMinutes

  // 6. totalReps
  const totalReps = historySets.reduce((acc, s) => acc + s.reps, 0)

  // 7. prsHit: count sets marked as PR
  const prsHit = historySets.filter(s => s.isPr).length

  // 8. topExercise: exercice avec le plus gros volume dans la séance
  const volumeByExercise = new Map<string, number>()
  for (const s of historySets) {
    volumeByExercise.set(s.exerciseId, (volumeByExercise.get(s.exerciseId) ?? 0) + s.weight * s.reps)
  }
  let topExerciseId: string | null = null
  let topVolume = 0
  for (const [exId, vol] of volumeByExercise) {
    if (vol > topVolume) {
      topVolume = vol
      topExerciseId = exId
    }
  }
  const topExercise = topExerciseId
    ? exercises.find(e => e.id === topExerciseId)?.name ?? null
    : null

  // 9. Remonter session.name et program.name
  const session = sessions.find(s => s.id === last.sessionId)
  const sessionName = session?.name ?? '—'
  const program = session ? programs.find(p => p.id === session.programId) : null
  const programName = program?.name ?? null

  // 10. timeAgo
  const timeAgo = formatTimeAgo(new Date(startMs), language)

  return {
    sessionName,
    programName,
    date: new Date(startMs),
    durationMinutes,
    totalVolume,
    totalSets: historySets.length,
    totalReps,
    density,
    prsHit,
    topExercise,
    timeAgo,
  }
}
