/**
 * exerciseQueryUtils.ts — Filtrage/recherche exercices + position
 */

import type { Clause } from '@nozbe/watermelondb/QueryDescription'
import { database } from '../index'
import Exercise from '../models/Exercise'

/**
 * Récupère la prochaine position disponible dans une collection
 *
 * Utile pour l'ordering de programs, sessions, exercises, etc.
 *
 * @param collectionName - Nom de la collection
 * @param clauses - Clauses optionnelles pour filtrer (ex: Q.where('program_id', programId))
 * @returns La prochaine position (count)
 *
 * @example
 * const nextPosition = await getNextPosition('sessions', Q.where('program_id', programId))
 * session.position = nextPosition
 */
export async function getNextPosition(
  collectionName: string,
  ...clauses: Clause[]
): Promise<number> {
  const collection = database.get(collectionName)
  return await collection.query(...clauses).fetchCount()
}

/**
 * Filtre les exercices par muscle et/ou équipement
 *
 * Remplace les 3 implémentations identiques de filtrage.
 *
 * @param exercises - Liste d'exercices à filtrer
 * @param muscle - Muscle à filtrer (null = tous)
 * @param equipment - Équipement à filtrer (null = tous)
 * @returns Liste filtrée d'exercices
 *
 * @example
 * const filtered = filterExercises(allExercises, 'Pectoraux', 'Poids libre')
 */
export function filterExercises(
  exercises: Exercise[],
  muscle?: string | null,
  equipment?: string | null
): Exercise[] {
  return exercises.filter((exercise) => {
    const matchMuscle = !muscle || exercise.muscles.includes(muscle)
    const matchEquipment = !equipment || exercise.equipment === equipment
    return matchMuscle && matchEquipment
  })
}

/**
 * Recherche d'exercices par nom (case-insensitive)
 *
 * @param exercises - Liste d'exercices
 * @param query - Terme de recherche
 * @returns Liste filtrée d'exercices
 *
 * @example
 * const results = searchExercises(allExercises, 'bench press')
 */
export function searchExercises(
  exercises: Exercise[],
  query: string
): Exercise[] {
  if (!query.trim()) return exercises

  const lowerQuery = query.toLowerCase()
  return exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Combine filtres et recherche d'exercices
 *
 * @param exercises - Liste d'exercices
 * @param options - Options de filtrage
 * @returns Liste filtrée d'exercices
 *
 * @example
 * const filtered = filterAndSearchExercises(allExercises, {
 *   muscle: 'Pectoraux',
 *   equipment: 'Poids libre',
 *   searchQuery: 'press'
 * })
 */
export function filterAndSearchExercises(
  exercises: Exercise[],
  options: {
    muscle?: string | null
    equipment?: string | null
    searchQuery?: string
  }
): Exercise[] {
  let filtered = exercises

  // Appliquer filtres muscle/équipement
  if (options.muscle || options.equipment) {
    filtered = filterExercises(filtered, options.muscle, options.equipment)
  }

  // Appliquer recherche
  if (options.searchQuery) {
    filtered = searchExercises(filtered, options.searchQuery)
  }

  return filtered
}
