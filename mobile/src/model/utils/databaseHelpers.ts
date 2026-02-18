import { Q } from '@nozbe/watermelondb'
import type { Clause } from '@nozbe/watermelondb/QueryDescription'
import { database } from '../index'
import Exercise from '../models/Exercise'
import History from '../models/History'
import Program from '../models/Program'
import Session from '../models/Session'
import SessionExercise from '../models/SessionExercise'
import User from '../models/User'
import WorkoutSet from '../models/Set'
import type { LastPerformance } from '../../types/workout'
import type { PresetProgram } from '../onboardingPrograms'
import type { GeneratedPlan, GeneratedSession } from '../../services/ai/types'

/**
 * Stat agregee d'un exercice pour une seance donnee (source : table sets).
 */
export interface ExerciseSessionStat {
  historyId: string
  sessionName: string
  startTime: Date
  maxWeight: number
  sets: Array<{ weight: number; reps: number; setOrder: number }>
}

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
 * Cloture une seance en direct en renseignant end_time.
 *
 * @param historyId - ID de la History a clore
 * @param endTime - Timestamp de fin (Date.now())
 */
export async function completeWorkoutHistory(
  historyId: string,
  endTime: number
): Promise<void> {
  await database.write(async () => {
    const history = await database.get<History>('histories').find(historyId)
    await history.update(h => {
      h.endTime = new Date(endTime)
    })
  })
}

/**
 * Met a jour la note libre d'une seance.
 *
 * @param historyId - ID de la History
 * @param note - Texte de la note
 */
export async function updateHistoryNote(
  historyId: string,
  note: string
): Promise<void> {
  await database.write(async () => {
    const history = await database.get<History>('histories').find(historyId)
    await history.update(h => {
      h.note = note
    })
  })
}

/**
 * Crée une entrée History en base pour démarrer une séance en direct
 *
 * @param sessionId - ID de la session à lancer
 * @param startTime - Timestamp de démarrage (défaut: Date.now())
 * @returns L'instance History créée
 *
 * @example
 * const history = await createWorkoutHistory(session.id, Date.now())
 * historyRef.current = history
 */
export async function createWorkoutHistory(
  sessionId: string,
  startTime: number = Date.now()
): Promise<History> {
  return await database.write(async () => {
    const session = await database.get<Session>('sessions').find(sessionId)
    return await database.get<History>('histories').create(record => {
      record.session.set(session)
      record.startTime = new Date(startTime)
    })
  })
}

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
  const sets = await database
    .get<WorkoutSet>('sets')
    .query(
      Q.where('exercise_id', exerciseId),
      Q.where('history_id', Q.notEq(excludeHistoryId))
    )
    .fetch()

  if (sets.length === 0) return 0
  return Math.max(...sets.map(s => s.weight))
}

/**
 * Sauvegarde une serie reelle effectuee pendant une seance en direct.
 *
 * @param params - Donnees de la serie (historyId, exerciseId, weight, reps, setOrder, isPr)
 * @returns L'instance Set creee
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
 * Retourne la derniere performance enregistree pour un exercice
 * en excluant la seance en cours.
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

  // Fetch toutes les Histories pour comparer les start_time
  const histories = await Promise.all(
    historyIds.map(id => database.get<History>('histories').find(id))
  )

  // La History la plus recente (tri desc par start_time)
  const mostRecent = histories.sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  )[0]

  // Sets de cette seance uniquement
  const recentSets = sets.filter(s => s.history.id === mostRecent.id)

  const maxWeight = Math.max(...recentSets.map(s => s.weight))
  const avgReps = Math.round(
    recentSets.reduce((sum, s) => sum + s.reps, 0) / recentSets.length
  )
  const setsCount = recentSets.length

  return { maxWeight, avgReps, setsCount, date: mostRecent.startTime }
}

/**
 * Formate une date en temps relatif lisible
 *
 * @param date - Date a formater
 * @returns "aujourd'hui" | "hier" | "il y a N jours"
 *
 * @example
 * formatRelativeDate(new Date(Date.now() - 3 * 86400000)) // "il y a 3 jours"
 */
export function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const oneDayMs = 24 * 3600 * 1000

  if (diffMs < oneDayMs) return "aujourd'hui"
  if (diffMs < 2 * oneDayMs) return 'hier'
  return `il y a ${Math.floor(diffMs / oneDayMs)} jours`
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
    .query(Q.where('id', Q.oneOf(historyIds)), Q.where('deleted_at', null))
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
 * Importe un programme pre-configure en base en une seule transaction atomique.
 *
 * Cree le Programme, ses Seances, et les SessionExercises en un seul database.batch().
 * Les exercices introuvables sont ignores silencieusement (console.warn).
 *
 * @param preset - Structure PresetProgram depuis onboardingPrograms.ts
 */
export async function importPresetProgram(preset: PresetProgram): Promise<void> {
  // Lectures hors transaction (operations de lecture)
  const exercises = await database.get<Exercise>('exercises').query().fetch()
  const programCount = await database.get<Program>('programs').query().fetchCount()

  const exercisesByName = new Map(exercises.map(e => [e.name, e]))

  // Preparation de tous les records
  const batch: (Program | Session | SessionExercise)[] = []

  const newProgram = database.get<Program>('programs').prepareCreate(p => {
    p.name = preset.name
    p.position = programCount
  })
  batch.push(newProgram)

  preset.sessions.forEach((presetSession, si) => {
    const newSession = database.get<Session>('sessions').prepareCreate(s => {
      s.program.set(newProgram)
      s.name = presetSession.name
      s.position = si
    })
    batch.push(newSession)

    presetSession.exercises.forEach((presetEx, ei) => {
      const exercise = exercisesByName.get(presetEx.exerciseName)
      if (!exercise) {
        console.warn(`[importPresetProgram] Exercice introuvable : "${presetEx.exerciseName}"`)
        return
      }
      batch.push(
        database.get<SessionExercise>('session_exercises').prepareCreate(se => {
          se.session.set(newSession)
          se.exercise.set(exercise)
          se.setsTarget = presetEx.setsTarget
          se.repsTarget = presetEx.repsTarget
          se.weightTarget = presetEx.weightTarget
          se.position = ei
        })
      )
    })
  })

  await database.write(async () => {
    await database.batch(...batch)
  })
}

/**
 * Marque l'onboarding comme termine pour le premier utilisateur.
 */
export async function markOnboardingCompleted(): Promise<void> {
  await database.write(async () => {
    const users = await database.get<User>('users').query().fetch()
    if (users.length === 0) return
    await users[0].update(u => {
      u.onboardingCompleted = true
    })
  })
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

/**
 * Retourne la liste des noms d'exercices uniques présents dans un plan généré.
 */
function collectExerciseNames(sessions: GeneratedPlan['sessions']): string[] {
  const names = new Set<string>()
  sessions.forEach(s => s.exercises.forEach(e => names.add(e.exerciseName)))
  return Array.from(names)
}

/**
 * Résout tous les noms d'exercices générés par l'IA vers des exercices en DB.
 * Les exercices introuvables sont préparés via prepareCreate pour être inclus
 * dans le batch principal — aucune transaction séparée n'est ouverte.
 *
 * @returns Map nom → Exercise (existant ou prepareCreate prêt pour batch)
 */
function resolveExercisesForBatch(
  names: string[],
  exercisesByName: Map<string, Exercise>,
  exercisesByNameLower: Map<string, Exercise>
): { resolved: Map<string, Exercise>; newExercises: Exercise[] } {
  const resolved = new Map<string, Exercise>()
  const newExercises: Exercise[] = []

  for (const name of names) {
    const exact = exercisesByName.get(name)
    if (exact) { resolved.set(name, exact); continue }

    const lower = exercisesByNameLower.get(name.toLowerCase())
    if (lower) { resolved.set(name, lower); continue }

    // Prépare un nouvel exercice custom pour le batch
    const newEx = database.get<Exercise>('exercises').prepareCreate(ex => {
      ex.name = name
      ex.isCustom = true
    })
    newExercises.push(newEx)
    resolved.set(name, newEx)
  }

  return { resolved, newExercises }
}

/**
 * Importe un plan généré par l'IA en tant que Programme complet.
 * Crée Program + Sessions + SessionExercises + éventuels exercices custom
 * en une seule transaction atomique (un seul database.batch).
 *
 * @param plan - Plan généré par l'IA
 * @returns Le Program créé
 */
export async function importGeneratedPlan(plan: GeneratedPlan): Promise<Program> {
  const exercises = await database.get<Exercise>('exercises').query().fetch()
  const programCount = await database.get<Program>('programs').query().fetchCount()
  const exercisesByName = new Map(exercises.map(e => [e.name, e]))
  const exercisesByNameLower = new Map(exercises.map(e => [e.name.toLowerCase(), e]))

  const names = collectExerciseNames(plan.sessions)
  const { resolved, newExercises } = resolveExercisesForBatch(names, exercisesByName, exercisesByNameLower)

  const newProgram = database.get<Program>('programs').prepareCreate(p => {
    p.name = plan.name
    p.position = programCount
  })

  const sessionRecords: Session[] = []
  const seRecords: SessionExercise[] = []

  plan.sessions.forEach((genSession, si) => {
    const newSession = database.get<Session>('sessions').prepareCreate(s => {
      s.program.set(newProgram)
      s.name = genSession.name
      s.position = si
    })
    sessionRecords.push(newSession)

    genSession.exercises.forEach((genEx, ei) => {
      const exercise = resolved.get(genEx.exerciseName)
      if (!exercise) return
      seRecords.push(
        database.get<SessionExercise>('session_exercises').prepareCreate(se => {
          se.session.set(newSession)
          se.exercise.set(exercise)
          se.setsTarget = genEx.setsTarget
          se.repsTarget = genEx.repsTarget
          se.weightTarget = genEx.weightTarget
          se.position = ei
        })
      )
    })
  })

  await database.write(async () => {
    await database.batch(newProgram, ...newExercises, ...sessionRecords, ...seRecords)
  })

  return newProgram
}

/**
 * Importe une séance générée par l'IA et la rattache à un programme existant.
 * Crée Session + SessionExercises + éventuels exercices custom en une seule transaction.
 *
 * @param genSession - Séance générée
 * @param programId - ID du programme cible
 * @returns La Session créée
 */
export async function importGeneratedSession(
  genSession: GeneratedSession,
  programId: string
): Promise<Session> {
  const exercises = await database.get<Exercise>('exercises').query().fetch()
  const program = await database.get<Program>('programs').find(programId)
  const sessionCount = await database
    .get<Session>('sessions')
    .query(Q.where('program_id', programId))
    .fetchCount()

  const exercisesByName = new Map(exercises.map(e => [e.name, e]))
  const exercisesByNameLower = new Map(exercises.map(e => [e.name.toLowerCase(), e]))

  const names = genSession.exercises.map(e => e.exerciseName)
  const { resolved, newExercises } = resolveExercisesForBatch(names, exercisesByName, exercisesByNameLower)

  const newSession = database.get<Session>('sessions').prepareCreate(s => {
    s.program.set(program)
    s.name = genSession.name
    s.position = sessionCount
  })

  const seBatch = genSession.exercises
    .map((genEx, ei) => {
      const exercise = resolved.get(genEx.exerciseName)
      if (!exercise) return null
      return database.get<SessionExercise>('session_exercises').prepareCreate(se => {
        se.session.set(newSession)
        se.exercise.set(exercise)
        se.setsTarget = genEx.setsTarget
        se.repsTarget = genEx.repsTarget
        se.weightTarget = genEx.weightTarget
        se.position = ei
      })
    })
    .filter((se): se is SessionExercise => se !== null)

  await database.write(async () => {
    await database.batch(newSession, ...newExercises, ...seBatch)
  })

  return newSession
}
