// Mocks AVANT les imports (hoistés par Jest)
jest.mock('@nozbe/watermelondb', () => ({
  Q: {
    where: jest.fn().mockReturnValue({}),
    gte:   jest.fn().mockReturnValue({}),
    oneOf: jest.fn().mockReturnValue({}),
    sortBy: jest.fn().mockReturnValue({}),
    take:  jest.fn().mockReturnValue({}),
    desc:  'desc',
  },
}))

jest.mock('../../../model', () => ({
  database: {
    get: jest.fn().mockReturnValue({
      query: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

jest.mock('../offlineEngine', () => ({
  offlineEngine: {
    generate: jest.fn().mockResolvedValue({ name: 'Plan Offline', sessions: [] }),
  },
}))

jest.mock('../claudeProvider', () => ({
  createClaudeProvider: jest.fn().mockReturnValue({
    generate: jest.fn().mockResolvedValue({ name: 'Plan Claude', sessions: [] }),
  }),
}))

jest.mock('../openaiProvider', () => ({
  createOpenAIProvider: jest.fn().mockReturnValue({
    generate: jest.fn().mockResolvedValue({ name: 'Plan OpenAI', sessions: [] }),
  }),
}))

jest.mock('../geminiProvider', () => ({
  createGeminiProvider: jest.fn().mockReturnValue({
    generate: jest.fn().mockResolvedValue({ name: 'Plan Gemini', sessions: [] }),
  }),
  testGeminiConnection: jest.fn().mockResolvedValue(undefined),
}))

import { generatePlan, testProviderConnection } from '../aiService'
import { createClaudeProvider } from '../claudeProvider'
import { createOpenAIProvider } from '../openaiProvider'
import { createGeminiProvider, testGeminiConnection } from '../geminiProvider'
import { offlineEngine } from '../offlineEngine'
import { database } from '../../../model'
import type { AIFormData } from '../types'

const mockDbGet = database.get as jest.Mock

const testForm: AIFormData = {
  mode: 'session',
  goal: 'bodybuilding',
  level: 'débutant',
  equipment: [],
  durationMin: 45,
  muscleGroups: ['Pecs'],
}

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generatePlan — sélection du provider', () => {
    it('utilise offlineEngine si user est null', async () => {
      const plan = await generatePlan(testForm, null)

      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
      expect(createClaudeProvider).not.toHaveBeenCalled()
      expect(plan.name).toBe('Plan Offline')
    })

    it("utilise offlineEngine si aiProvider est 'offline'", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { aiProvider: 'offline', aiApiKey: 'any-key' } as any
      const plan = await generatePlan(testForm, user)

      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
      expect(createClaudeProvider).not.toHaveBeenCalled()
      expect(plan.name).toBe('Plan Offline')
    })

    it('utilise offlineEngine si aiApiKey est null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { aiProvider: 'claude', aiApiKey: null } as any
      const plan = await generatePlan(testForm, user)

      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
      expect(createClaudeProvider).not.toHaveBeenCalled()
      expect(plan.name).toBe('Plan Offline')
    })

    it("utilise claudeProvider si aiProvider='claude' avec clé valide", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { aiProvider: 'claude', aiApiKey: 'sk-ant-test-key' } as any
      const plan = await generatePlan(testForm, user)

      expect(createClaudeProvider).toHaveBeenCalledWith('sk-ant-test-key')
      expect(offlineEngine.generate as jest.Mock).not.toHaveBeenCalled()
      expect(plan.name).toBe('Plan Claude')
    })

    it('retombe sur offlineEngine si le provider cloud throw', async () => {
      ;(createClaudeProvider as jest.MockedFunction<typeof createClaudeProvider>)
        .mockReturnValueOnce({
          generate: jest.fn().mockRejectedValue(new Error('API unavailable')),
        })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = { aiProvider: 'claude', aiApiKey: 'sk-ant-test-key' } as any
      const plan = await generatePlan(testForm, user)

      expect(createClaudeProvider).toHaveBeenCalledWith('sk-ant-test-key')
      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
      expect(plan.name).toBe('Plan Offline')
    })
  })

  describe('testProviderConnection', () => {
    it("retourne immédiatement si provider='offline'", async () => {
      await testProviderConnection('offline', 'any-key')

      expect(createClaudeProvider).not.toHaveBeenCalled()
      expect(createOpenAIProvider).not.toHaveBeenCalled()
      expect(createGeminiProvider).not.toHaveBeenCalled()
    })

    it("appelle provider.generate si provider='claude'", async () => {
      await testProviderConnection('claude', 'sk-ant-test-key')

      expect(createClaudeProvider).toHaveBeenCalledWith('sk-ant-test-key')
      const provider = (createClaudeProvider as jest.Mock).mock.results[0].value as { generate: jest.Mock }
      expect(provider.generate).toHaveBeenCalled()
    })

    it("appelle testGeminiConnection si provider='gemini'", async () => {
      await testProviderConnection('gemini', 'ai-google-test-key')

      expect(testGeminiConnection as jest.Mock).toHaveBeenCalledWith('ai-google-test-key')
      expect(createGeminiProvider).not.toHaveBeenCalled()
    })

    it("retourne immédiatement si apiKey est vide", async () => {
      await testProviderConnection('claude', '')

      expect(createClaudeProvider).not.toHaveBeenCalled()
    })

    it("retourne immédiatement si providerName est vide", async () => {
      await testProviderConnection('', 'some-key')

      expect(createClaudeProvider).not.toHaveBeenCalled()
    })

    it("appelle openaiProvider si provider='openai'", async () => {
      await testProviderConnection('openai', 'sk-openai-key')

      expect(createOpenAIProvider).toHaveBeenCalledWith('sk-openai-key')
    })
  })

  describe('generatePlan — buildDBContext branches', () => {
    // Helper pour configurer le mock de database.get par table
    function setupMockDB({
      exercises = [] as Array<{ id: string; name: string; muscles: string[]; equipment?: string }>,
      histories = [] as Array<{ id: string }>,
      sets = [] as Array<{ exercise: { id: string } }>,
      recentExercises = [] as Array<{ id: string; name: string; muscles: string[]; equipment?: string }>,
      performanceLogs = [] as Array<{ exercise: { id: string }; weight: number }>,
    } = {}) {
      let exerciseFetchCount = 0
      mockDbGet.mockImplementation((table: string) => {
        if (table === 'exercises') {
          exerciseFetchCount++
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(
                exerciseFetchCount === 1 ? exercises : recentExercises
              ),
            }),
          }
        }
        if (table === 'histories') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(histories),
            }),
          }
        }
        if (table === 'sets') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(sets),
            }),
          }
        }
        if (table === 'performance_logs') {
          return {
            query: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(performanceLogs),
            }),
          }
        }
        return { query: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue([]) }) }
      })
    }

    beforeEach(() => {
      jest.clearAllMocks()
      ;(offlineEngine.generate as jest.Mock).mockResolvedValue({ name: 'Plan Offline', sessions: [] })
    })

    it('filtre les exercices par equipment quand form.equipment est renseigné', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Leg Press', muscles: ['Quadriceps'], equipment: 'Machine' },
        { id: 'e3', name: 'Curl', muscles: ['Biceps'], equipment: undefined },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: ['Haltères'], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      // Only 'Poids libre' + no equipment exercises pass the filter
      expect(context.exercises.some((e: { name: string }) => e.name === 'Bench Press')).toBe(true)
      expect(context.exercises.some((e: { name: string }) => e.name === 'Leg Press')).toBe(false)
    })

    it('filtre les exercices par muscleGroups quand défini et non vide', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
        { id: 'e3', name: 'Pompes', muscles: [], equipment: 'Poids du corps' },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: ['Pectoraux'] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      // Only 'Pectoraux' + no muscles exercises pass the muscle filter
      expect(context.exercises.some((e: { name: string }) => e.name === 'Bench Press')).toBe(true)
      expect(context.exercises.some((e: { name: string }) => e.name === 'Squat')).toBe(false)
    })

    it('retourne tous les exercices si muscleGroups est vide', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: 'Poids libre' },
        { id: 'e2', name: 'Squat', muscles: ['Quadriceps'], equipment: 'Poids libre' },
      ]
      setupMockDB({ exercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.exercises).toHaveLength(2)
    })

    it('collecte les muscles récents depuis les histories + sets des 7 derniers jours', async () => {
      const exercises = [
        { id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' },
      ]
      const histories = [{ id: 'h1' }]
      const sets = [{ exercise: { id: 'e1' } }]
      const recentExercises = [{ id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' }]
      setupMockDB({ exercises, histories, sets, recentExercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.recentMuscles).toContain('Pectoraux')
    })

    it('ignore les exercises sans muscles dans recentMuscles', async () => {
      const exercises = [{ id: 'e1', name: 'Exercice Vide', muscles: [], equipment: '' }]
      const histories = [{ id: 'h1' }]
      const sets = [{ exercise: { id: 'e1' } }]
      const recentExercises = [{ id: 'e1', name: 'Exercice Vide', muscles: [], equipment: '' }]
      setupMockDB({ exercises, histories, sets, recentExercises })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.recentMuscles).toHaveLength(0)
    })

    it('ne fetch pas les sets si aucune history récente', async () => {
      setupMockDB({ exercises: [], histories: [], sets: [] })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      // sets table should not have been queried
      const setsCallMade = mockDbGet.mock.calls.some((call: string[]) => call[0] === 'sets')
      expect(setsCallMade).toBe(false)
    })

    it('construit les PRs depuis performance_logs pour les exercices connus', async () => {
      const exercises = [{ id: 'e1', name: 'Bench Press', muscles: ['Pectoraux'], equipment: '' }]
      const performanceLogs = [
        { exercise: { id: 'e1' }, weight: 100 },
        { exercise: { id: 'e1' }, weight: 80 },
        { exercise: { id: 'unknown' }, weight: 200 },
      ]
      setupMockDB({ exercises, performanceLogs })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.prs['Bench Press']).toBe(100)
      expect(context.prs['unknown']).toBeUndefined()
    })

    it('garde le max poids quand plusieurs logs pour un même exercice', async () => {
      const exercises = [{ id: 'e1', name: 'Squat', muscles: ['Quadriceps'], equipment: '' }]
      const performanceLogs = [
        { exercise: { id: 'e1' }, weight: 60 },
        { exercise: { id: 'e1' }, weight: 120 },
        { exercise: { id: 'e1' }, weight: 100 },
      ]
      setupMockDB({ exercises, performanceLogs })

      const form: AIFormData = { ...testForm, equipment: [], muscleGroups: [] }
      const user = { aiProvider: 'offline', aiApiKey: null } as any
      await generatePlan(form, user)

      const context = (offlineEngine.generate as jest.Mock).mock.calls[0][1]
      expect(context.prs['Squat']).toBe(120)
    })

    it("utilise openai provider si aiProvider='openai' avec clé", async () => {
      setupMockDB({ exercises: [] })

      const user = { aiProvider: 'openai', aiApiKey: 'sk-openai-key' } as any
      await generatePlan(testForm, user)

      expect(createOpenAIProvider).toHaveBeenCalledWith('sk-openai-key')
    })

    it("utilise gemini provider si aiProvider='gemini' avec clé", async () => {
      setupMockDB({ exercises: [] })

      const user = { aiProvider: 'gemini', aiApiKey: 'ai-gemini-key' } as any
      await generatePlan(testForm, user)

      expect(createGeminiProvider).toHaveBeenCalledWith('ai-gemini-key')
    })

    it("utilise offlineEngine pour un aiProvider inconnu", async () => {
      setupMockDB({ exercises: [] })

      const user = { aiProvider: 'unknown_provider', aiApiKey: 'some-key' } as any
      await generatePlan(testForm, user)

      expect(offlineEngine.generate as jest.Mock).toHaveBeenCalled()
    })
  })
})
