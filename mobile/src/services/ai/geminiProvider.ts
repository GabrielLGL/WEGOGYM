import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan, withTimeout } from './providerUtils'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

async function throwGeminiError(response: Response): Promise<never> {
  const errorBody = await response.json().catch(() => ({})) as { error?: { message?: string } }
  throw new Error(`Gemini API erreur ${response.status}: ${errorBody?.error?.message ?? 'Erreur inconnue'}`)
}

export function createGeminiProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const { signal, clear } = withTimeout(30000)
      let response: Response
      try {
        response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: buildPrompt(form, context) }] },
            ],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.7,
            },
          }),
          signal,
        })
      } finally {
        clear()
      }

      if (!response.ok) {
        return throwGeminiError(response)
      }

      const data = await response.json() as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      return parseGeneratedPlan(text)
    },
  }
}

export async function testGeminiConnection(apiKey: string): Promise<void> {
  const { signal, clear } = withTimeout(10000)
  let response: Response
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: 'Réponds uniquement "ok".' }] },
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0,
        },
      }),
      signal,
    })
  } finally {
    clear()
  }

  if (!response.ok) {
    return throwGeminiError(response)
  }
}
