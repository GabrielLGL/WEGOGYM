import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan, withTimeout } from './providerUtils'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

export function createClaudeProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const { signal, clear } = withTimeout(30000)
      try {
        const response = await fetch(CLAUDE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 2048,
            messages: [
              { role: 'user', content: buildPrompt(form, context) },
            ],
          }),
          signal,
        })

        if (!response.ok) {
          throw new Error(`Claude API erreur ${response.status}`)
        }

        const data = await response.json() as {
          content: { type: string; text: string }[]
        }
        const text = data.content?.find(c => c.type === 'text')?.text ?? ''
        return parseGeneratedPlan(text)
      } finally {
        clear()
      }
    },
  }
}

export async function testClaudeConnection(apiKey: string): Promise<void> {
  const { signal, clear } = withTimeout(10000)
  try {
    const response = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 10,
        temperature: 0,
        messages: [
          { role: 'user', content: 'Réponds uniquement "ok".' },
        ],
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Claude API erreur ${response.status}`)
    }
  } finally {
    clear()
  }
}
