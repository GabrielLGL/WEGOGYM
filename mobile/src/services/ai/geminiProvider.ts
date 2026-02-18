import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan } from './providerUtils'

export function createGeminiProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Gemini API erreur ${response.status}`)
      }

      const data = await response.json() as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      return parseGeneratedPlan(text)
    },
  }
}
