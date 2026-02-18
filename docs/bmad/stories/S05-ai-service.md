# S05 — Service IA orchestrateur + collecte contexte DB
> Priorité : Must | Dépend de : S02, S03, S04 | Bloque : S06

## Objectif
Créer le service principal qui sélectionne le provider, collecte le contexte DB, et gère le fallback.

## Tâches techniques
Créer `mobile/src/services/ai/aiService.ts` :

### Collecte du contexte DB
```ts
async function buildDBContext(): Promise<DBContext> {
  // 1. Tous les noms d'exercices disponibles
  const exercises = await database.get('exercises').query().fetch()

  // 2. Muscles travaillés les 7 derniers jours (via histories + sets)
  // 3. PRs : pour chaque exercice, max weight depuis performance_logs
  return { exercises: [...], recentMuscles: [...], prs: {...} }
}
```

### Sélection du provider
```ts
function selectProvider(aiProvider: string | null, apiKey: string | null): AIProvider {
  if (!apiKey || !aiProvider || aiProvider === 'offline') return offlineEngine
  switch (aiProvider) {
    case 'claude':  return createClaudeProvider(apiKey)
    case 'openai':  return createOpenAIProvider(apiKey)
    case 'gemini':  return createGeminiProvider(apiKey)
    default:        return offlineEngine
  }
}
```

### Fonction principale avec fallback
```ts
export async function generatePlan(
  form: AIFormData,
  user: User
): Promise<GeneratedPlan> {
  const context = await buildDBContext()
  const provider = selectProvider(user.aiProvider, user.aiApiKey)
  try {
    return await provider.generate(form, context)
  } catch (error) {
    console.warn('[aiService] Provider failed, fallback offline:', error)
    return await offlineEngine.generate(form, context)
  }
}
```

## Critères d'acceptation
- [ ] Retourne toujours un `GeneratedPlan` (jamais de throw non catchée)
- [ ] Fallback offline automatique si provider cloud échoue
- [ ] Contexte DB correctement collecté (exercices, muscles récents, PRs)
- [ ] Offline engine utilisé par défaut si pas de clé API
