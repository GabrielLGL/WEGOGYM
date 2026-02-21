<!-- v1.0 — 2026-02-21 -->
# Rapport — programGenerator — Groupe A : Foundation — 20260221-1725

## Objectif
Créer les types et tables de décision du nouveau module `programGenerator`. Ces fichiers sont
la fondation : aucun autre groupe ne peut démarrer sans eux. Ils ne touchent PAS aux fichiers
existants (zero breaking change).

## Fichiers concernés
- **CRÉER** `mobile/src/services/ai/programGenerator/types.ts`
- **CRÉER** `mobile/src/services/ai/programGenerator/tables.ts`

## Contexte technique

### Projet WEGOGYM
- React Native + WatermelonDB + TypeScript strict (no `any`)
- Dark mode only, French UI, Android priority
- Lire `CLAUDE.md` pour contraintes complètes

### Ce qui EXISTE déjà (ne pas dupliquer)
Dans `mobile/src/services/ai/types.ts` :
```typescript
export type AIGoal = 'bodybuilding' | 'power' | 'renfo' | 'cardio'
export type AILevel = 'débutant' | 'intermédiaire' | 'avancé'
export type ExerciseType = 'compound_heavy' | 'compound' | 'accessory' | 'isolation'
export type InjuryZone = 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque' | 'none'
export interface ExerciseMetadata { type, minLevel, isUnilateral, primaryMuscle, secondaryMuscles, sfr?, stretchFocus?, injuryRisk?, progressionType? }
```

Les noms en DB sont en français :
- Muscles : 'Pecs', 'Dos', 'Quadriceps', 'Ischios', 'Mollets', 'Trapèzes', 'Epaules', 'Biceps', 'Triceps', 'Abdos'
- Equipment : 'Poids libre', 'Machine', 'Poulies', 'Poids du corps'

### Besoin
Créer des types EN (anglais) pour l'algo programGenerator, + constantes de mapping vers FR (DB).

## Étapes

### 1. Créer le dossier
```
mobile/src/services/ai/programGenerator/
```

### 2. Créer `types.ts`
Contenu exact :

```typescript
// ─── Types de base ────────────────────────────────────────────────────────────

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'resistance_band'

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'traps'

export type BodyZone =
  | 'knee' | 'lower_back' | 'shoulder' | 'elbow' | 'hip' | 'neck' | 'ankle'

export type SplitType =
  | 'full_body' | 'half_body' | 'push_pull' | 'push_pull_legs' | 'split'

export type MovementPattern = 'push' | 'pull' | 'legs' | 'core'

// ─── Profil utilisateur ───────────────────────────────────────────────────────

export interface UserProfile {
  goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'general_fitness'
  level: 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek: 2 | 3 | 4 | 5 | 6
  minutesPerSession: number
  equipment: Equipment[]
  // Biométrie (optionnel v1 — non exposé dans wizard actuel)
  age?: number
  weightKg?: number
  heightCm?: number
  // Contraintes
  injuries: BodyZone[]
  posturalIssues: boolean
}

// ─── Output séance / programme ────────────────────────────────────────────────

export interface SetParams {
  sets: number
  repsMin: number
  repsMax: number
  restSeconds: number
  rir: number
  tempoEccentric: number
}

export interface PGSessionExercise {
  exerciseId: string
  exerciseName: string
  musclesPrimary: MuscleGroup[]
  order: number
  params: SetParams
}

export interface PGGeneratedSession {
  dayOfWeek: number          // 1=lundi … 7=dimanche
  sessionType: SplitType
  musclesTargeted: MuscleGroup[]
  totalSets: number
  estimatedMinutes: number
  exercises: PGSessionExercise[]
}

export interface PGGeneratedProgram {
  id: string
  createdAt: Date
  profile: UserProfile
  splitType: SplitType
  weeksCount: number         // 4 en v1
  sessionsPerWeek: PGGeneratedSession[]
  weeklyVolumeByMuscle: Record<MuscleGroup, number>
}

// ─── Mappings FR ↔ EN ─────────────────────────────────────────────────────────
// Utilisés par exerciseSelector pour filtrer la DB WatermelonDB (noms en français)

export const EQUIPMENT_TO_DB: Record<Equipment, string[]> = {
  barbell:         ['Poids libre'],
  dumbbell:        ['Poids libre'],
  cable:           ['Poulies'],
  machine:         ['Machine'],
  bodyweight:      ['Poids du corps'],
  kettlebell:      ['Poids libre'],
  resistance_band: ['Poids libre'],
}

export const MUSCLE_TO_DB: Record<MuscleGroup, string> = {
  chest:      'Pecs',
  back:       'Dos',
  shoulders:  'Epaules',
  biceps:     'Biceps',
  triceps:    'Triceps',
  quads:      'Quadriceps',
  hamstrings: 'Ischios',
  glutes:     'Ischios',   // pas de 'Fessiers' dans le schéma actuel
  calves:     'Mollets',
  core:       'Abdos',
  traps:      'Trapèzes',
}

// InjuryZone (FR, champ injuryRisk dans exerciseMetadata) → BodyZone (EN)
export const INJURY_ZONE_TO_BODY_ZONE: Record<string, BodyZone> = {
  epaules:  'shoulder',
  genoux:   'knee',
  bas_dos:  'lower_back',
  poignets: 'elbow',
  nuque:    'neck',
  none:     'ankle',       // 'none' ignoré dans le filtre
}
```

### 3. Créer `tables.ts`
Contenu exact :

```typescript
import type { MuscleGroup, MovementPattern, SplitType, Equipment } from './types'

// ─── Volume hebdo cible par muscle (séries/semaine) ───────────────────────────

export const WEEKLY_VOLUME_TABLE = {
  hypertrophy: {
    beginner:     { min: 8,  optimal: 10, max: 12 },
    intermediate: { min: 12, optimal: 14, max: 16 },
    advanced:     { min: 16, optimal: 18, max: 20 },
  },
  strength: {
    beginner:     { min: 6,  optimal: 8,  max: 10 },
    intermediate: { min: 8,  optimal: 10, max: 12 },
    advanced:     { min: 10, optimal: 12, max: 15 },
  },
  fat_loss: {
    beginner:     { min: 8,  optimal: 10, max: 12 },
    intermediate: { min: 10, optimal: 12, max: 15 },
    advanced:     { min: 12, optimal: 15, max: 18 },
  },
  general_fitness: {
    beginner:     { min: 6,  optimal: 8,  max: 10 },
    intermediate: { min: 8,  optimal: 10, max: 12 },
    advanced:     { min: 10, optimal: 12, max: 15 },
  },
} as const

// ─── Paramètres d'exécution selon objectif ────────────────────────────────────

export const PARAMS_TABLE = {
  hypertrophy:     { repsMin: 8,  repsMax: 12, rir: 2, restCompound: 120, restIsolation: 90,  tempoEcc: 2 },
  strength:        { repsMin: 1,  repsMax: 5,  rir: 1, restCompound: 240, restIsolation: 180, tempoEcc: 2 },
  fat_loss:        { repsMin: 10, repsMax: 15, rir: 2, restCompound: 90,  restIsolation: 60,  tempoEcc: 2 },
  general_fitness: { repsMin: 10, repsMax: 15, rir: 3, restCompound: 120, restIsolation: 90,  tempoEcc: 2 },
} as const

// ─── Split par défaut selon fréquence ────────────────────────────────────────

export const SPLIT_BY_FREQUENCY: Record<number, SplitType> = {
  2: 'full_body',
  3: 'full_body',
  4: 'half_body',
  5: 'push_pull_legs',
  6: 'push_pull_legs',
}

// ─── Muscles par pattern de mouvement ─────────────────────────────────────────

export const MUSCLES_BY_PATTERN: Record<MovementPattern, MuscleGroup[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps', 'traps'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  core: ['core'],
}

// Inverse : muscle → pattern (dérivé de MUSCLES_BY_PATTERN)
export const MUSCLE_TO_PATTERN: Record<MuscleGroup, MovementPattern> = {
  chest:      'push',
  shoulders:  'push',
  triceps:    'push',
  back:       'pull',
  biceps:     'pull',
  traps:      'pull',
  quads:      'legs',
  hamstrings: 'legs',
  glutes:     'legs',
  calves:     'legs',
  core:       'core',
}

// ─── Limites globales ─────────────────────────────────────────────────────────

export const MAX_SETS_PER_MUSCLE_PER_SESSION = 8
export const MAX_TOTAL_SETS_PER_SESSION = 25
export const MIN_EFFECTIVE_SETS = 4

// ─── Équipement "dumbbell only" (unilatéral préféré) ─────────────────────────

export const DUMBBELL_ONLY_EQUIPMENT: Equipment[] = ['dumbbell']
```

## Contraintes
- **TypeScript strict** : pas de `any`, pas d'imports non utilisés
- **Pas de logique** dans tables.ts — uniquement des données (`as const`)
- **Ne pas modifier** `mobile/src/services/ai/types.ts` existant
- **Pas de `console.log`** dans du code de production

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- Les 2 fichiers sont dans `mobile/src/services/ai/programGenerator/`
- Toutes les clés de `MUSCLE_TO_DB` couvrent tous les `MuscleGroup`
- Toutes les clés de `EQUIPMENT_TO_DB` couvrent tous les `Equipment`

## Dépendances
Aucune — ce groupe peut démarrer immédiatement.

## Statut
⏳ En attente
