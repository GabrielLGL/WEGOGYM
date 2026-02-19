import { createClaudeProvider } from '../claudeProvider'
import { createOpenAIProvider } from '../openaiProvider'
import { createGeminiProvider } from '../geminiProvider'
import type { AIFormData, DBContext } from '../types'

// JSON valide conforme à GeneratedPlan
const VALID_PLAN_JSON =
  '{"name":"Test","sessions":[{"name":"S1","exercises":[{"exerciseName":"Squat","setsTarget":3,"repsTarget":"8-12","weightTarget":60}]}]}'

const MALFORMED_JSON = 'not-json'

const testForm: AIFormData = {
  mode: 'session',
  goal: 'masse',
  level: 'débutant',
  equipment: [],
  durationMin: 30,
  muscleGroup: 'Pecs',
}

const testContext: DBContext = {
  exercises: ['Développé couché', 'Squat'],
  recentMuscles: [],
  prs: {},
}

const mockFetch = jest.fn()

beforeAll(() => {
  // Polyfill AbortSignal.timeout si absent (ex: jsdom < Node 18)
  if (!('timeout' in AbortSignal)) {
    ;(AbortSignal as Record<string, unknown>).timeout = (_ms: number) =>
      new AbortController().signal
  }
  global.fetch = mockFetch as unknown as typeof fetch
})

beforeEach(() => {
  mockFetch.mockClear()
})

// ---------------------------------------------------------------------------
// Claude
// ---------------------------------------------------------------------------
describe('createClaudeProvider', () => {
  it("retourne un GeneratedPlan quand l'API répond correctement", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: VALID_PLAN_JSON }] }),
    })

    const provider = createClaudeProvider('test-key')
    const plan = await provider.generate(testForm, testContext)

    expect(plan.name).toBe('Test')
    expect(plan.sessions).toHaveLength(1)
    expect(plan.sessions[0].exercises[0].exerciseName).toBe('Squat')
  })

  it("throw une erreur quand l'API retourne une erreur HTTP (401)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    })

    const provider = createClaudeProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow(
      'Claude API erreur 401',
    )
  })

  it('throw une erreur quand le JSON de réponse est malformé', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: MALFORMED_JSON }] }),
    })

    const provider = createClaudeProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------
describe('createOpenAIProvider', () => {
  it("retourne un GeneratedPlan quand l'API répond correctement", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: VALID_PLAN_JSON } }] }),
    })

    const provider = createOpenAIProvider('test-key')
    const plan = await provider.generate(testForm, testContext)

    expect(plan.name).toBe('Test')
    expect(plan.sessions).toHaveLength(1)
    expect(plan.sessions[0].exercises[0].exerciseName).toBe('Squat')
  })

  it("throw une erreur quand l'API retourne une erreur HTTP (401)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    })

    const provider = createOpenAIProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow(
      'OpenAI API erreur 401',
    )
  })

  it('throw une erreur quand le JSON de réponse est malformé', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: MALFORMED_JSON } }] }),
    })

    const provider = createOpenAIProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------
describe('createGeminiProvider', () => {
  it("retourne un GeneratedPlan quand l'API répond correctement", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: VALID_PLAN_JSON }] } }],
      }),
    })

    const provider = createGeminiProvider('test-key')
    const plan = await provider.generate(testForm, testContext)

    expect(plan.name).toBe('Test')
    expect(plan.sessions).toHaveLength(1)
    expect(plan.sessions[0].exercises[0].exerciseName).toBe('Squat')
  })

  it("throw une erreur quand l'API retourne une erreur HTTP (401)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    })

    const provider = createGeminiProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow(
      'Gemini API erreur 401',
    )
  })

  it('throw une erreur quand le JSON de réponse est malformé', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: MALFORMED_JSON }] } }],
      }),
    })

    const provider = createGeminiProvider('test-key')
    await expect(provider.generate(testForm, testContext)).rejects.toThrow()
  })
})
