export interface AlternativeExercise {
  exerciseId: string
  exerciseName: string
  sharedMuscles: string[]    // muscles en commun
  matchScore: number         // 0-1 (1 = tous les muscles en commun)
  totalSets: number          // nombre de sets historiques
  lastUsed: number | null    // timestamp dernière utilisation
}

/**
 * Trouve des exercices alternatifs basés sur les muscles en commun.
 * Ne retourne que les exercices déjà pratiqués par l'utilisateur.
 * @param currentExercise - L'exercice courant à comparer
 * @param allExercises - Tous les exercices disponibles
 * @param allSets - Tous les sets enregistrés (pour déterminer les exercices pratiqués)
 * @param maxResults - Nombre max de résultats (défaut: 5)
 */
export function findAlternatives(
  currentExercise: { id: string; name: string; muscles: string[] },
  allExercises: Array<{ id: string; name: string; muscles: string[] }>,
  allSets: Array<{ exerciseId: string | null; createdAt: Date | number }>,
  maxResults = 5,
): AlternativeExercise[] {
  // Construire une map exerciseId → { count, lastUsed }
  const setsByExercise = new Map<string, { count: number; lastUsed: number }>()
  for (const set of allSets) {
    if (!set.exerciseId) continue
    const ts =
      set.createdAt instanceof Date ? set.createdAt.getTime() : (set.createdAt as number)
    const existing = setsByExercise.get(set.exerciseId)
    if (existing) {
      existing.count++
      if (ts > existing.lastUsed) existing.lastUsed = ts
    } else {
      setsByExercise.set(set.exerciseId, { count: 1, lastUsed: ts })
    }
  }

  const currentMuscles = currentExercise.muscles ?? []
  const results: AlternativeExercise[] = []

  for (const ex of allExercises) {
    if (ex.id === currentExercise.id) continue

    const exMuscles = ex.muscles ?? []
    const sharedMuscles = currentMuscles.filter(m => exMuscles.includes(m))

    if (sharedMuscles.length === 0) continue

    const stats = setsByExercise.get(ex.id)
    if (!stats) continue // exercice non pratiqué → exclure

    const matchScore =
      sharedMuscles.length / Math.max(currentMuscles.length, exMuscles.length, 1)

    results.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sharedMuscles,
      matchScore,
      totalSets: stats.count,
      lastUsed: stats.lastUsed,
    })
  }

  // Trier par matchScore desc, puis totalSets desc
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    return b.totalSets - a.totalSets
  })

  return results.slice(0, maxResults)
}
