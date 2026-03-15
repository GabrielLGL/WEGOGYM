/**
 * exerciseStatsUtils.ts — Stats et récap exercice
 * Contient l'interface ExerciseSessionStat et toutes les fonctions de stats.
 */

import { Q } from '@nozbe/watermelondb'
import { database } from '../index'
import History from '../models/History'
import Session from '../models/Session'
import SessionExercise from '../models/SessionExercise'
import WorkoutSet from '../models/Set'
import type { LastPerformance, RecapExerciseData, ValidatedSetData } from '../../types/workout'
import { getMaxWeightForExercise } from './workoutSetUtils'

/**
 * Stat agregee d'un exercice pour une seance donnee (source : table sets).
 */
export interface ExerciseSessionStat {
  historyId: string
  sessionName: string
  startTime: Date
  maxWeight: number
  sets: { weight: number; reps: number; setOrder: number }[]
}

/**
 * Retourne la dernière performance enregistrée pour un exercice
 * en excluant la séance en cours.
 *
 * Algorithme : fetch les sets → grouper par history_id → trouver la history
 * la plus recente → calculer maxWeight, avgReps, setsCount.
 *
 * @param exerciseId - ID de l'exercice
 * @param excludeHistoryId - ID de la History en cours (a exclure)
 * @returns LastPerformance ou null si aucun historique precedent
 */
export async function getLastPerformanceForExercise(
  exerciseId: string,
  excludeHistoryId: string
): Promise<LastPerformance | null> {
  const sets = await database
    .get<WorkoutSet>('sets')
    .query(
      Q.where('exercise_id', exerciseId),
      Q.where('history_id', Q.notEq(excludeHistoryId))
    )
    .fetch()

  if (sets.length === 0) return null

  // Unique history IDs parmi les sets trouves
  const historyIdSet = new Set(sets.map(s => s.history.id))
  const historyIds = Array.from(historyIdSet)

  // Fetch toutes les Histories via query filtrée — exclure les soft-deleted
  const histories = await database
    .get<History>('histories')
    .query(
      Q.where('id', Q.oneOf(historyIds)),
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )
    .fetch()

  if (histories.length === 0) return null

  // La History la plus recente (tri desc par start_time)
  const mostRecent = histories.sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  )[0]

  // Sets de cette seance uniquement
  const recentSets = sets.filter(s => s.history.id === mostRecent.id)

  if (recentSets.length === 0) return null

  const maxWeight = Math.max(...recentSets.map(s => s.weight))
  const avgWeight = Math.round(
    recentSets.reduce((sum, s) => sum + s.weight, 0) / recentSets.length
  )
  const avgReps = Math.round(
    recentSets.reduce((sum, s) => sum + s.reps, 0) / recentSets.length
  )
  const setsCount = recentSets.length

  return { maxWeight, avgWeight, avgReps, setsCount, date: mostRecent.startTime }
}

/**
 * Construit les statistiques d'exercice a partir de donnees deja chargees.
 *
 * Fonction pure réutilisable dans les contextes asynchrone (getExerciseStatsFromSets)
 * et reactif (ChartsScreen via withObservables).
 *
 * @param sets - Sets de l'exercice (pre-filtrés)
 * @param histories - Histories correspondantes (soft-deleted exclues)
 * @param sessions - Sessions pour recuperer les noms
 * @returns Tableau de ExerciseSessionStat trie ASC par startTime
 */
export function buildExerciseStatsFromData(
  sets: WorkoutSet[],
  histories: History[],
  sessions: Session[]
): ExerciseSessionStat[] {
  if (sets.length === 0) return []

  const byHistory = new Map<string, WorkoutSet[]>()
  sets.forEach(s => {
    const existing = byHistory.get(s.history.id) ?? []
    existing.push(s)
    byHistory.set(s.history.id, existing)
  })

  const sessionsMap = new Map(sessions.map(s => [s.id, s]))

  const stats: ExerciseSessionStat[] = []
  histories.forEach(history => {
    const groupSets = byHistory.get(history.id)
    if (!groupSets || groupSets.length === 0) return
    const session = sessionsMap.get(history.session.id)
    stats.push({
      historyId: history.id,
      sessionName: session?.name ?? '',
      startTime: history.startTime,
      maxWeight: Math.max(...groupSets.map(s => s.weight)),
      sets: [...groupSets]
        .sort((a, b) => a.setOrder - b.setOrder)
        .map(s => ({ weight: s.weight, reps: s.reps, setOrder: s.setOrder })),
    })
  })

  return stats.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

/**
 * Calcule les statistiques de progression d'un exercice a partir de la table sets.
 *
 * Pour chaque seance (History) ayant des sets pour cet exercice, calcule :
 * - Le poids max (maxWeight)
 * - La liste des series individuelles
 * Retourne le tableau trie par startTime ASC. Les seances soft-deleted sont exclues.
 *
 * @param exerciseId - ID de l'exercice
 * @returns Tableau de ExerciseSessionStat trie ASC par startTime
 */
export async function getExerciseStatsFromSets(
  exerciseId: string
): Promise<ExerciseSessionStat[]> {
  // 1. Fetch tous les sets de cet exercice
  const sets = await database
    .get<WorkoutSet>('sets')
    .query(Q.where('exercise_id', exerciseId))
    .fetch()

  if (sets.length === 0) return []

  // 2. Grouper les sets par history_id pour obtenir les IDs uniques
  const byHistory = new Map<string, WorkoutSet[]>()
  sets.forEach(s => {
    const existing = byHistory.get(s.history.id) ?? []
    existing.push(s)
    byHistory.set(s.history.id, existing)
  })

  const historyIds = Array.from(byHistory.keys())

  // 3. Fetch les histories (exclut soft-deleted)
  const histories = await database
    .get<History>('histories')
    .query(
      Q.where('id', Q.oneOf(historyIds)),
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )
    .fetch()

  if (histories.length === 0) return []

  // 4. Fetch les sessions pour recuperer les noms
  const sessionIds = [...new Set(histories.map(h => h.session.id))]
  const sessions = await database
    .get<Session>('sessions')
    .query(Q.where('id', Q.oneOf(sessionIds)))
    .fetch()

  return buildExerciseStatsFromData(sets, histories, sessions)
}

/**
 * Construit les données de récap exercice par exercice à partir des sets validés
 * en mémoire + lookups DB pour les métadonnées (nom, muscles, prev max weight).
 *
 * @param sessionExercises - SessionExercises de la séance (depuis withObservables)
 * @param validatedSets - Sets validés en mémoire (depuis useWorkoutState)
 * @param historyId - ID de la History en cours (pour exclure du calcul prevMaxWeight)
 * @returns Liste des données de récap par exercice (exercices sans set validé exclus)
 */
export async function buildRecapExercises(
  sessionExercises: SessionExercise[],
  validatedSets: Record<string, ValidatedSetData>,
  historyId: string
): Promise<RecapExerciseData[]> {
  const result: RecapExerciseData[] = []

  for (const se of sessionExercises) {
    const setsTarget = se.setsTarget ?? 0
    const seSets: { reps: number; weight: number }[] = []
    let currMaxWeight = 0

    for (let order = 1; order <= setsTarget; order++) {
      const key = `${se.id}_${order}`
      const validated = validatedSets[key]
      if (validated) {
        seSets.push({ reps: validated.reps, weight: validated.weight })
        if (validated.weight > currMaxWeight) currMaxWeight = validated.weight
      }
    }

    if (seSets.length === 0) continue

    const exercise = await se.exercise.fetch()
    if (!exercise) continue

    const prevMaxWeight = await getMaxWeightForExercise(exercise.id, historyId)

    result.push({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setsValidated: seSets.length,
      setsTarget,
      sets: seSets,
      prevMaxWeight,
      currMaxWeight,
      muscles: exercise.muscles,
    })
  }

  return result
}

/**
 * Retourne les derniers poids enregistrés par exercice et par set_order,
 * en se basant sur la History la plus récente de chaque exercice.
 *
 * Utilisé pour pré-remplir les inputs poids au lancement d'une séance.
 *
 * @param exerciseIds - IDs des exercices de la séance
 * @returns { [exerciseId]: { [setOrder]: { weight, reps } } }
 */
export async function getLastSetsForExercises(
  exerciseIds: string[]
): Promise<Record<string, Record<number, { weight: number; reps: number }>>> {
  if (exerciseIds.length === 0) return {}

  const sets = await database
    .get<WorkoutSet>('sets')
    .query(Q.where('exercise_id', Q.oneOf(exerciseIds)))
    .fetch()

  if (sets.length === 0) return {}

  const historyIdSet = new Set(sets.map(s => s.history.id))
  const historyIds = Array.from(historyIdSet)

  const histories = await database
    .get<History>('histories')
    .query(
      Q.where('id', Q.oneOf(historyIds)),
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false)),
    )
    .fetch()

  if (histories.length === 0) return {}

  const historiesById = new Map(histories.map(h => [h.id, h]))

  const result: Record<string, Record<number, { weight: number; reps: number }>> = {}

  for (const exerciseId of exerciseIds) {
    const exerciseSets = sets.filter(s => s.exercise.id === exerciseId)
    if (exerciseSets.length === 0) continue

    let mostRecentHistory: History | null = null
    let mostRecentTime = 0

    for (const s of exerciseSets) {
      const h = historiesById.get(s.history.id)
      if (!h) continue
      const t = h.startTime.getTime()
      if (t > mostRecentTime) {
        mostRecentTime = t
        mostRecentHistory = h
      }
    }

    if (!mostRecentHistory) continue

    const recentSets = exerciseSets.filter(s => s.history.id === mostRecentHistory!.id)
    const setData: Record<number, { weight: number; reps: number }> = {}
    recentSets.forEach(s => {
      setData[s.setOrder] = { weight: s.weight, reps: s.reps }
    })

    result[exerciseId] = setData
  }

  return result
}
