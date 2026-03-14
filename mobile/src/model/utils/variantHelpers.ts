import Exercise from '../models/Exercise'

export interface VariantSuggestion {
  exercise: Exercise
  sharedMuscles: string[]
  hasHistory: boolean
  similarityScore: number
}

/**
 * Trouve les meilleures variantes pour un exercice donné.
 * Exclut l'exercice lui-même. Trie par score de similarité décroissant,
 * avec les exercices déjà pratiqués en premier.
 */
export function computeVariantSuggestions(
  targetExercise: Exercise,
  allExercises: Exercise[],
  usedExerciseIds: Set<string>,
  limit: number = 3,
): VariantSuggestion[] {
  const targetMuscles = targetExercise.muscles ?? []
  if (targetMuscles.length === 0) return []

  const results: VariantSuggestion[] = []

  for (const candidate of allExercises) {
    if (candidate.id === targetExercise.id) continue

    const candidateMuscles = candidate.muscles ?? []
    const sharedMuscles = candidateMuscles.filter(m => targetMuscles.includes(m))
    if (sharedMuscles.length === 0) continue

    const similarityScore = sharedMuscles.length / Math.max(1, targetMuscles.length)
    results.push({
      exercise: candidate,
      sharedMuscles,
      hasHistory: usedExerciseIds.has(candidate.id),
      similarityScore,
    })
  }

  results.sort((a, b) => {
    if (a.hasHistory !== b.hasHistory) return a.hasHistory ? -1 : 1
    return b.similarityScore - a.similarityScore
  })

  return results.slice(0, limit)
}
