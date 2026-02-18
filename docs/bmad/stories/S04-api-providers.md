# S04 — Providers API (Claude, OpenAI, Gemini)
> Priorité : Should | Dépend de : S02 | Bloque : S06

## Objectif
Implémenter les 3 adaptateurs cloud qui appellent les APIs IA et retournent un `GeneratedPlan`.

## Tâches techniques

### Prompt système commun (partagé dans un helper)
```ts
function buildPrompt(form: AIFormData, context: DBContext): string {
  return `Tu es un coach sportif expert. Génère un ${form.mode === 'program' ? 'programme' : 'séance'}
  en JSON valide avec ce format exact :
  { "name": "...", "sessions": [{ "name": "...", "exercises": [{
    "exerciseName": "...", "setsTarget": 0, "repsTarget": "...", "weightTarget": 0
  }]}]}
  Contraintes : objectif=${form.goal}, niveau=${form.level}, durée=${form.durationMin}min
  ${form.mode === 'program' ? `jours/semaine=${form.daysPerWeek}` : `muscle=${form.muscleGroup}`}
  Utilise UNIQUEMENT ces exercices : ${context.exercises.slice(0, 50).join(', ')}
  PRs connus : ${JSON.stringify(context.prs)}
  Réponds UNIQUEMENT avec le JSON, sans texte autour.`
}
```

### Parser défensif commun
```ts
function parseGeneratedPlan(raw: string): GeneratedPlan {
  const json = JSON.parse(raw.trim().replace(/^```json\n?/, '').replace(/\n?```$/, ''))
  // Validation structure minimale
  if (!json.name || !Array.isArray(json.sessions)) throw new Error('Invalid plan structure')
  return json as GeneratedPlan
}
```

### `claudeProvider.ts`
- Endpoint : `https://api.anthropic.com/v1/messages`
- Model : `claude-haiku-4-5-20251001` (rapide + économique)
- Headers : `x-api-key`, `anthropic-version: 2023-06-01`

### `openaiProvider.ts`
- Endpoint : `https://api.openai.com/v1/chat/completions`
- Model : `gpt-4o-mini`
- Headers : `Authorization: Bearer {key}`

### `geminiProvider.ts`
- SDK : `@google/generative-ai`
- Model : `gemini-1.5-flash`

## Critères d'acceptation
- [ ] Chaque provider retourne un `GeneratedPlan` valide sur une clé correcte
- [ ] Parser défensif : si JSON invalide → throw Error (pas de crash)
- [ ] Clé API jamais loggée (pas de console.log sur les headers)
- [ ] Timeout 30s sur les requêtes
