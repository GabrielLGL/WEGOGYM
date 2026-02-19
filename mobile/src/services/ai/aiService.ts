import { Q } from '@nozbe/watermelondb'
import { database } from '../../model'
import type Exercise from '../../model/models/Exercise'
import type History from '../../model/models/History'
import type PerformanceLog from '../../model/models/PerformanceLog'
import type WorkoutSet from '../../model/models/Set'
import type User from '../../model/models/User'
import { offlineEngine } from './offlineEngine'
import { createClaudeProvider } from './claudeProvider'
import { createOpenAIProvider } from './openaiProvider'
import { createGeminiProvider } from './geminiProvider'
import type { AIFormData, AIProvider, DBContext, GeneratedPlan } from './types'

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

  // Filtre par groupe musculaire si mode séance
  const byMuscle = form.muscleGroup
    ? filtered.filter(ex => !ex.muscles || ex.muscles.includes(form.muscleGroup!))
    : filtered

  const exerciseNames = (byMuscle.length > 0 ? byMuscle : filtered).map(ex => ex.name)

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

  // 3. PRs depuis performance_logs
  const prs: Record<string, number> = {}
  const perfLogs = await database.get<PerformanceLog>('performance_logs').query().fetch()

  const exerciseById = new Map(allExercises.map(ex => [ex.id, ex]))
  perfLogs.forEach(log => {
    const ex = exerciseById.get(log.exercise.id)
    if (!ex) return
    if (!prs[ex.name] || log.weight > prs[ex.name]) {
      prs[ex.name] = log.weight
    }
  })

  return {
    exercises: exerciseNames,
    recentMuscles: [...new Set(recentMuscles)],
    prs,
  }
}

export async function generatePlan(form: AIFormData, user: User | null): Promise<GeneratedPlan> {
  const context = await buildDBContext(form)
  const provider = selectProvider(user?.aiProvider ?? null, user?.aiApiKey ?? null)

  try {
    return await provider.generate(form, context)
  } catch (error) {
    console.warn('[aiService] Provider cloud échoué, fallback offline:', error)
    return await offlineEngine.generate(form, context)
  }
}

export async function testProviderConnection(
  providerName: string,
  apiKey: string
): Promise<void> {
  const provider = selectProvider(providerName, apiKey)
  if (provider === offlineEngine) return

  const testForm: AIFormData = {
    mode: 'session',
    goal: 'masse',
    level: 'débutant',
    equipment: [],
    durationMin: 30,
    muscleGroup: 'Pecs',
  }
  await provider.generate(testForm, { exercises: ['Développé couché'], recentMuscles: [], prs: {} })
}
