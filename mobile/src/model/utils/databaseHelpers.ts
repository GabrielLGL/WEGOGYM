import { Q } from '@nozbe/watermelondb'
import type { Clause } from '@nozbe/watermelondb/QueryDescription'
import { database } from '../index'
import Exercise from '../models/Exercise'

/**
 * Database helpers - Fonctions utilitaires pour les opérations de base de données
 *
 * Remplace les opérations DB inline répétées dans les screens.
 * Centralise la logique DB pour cohérence et réutilisabilité.
 */

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
 * Parse une valeur numérique (string) en number avec fallback
 *
 * @param value - Valeur string à parser
 * @param fallback - Valeur par défaut si parsing échoue (défaut: 0)
 * @returns Nombre parsé ou fallback
 *
 * @example
 * const sets = parseNumericInput(targetSets, 0)
 * const weight = parseNumericInput(targetWeight, 0)
 */
export function parseNumericInput(value: string, fallback: number = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Parse une valeur entière (string) en integer avec fallback
 *
 * @param value - Valeur string à parser
 * @param fallback - Valeur par défaut si parsing échoue (défaut: 0)
 * @returns Entier parsé ou fallback
 *
 * @example
 * const sets = parseIntegerInput(targetSets, 1)
 */
export function parseIntegerInput(value: string, fallback: number = 0): number {
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
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
