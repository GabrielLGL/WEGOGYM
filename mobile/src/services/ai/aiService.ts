import { Q } from '@nozbe/watermelondb'
import { database } from '../../model'
import type Exercise from '../../model/models/Exercise'
import type History from '../../model/models/History'
import type PerformanceLog from '../../model/models/PerformanceLog'
import type WorkoutSet from '../../model/models/Set'
import type User from '../../model/models/User'
import { offlineEngine } from './offlineEngine'
import { createClaudeProvider } from './claudeProvider'
import { createOpenAIProvider, testOpenAIConnection } from './openaiProvider'
import { createGeminiProvider, testGeminiConnection } from './geminiProvider'
import type { AIFormData, AIProvider, DBContext, GeneratedPlan, GeneratePlanResult } from './types'
import { generateProgram, toDatabasePlan } from './programGenerator'
import type { UserProfile } from './programGenerator'
import { getApiKey } from '../secureKeyStore'

function selectProvider(aiProvider: string | null, apiKey: string | null): AIProvider {
  if (!apiKey || !aiProvider || aiProvider === 'offline') return offlineEngine
  switch (aiProvider) {
    case 'claude': return createClaudeProvider(apiKey)
    case 'openai': return createOpenAIProvider(apiKey)
    case 'gemini': return createGeminiProvider(apiKey)
    default:       return offlineEngine
  }
}

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
      Q.where('deleted_at', null)
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

export async function generatePlan(form: AIFormData, user: User | null): Promise<GeneratePlanResult> {
  const context = await buildDBContext(form)
  const apiKey = await getApiKey()
  const provider = selectProvider(user?.aiProvider ?? null, apiKey)

  if (provider === offlineEngine) {
    const plan = await offlineEngine.generate(form, context)
    return { plan, usedFallback: false }
  }

  try {
    const plan = await provider.generate(form, context)
    return { plan, usedFallback: false }
  } catch (error) {
    if (__DEV__) console.warn('[aiService] Provider cloud échoué, fallback offline:', error)
    const plan = await offlineEngine.generate(form, context)
    return { plan, usedFallback: true, fallbackReason: user?.aiProvider ?? 'cloud' }
  }
}

export async function testProviderConnection(
  providerName: string,
  apiKey: string
): Promise<void> {
  if (!apiKey || !providerName || providerName === 'offline') return

  if (providerName === 'gemini') {
    await testGeminiConnection(apiKey)
    return
  }

  if (providerName === 'openai') {
    await testOpenAIConnection(apiKey)
    return
  }

  const provider = selectProvider(providerName, apiKey)
  if (provider === offlineEngine) return

  const testForm: AIFormData = {
    mode: 'session',
    goal: 'bodybuilding',
    level: 'débutant',
    equipment: [],
    durationMin: 45,
    muscleGroups: ['Pecs'],
  }
  await provider.generate(testForm, { exercises: [{ name: 'Développé couché', muscles: ['Pecs'] }], recentMuscles: [], prs: {} })
}

/**
 * Génère un plan depuis un profil utilisateur structuré (programGenerator).
 * Alternative offline à generatePlan() qui utilise l'offlineEngine.
 * Utilisable depuis n'importe quel écran sans AIFormData.
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
