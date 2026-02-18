# S02 — Types & Interfaces IA
> Priorité : Must | Dépend de : S01 | Bloque : S03, S04, S05, S06

## Objectif
Créer le fichier de types partagés pour tout le système IA.

## Tâches techniques
Créer `mobile/src/services/ai/types.ts` avec :

```ts
export type AIGoal = 'masse' | 'force' | 'perte' | 'cardio'
export type AILevel = 'débutant' | 'intermédiaire' | 'avancé'
export type AIProviderName = 'offline' | 'claude' | 'openai' | 'gemini'
export type AIDuration = 30 | 45 | 60 | 90

export interface AIFormData {
  mode: 'program' | 'session'
  goal: AIGoal
  level: AILevel
  equipment: string[]
  daysPerWeek?: number
  durationMin: AIDuration
  muscleGroup?: string
  targetProgramId?: string  // mode session uniquement
}

export interface GeneratedExercise {
  exerciseName: string
  setsTarget: number
  repsTarget: string
  weightTarget: number
}

export interface GeneratedSession {
  name: string
  exercises: GeneratedExercise[]
}

export interface GeneratedPlan {
  name: string
  sessions: GeneratedSession[]
}

export interface DBContext {
  exercises: string[]
  recentMuscles: string[]
  prs: Record<string, number>
}

export interface AIProvider {
  generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan>
}
```

## Critères d'acceptation
- [ ] Fichier créé sans erreur TypeScript
- [ ] Tous les types exportés
- [ ] Pas de `any`
