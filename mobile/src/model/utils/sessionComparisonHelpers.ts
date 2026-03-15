export interface ExerciseComparison {
  exerciseId: string
  exerciseName: string
  current: {
    volume: number
    maxWeight: number
    totalSets: number
    totalReps: number
  }
  previous: {
    volume: number
    maxWeight: number
    totalSets: number
    totalReps: number
    date: number
  } | null
  deltas: {
    volume: number
    volumePercent: number
    maxWeight: number
    maxWeightPercent: number
  } | null
}

export interface SessionComparison {
  exercises: ExerciseComparison[]
  overallVolumeDelta: number
  overallVolumeDeltaPercent: number
  hasComparison: boolean
}

interface SetData {
  weight: number
  reps: number
  exerciseId: string
}

interface HistoricalSetData extends SetData {
  historyId: string
  createdAt: Date | number
}

interface ExerciseInfo {
  id: string
  name: string
}

function groupByExercise<T extends SetData>(sets: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const s of sets) {
    const arr = map.get(s.exerciseId)
    if (arr) arr.push(s)
    else map.set(s.exerciseId, [s])
  }
  return map
}

function computeStats(sets: SetData[]) {
  let volume = 0
  let maxWeight = 0
  let totalReps = 0
  for (const s of sets) {
    volume += s.weight * s.reps
    if (s.weight > maxWeight) maxWeight = s.weight
    totalReps += s.reps
  }
  return { volume, maxWeight, totalSets: sets.length, totalReps }
}

/**
 * Compare la séance actuelle avec la dernière séance contenant les mêmes exercices.
 */
export function computeSessionComparison(
  currentSets: SetData[],
  previousSets: HistoricalSetData[],
  exercises: ExerciseInfo[],
  currentHistoryId: string,
): SessionComparison {
  const exerciseMap = new Map(exercises.map(e => [e.id, e.name]))
  const currentByExercise = groupByExercise(currentSets)

  // Group previous sets by exerciseId, then by historyId to find most recent session per exercise
  const prevByExercise = groupByExercise(
    previousSets.filter(s => s.historyId !== currentHistoryId),
  )

  const comparisons: ExerciseComparison[] = []
  let totalCurrentVolume = 0
  let totalPreviousVolume = 0
  let hasAnyComparison = false

  for (const [exerciseId, curSets] of currentByExercise) {
    const current = computeStats(curSets)
    totalCurrentVolume += current.volume

    const prevSetsForExercise = prevByExercise.get(exerciseId)
    let previous: ExerciseComparison['previous'] = null
    let deltas: ExerciseComparison['deltas'] = null

    if (prevSetsForExercise && prevSetsForExercise.length > 0) {
      // Group by historyId to find the most recent session
      const byHistory = new Map<string, HistoricalSetData[]>()
      for (const s of prevSetsForExercise) {
        const arr = byHistory.get(s.historyId)
        if (arr) arr.push(s)
        else byHistory.set(s.historyId, [s])
      }

      // Find the session with the most recent createdAt
      let latestHistoryId = ''
      let latestDate = 0
      for (const [hId, sets] of byHistory) {
        const date = sets[0].createdAt instanceof Date
          ? sets[0].createdAt.getTime()
          : sets[0].createdAt
        if (date > latestDate) {
          latestDate = date
          latestHistoryId = hId
        }
      }

      if (latestHistoryId) {
        const prevSessionSets = byHistory.get(latestHistoryId)!
        const prevStats = computeStats(prevSessionSets)
        previous = { ...prevStats, date: latestDate }
        totalPreviousVolume += prevStats.volume
        hasAnyComparison = true

        const volumeDelta = current.volume - prevStats.volume
        const maxWeightDelta = current.maxWeight - prevStats.maxWeight
        deltas = {
          volume: volumeDelta,
          volumePercent: prevStats.volume > 0
            ? (volumeDelta / prevStats.volume) * 100
            : 0,
          maxWeight: maxWeightDelta,
          maxWeightPercent: prevStats.maxWeight > 0
            ? (maxWeightDelta / prevStats.maxWeight) * 100
            : 0,
        }
      }
    }

    comparisons.push({
      exerciseId,
      exerciseName: exerciseMap.get(exerciseId) ?? exerciseId,
      current,
      previous,
      deltas,
    })
  }

  const overallDelta = totalCurrentVolume - totalPreviousVolume
  return {
    exercises: comparisons,
    overallVolumeDelta: hasAnyComparison ? overallDelta : 0,
    overallVolumeDeltaPercent: hasAnyComparison && totalPreviousVolume > 0
      ? (overallDelta / totalPreviousVolume) * 100
      : 0,
    hasComparison: hasAnyComparison,
  }
}
