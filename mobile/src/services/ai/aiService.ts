/**
 * aiService.ts — Point d'entrée pour la génération de programmes/séances par IA
 *
 * Responsabilités :
 * 1. Construction du contexte DB (exercices filtrés, muscles récents, PRs)
 * 2. Génération via le moteur offline (10 splits, 4 objectifs, sans coût API)
 */

import { Q } from '@nozbe/watermelondb'
import { database } from '../../model'
import type Exercise from '../../model/models/Exercise'
import type History from '../../model/models/History'
import type PerformanceLog from '../../model/models/PerformanceLog'
import type WorkoutSet from '../../model/models/Set'
import { offlineEngine } from './offlineEngine'
import type { AIFormData, DBContext, GeneratedPlan, GeneratePlanResult } from './types'
import { generateProgram, toDatabasePlan } from './programGenerator'
import type { UserProfile } from './programGenerator'

/**
 * Construit le contexte DB nécessaire à la génération.
 * Récupère :
 * - Les exercices filtrés par équipement sélectionné et groupes musculaires
 * - Les muscles travaillés dans les 7 derniers jours (pour favoriser la variété)
 * - Les PRs des 30 derniers jours via performance_logs (pour calculer les charges)
 */
async function buildDBContext(form: AIFormData): Promise<DBContext> {
  // 1. Noms des exercices filtrés par équipement si possible
  const allExercises = await database.get<Exercise>('exercises').query().fetch()

  const equipmentMap: Record<string, string> = {
    'Haltères':       'Poids libre',
    'Barre & disques':'Poids libre',
    'Machines':       'Machine',
    'Poulies':        'Poulies',
    'Poids du corps': 'Poids du corps',
  }

  const mappedEquipment = form.equipment
    .map(e => equipmentMap[e] ?? e)
    .filter(Boolean)

  const filtered = mappedEquipment.length > 0
    ? allExercises.filter(ex =>
        !ex.equipment || mappedEquipment.includes(ex.equipment)
      )
    : allExercises

  // Filtre par groupes musculaires si mode séance
  const byMuscle = form.muscleGroups && form.muscleGroups.length > 0
    ? filtered.filter(ex => !ex.muscles || form.muscleGroups!.some(mg => ex.muscles.includes(mg)))
    : filtered

  const exerciseInfos = (byMuscle.length > 0 ? byMuscle : filtered).map(ex => ({ name: ex.name, muscles: ex.muscles ?? [] }))

  // 2. Muscles travaillés les 7 derniers jours
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentHistories = await database
    .get<History>('histories')
    .query(
      Q.where('start_time', Q.gte(sevenDaysAgo)),
      Q.where('deleted_at', null),
      Q.or(Q.where('is_abandoned', null), Q.where('is_abandoned', false))
    )
    .fetch()

  const recentHistoryIds = recentHistories.map(h => h.id)
  const recentMuscles: string[] = []

  if (recentHistoryIds.length > 0) {
    const recentSets = await database
      .get<WorkoutSet>('sets')
      .query(Q.where('history_id', Q.oneOf(recentHistoryIds)))
      .fetch()

    const recentExerciseIds = [...new Set(recentSets.map(s => s.exercise.id))]
    if (recentExerciseIds.length > 0) {
      const recentExercises = await database
        .get<Exercise>('exercises')
        .query(Q.where('id', Q.oneOf(recentExerciseIds)))
        .fetch()

      recentExercises.forEach(ex => {
        if (ex.muscles.length > 0) recentMuscles.push(...ex.muscles)
      })
    }
  }

  // 3. PRs depuis performance_logs (30 derniers jours, top 50 par poids desc)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const prs: Record<string, number> = {}
  const perfLogs = await database
    .get<PerformanceLog>('performance_logs')
    .query(
      Q.where('created_at', Q.gte(thirtyDaysAgo)),
      Q.sortBy('weight', Q.desc),
      Q.take(50)
    )
    .fetch()

  const exerciseById = new Map(allExercises.map(ex => [ex.id, ex]))
  perfLogs.forEach(log => {
    const ex = exerciseById.get(log.exercise.id)
    if (!ex) return
    if (!prs[ex.name] || log.weight > prs[ex.name]) {
      prs[ex.name] = log.weight
    }
  })

  return {
    exercises: exerciseInfos,
    recentMuscles: [...new Set(recentMuscles)],
    prs,
  }
}

/**
 * Génère un plan (programme ou séance) via le moteur offline.
 */
export async function generatePlan(form: AIFormData): Promise<GeneratePlanResult> {
  const context = await buildDBContext(form)
  const plan = await offlineEngine.generate(form, context)
  return { plan, usedFallback: false }
}

/**
 * Génère un plan depuis un profil utilisateur structuré (programGenerator).
 *
 * @param profile - Profil utilisateur typé (goal, level, equipment, injuries, etc.)
 * @param programName - Nom du programme à créer
 * @returns GeneratedPlan compatible avec importGeneratedPlan()
 */
export async function generateFromProfile(
  profile: UserProfile,
  programName: string,
): Promise<GeneratedPlan> {
  const program = await generateProgram(profile, database)
  return toDatabasePlan(program, programName)
}

export type { UserProfile }
