import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan } from './providerUtils'

export function createOpenAIProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 2048,
          messages: [
            { role: 'user', content: buildPrompt(form, context) },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API erreur ${response.status}`)
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>
      }
      const text = data.choices?.[0]?.message?.content ?? ''
      return parseGeneratedPlan(text)
    },
  }
}
