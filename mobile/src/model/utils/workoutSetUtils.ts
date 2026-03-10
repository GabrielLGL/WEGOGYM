/**
 * workoutSetUtils.ts — Opérations sur les séries (save, delete, max poids)
 */

import { Q } from '@nozbe/watermelondb'
import { database } from '../index'
import Exercise from '../models/Exercise'
import History from '../models/History'
import WorkoutSet from '../models/Set'

/**
 * Retourne le poids maximum jamais enregistre pour un exercice,
 * en excluant la seance en cours pour ne comparer qu'avec les seances passees.
 *
 * @param exerciseId - ID de l'exercice
 * @param excludeHistoryId - ID de la History en cours (a exclure)
 * @returns Le max poids, ou 0 si aucun historique precedent
 */
export async function getMaxWeightForExercise(
  exerciseId: string,
  excludeHistoryId: string
): Promise<number> {
  const result = await database
    .get<WorkoutSet>('sets')
    .query(Q.unsafeSqlQuery(
      'SELECT MAX(s.weight) as max_weight FROM sets s ' +
      'INNER JOIN histories h ON s.history_id = h.id ' +
      'WHERE s.exercise_id = ? AND h.id != ? AND h.deleted_at IS NULL',
      [exerciseId, excludeHistoryId]
    ))
    .unsafeFetchRaw()

  const raw = result[0] as Record<string, unknown> | undefined
  return typeof raw?.max_weight === 'number' ? raw.max_weight : 0
}

/**
 * Sauvegarde une serie reelle effectuee pendant une seance en direct.
 *
 * @param params - Donnees de la serie (historyId, exerciseId, weight, reps, setOrder, isPr)
 * @returns L'instance Set créée
 */
export async function saveWorkoutSet(params: {
  historyId: string
  exerciseId: string
  weight: number
  reps: number
  setOrder: number
  isPr: boolean
}): Promise<WorkoutSet> {
  return await database.write(async () => {
    const history = await database.get<History>('histories').find(params.historyId)
    const exercise = await database.get<Exercise>('exercises').find(params.exerciseId)
    return await database.get<WorkoutSet>('sets').create(record => {
      record.history.set(history)
      record.exercise.set(exercise)
      record.weight = params.weight
      record.reps = params.reps
      record.setOrder = params.setOrder
      record.isPr = params.isPr
    })
  })
}

/**
 * Supprime une serie enregistree pendant une seance en direct.
 *
 * Utile pour devalider une serie si l'utilisateur s'est trompe.
 *
 * @param historyId - ID de la History en cours
 * @param exerciseId - ID de l'exercice
 * @param setOrder - Ordre de la serie (1-based)
 */
export async function deleteWorkoutSet(
  historyId: string,
  exerciseId: string,
  setOrder: number
): Promise<void> {
  await database.write(async () => {
    const sets = await database
      .get<WorkoutSet>('sets')
      .query(
        Q.where('history_id', historyId),
        Q.where('exercise_id', exerciseId),
        Q.where('set_order', setOrder)
      )
      .fetch()

    if (sets.length === 0) return

    await sets[0].destroyPermanently()
  })
}

/**
 * Ajoute un set rétroactivement à une séance terminée.
 *
 * @param params - historyId, exerciseId, weight, reps, setOrder
 * @returns L'instance Set créée
 */
export async function addRetroactiveSet(params: {
  historyId: string
  exerciseId: string
  weight: number
  reps: number
  setOrder: number
}): Promise<WorkoutSet> {
  return await database.write(async () => {
    const history = await database.get<History>('histories').find(params.historyId)
    const exercise = await database.get<Exercise>('exercises').find(params.exerciseId)
    return await database.get<WorkoutSet>('sets').create(record => {
      record.history.set(history)
      record.exercise.set(exercise)
      record.weight = params.weight
      record.reps = params.reps
      record.setOrder = params.setOrder
      record.isPr = false
    })
  })
}

/**
 * Recalcule les flags isPr sur TOUS les sets d'un exercice donné.
 * Pour chaque set (trié chronologiquement), isPr = true si c'est le poids max
 * jamais atteint jusqu'à cette date.
 *
 * IMPORTANT : Contient son propre database.write() — NE JAMAIS appeler
 * depuis un autre database.write() (nested write = crash WatermelonDB).
 *
 * @param exerciseId - ID de l'exercice à recalculer
 */
export async function recalculateSetPrs(
  exerciseId: string,
  activeHistories?: History[],
): Promise<void> {
  const allSets = await database
    .get<WorkoutSet>('sets')
    .query(Q.where('exercise_id', exerciseId))
    .fetch()

  const histories = activeHistories ?? await database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .fetch()

  const activeHistoryIds = new Set(histories.map(h => h.id))

  // Filter to sets belonging to non-deleted histories, then sort chronologically
  const activeSets = allSets.filter(s => activeHistoryIds.has(s.history.id))

  // We need history start times for sorting
  const historyMap = new Map(histories.map(h => [h.id, h.startTime.getTime()]))

  activeSets.sort((a, b) => {
    const timeA = historyMap.get(a.history.id) ?? 0
    const timeB = historyMap.get(b.history.id) ?? 0
    if (timeA !== timeB) return timeA - timeB
    return a.setOrder - b.setOrder
  })

  let maxWeight = 0
  const updates: { set: WorkoutSet; shouldBePr: boolean }[] = []

  for (const s of activeSets) {
    const shouldBePr = s.weight > maxWeight
    if (shouldBePr) maxWeight = s.weight
    if (s.isPr !== shouldBePr) {
      updates.push({ set: s, shouldBePr })
    }
  }

  if (updates.length === 0) return

  await database.write(async () => {
    await database.batch(
      updates.map(({ set, shouldBePr }) =>
        set.prepareUpdate(s => { s.isPr = shouldBePr })
      )
    )
  })
}

/**
 * Recalcule les PRs pour plusieurs exercices en une seule lecture DB.
 * Fetche les histories actives UNE fois puis les passe à chaque appel.
 */
export async function recalculateSetPrsBatch(exerciseIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(exerciseIds)]
  if (uniqueIds.length === 0) return
  const histories = await database
    .get<History>('histories')
    .query(Q.where('deleted_at', null))
    .fetch()
  const results = await Promise.allSettled(uniqueIds.map(id => recalculateSetPrs(id, histories)))
  if (__DEV__) {
    for (const r of results) {
      if (r.status === 'rejected') console.error('[recalculateSetPrsBatch]', r.reason)
    }
  }
}
