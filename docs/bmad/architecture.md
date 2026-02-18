# Architecture — Assistant IA WEGOGYM
> Date : 2026-02-18 | Phase 5 validée

## Vue d'ensemble

```
mobile/src/
├── screens/
│   └── AssistantScreen.tsx          ← Écran principal (form + navigation)
├── services/
│   └── ai/
│       ├── types.ts                 ← Interfaces partagées
│       ├── offlineEngine.ts         ← Moteur de règles (défaut)
│       ├── claudeProvider.ts        ← Anthropic API
│       ├── openaiProvider.ts        ← OpenAI API
│       ├── geminiProvider.ts        ← Google Gemini
│       └── aiService.ts             ← Orchestrateur (sélection provider + fallback)
└── components/
    └── AssistantPreviewSheet.tsx    ← Bottom sheet aperçu + validation
```

## 1. Types (`services/ai/types.ts`)

```ts
interface AIFormData {
  mode: 'program' | 'session'
  goal: 'masse' | 'force' | 'perte' | 'cardio'
  level: 'débutant' | 'intermédiaire' | 'avancé'
  equipment: string[]
  daysPerWeek?: number
  durationMin: 30 | 45 | 60 | 90
  muscleGroup?: string
}

interface GeneratedPlan {
  name: string
  sessions: Array<{
    name: string
    exercises: Array<{
      exerciseName: string
      setsTarget: number
      repsTarget: string
      weightTarget: number
    }>
  }>
}

interface AIProvider {
  generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan>
}

interface DBContext {
  exercises: string[]
  recentMuscles: string[]
  prs: Record<string, number>
}
```

## 2. Migration DB — Schema v16

Ajout dans `users` :
```ts
{ name: 'ai_provider', type: 'string', isOptional: true },
{ name: 'ai_api_key',  type: 'string', isOptional: true },
```

Champs User.ts :
```ts
@field('ai_provider') aiProvider!: string | null
@text('ai_api_key')   aiApiKey!: string | null
```

## 3. Navigation

Ajout d'un 4ème onglet dans `navigation/index.tsx` :
```
Tab.Navigator
  ├── Exercices   (🏋️)
  ├── Home        (🏠)
  ├── Assistant   (✨)  ← NOUVEAU
  └── Stats       (📈)
```

## 4. Moteur offline

Logique pure dans `offlineEngine.ts` :
- Sélection exercices filtrés par équipement + groupe musculaire
- Répartition musculaire (Push/Pull/Legs ou Full Body selon daysPerWeek)
- Séries/reps selon objectif : masse → 4×8, force → 5×5, cardio → 3×15, perte → 3×12
- Pas de répétition du même groupe musculaire deux jours consécutifs

## 5. Providers cloud

Pattern commun pour Claude, OpenAI, Gemini :
- Prompt système avec contexte DB injecté
- Réponse JSON → `parseGeneratedPlan()` → `GeneratedPlan`
- Si parsing échoue → throw Error → fallback offline dans `aiService.ts`

## 6. Orchestrateur (`aiService.ts`)

```ts
async function generatePlan(form, userSettings, dbContext): Promise<GeneratedPlan> {
  const provider = selectProvider(userSettings) // offline par défaut
  try {
    return await provider.generate(form, dbContext)
  } catch {
    return await offlineEngine.generate(form, dbContext)
  }
}
```

## 7. Insertion DB

`GeneratedPlan` est compatible avec `PresetProgram` → réutilisation directe de `importPresetProgram()`.

### Mode séance standalone
La relation `Session → program_id` est requise. En mode "Séance", le formulaire inclut un sélecteur
"Ajouter à quel programme ?" (liste des programmes existants en DB via `withObservables`).
La séance générée est rattachée au programme choisi par l'utilisateur.

## Impacts sur le code existant

| Fichier | Modification |
|---------|-------------|
| `model/schema.ts` | v15 → v16, 2 champs `users` |
| `model/models/User.ts` | +2 décorateurs `@field` |
| `navigation/index.tsx` | +1 onglet tab, +1 import |
| `screens/SettingsScreen.tsx` | +1 section "IA" (provider + clé API) |
| `model/utils/databaseHelpers.ts` | Aucun changement (réutilisation) |
