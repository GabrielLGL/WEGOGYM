import type { AIProvider, AIFormData, DBContext, GeneratedPlan } from './types'
import { buildPrompt, parseGeneratedPlan, withTimeout } from './providerUtils'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export function createOpenAIProvider(apiKey: string): AIProvider {
  return {
    async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> {
      const { signal, clear } = withTimeout(30000)
      let response: Response
      try {
        response = await fetch(OPENAI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
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

      if (response.status === 429) {
        await new Promise<void>(r => setTimeout(r, 1000))
        const retry = withTimeout(30000)
        try {
          response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              max_tokens: 2048,
              messages: [
                { role: 'user', content: buildPrompt(form, context) },
              ],
            }),
            signal: retry.signal,
          })
        } finally {
          retry.clear()
        }
      }

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

export async function testOpenAIConnection(apiKey: string): Promise<void> {
  const { signal, clear } = withTimeout(10000)
  let response: Response
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: 10,
        temperature: 0,
        messages: [
          { role: 'user', content: 'Réponds uniquement "ok".' },
        ],
      }),
      signal,
    })
  } finally {
    clear()
  }

  if (!response.ok) {
    throw new Error(`OpenAI API erreur ${response.status}`)
  }
}
