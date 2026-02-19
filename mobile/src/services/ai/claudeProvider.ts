import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan, withTimeout } from './providerUtils'

export function createClaudeProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const { signal, clear } = withTimeout(30000)
      let response: Response
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            messages: [
              { role: 'user', content: buildPrompt(form, context) },
            ],
          }),
          signal,
        })
      } finally {
        clear()
      }

      if (!response.ok) {
        throw new Error(`Claude API erreur ${response.status}`)
      }

      const data = await response.json() as {
        content: Array<{ type: string; text: string }>
      }
      const text = data.content?.find(c => c.type === 'text')?.text ?? ''
      return parseGeneratedPlan(text)
    },
  }
}
