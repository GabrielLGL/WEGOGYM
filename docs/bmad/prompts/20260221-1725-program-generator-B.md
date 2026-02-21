<!-- v1.0 — 2026-02-21 -->
# Rapport — programGenerator — Groupe B : Algorithmes purs — 20260221-1725

## Objectif
Créer les deux modules d'algorithmes purs (zéro DB, zéro réseau) du programGenerator :
- `splitStrategy.ts` — détermine le split et le planning hebdomadaire
- `volumeCalculator.ts` — calcule et distribue le volume par muscle

Ces fonctions sont **déterministes et testables unitairement** sans mock.

## Fichiers concernés
- **CRÉER** `mobile/src/services/ai/programGenerator/splitStrategy.ts`
- **CRÉER** `mobile/src/services/ai/programGenerator/volumeCalculator.ts`

## Contexte technique

### Dossier créé par Groupe A
`mobile/src/services/ai/programGenerator/` contient déjà :
- `types.ts` — UserProfile, MuscleGroup, SplitType, MovementPattern, BodyZone
- `tables.ts` — WEEKLY_VOLUME_TABLE, PARAMS_TABLE, SPLIT_BY_FREQUENCY, MUSCLES_BY_PATTERN, MUSCLE_TO_PATTERN, MAX_*, MIN_*

### Projet WEGOGYM
- React Native + TypeScript strict (no `any`)
- Lire `CLAUDE.md` pour contraintes complètes

## Étapes

### 1. Créer `splitStrategy.ts`

```typescript
import type { UserProfile, SplitType, MuscleGroup, MovementPattern } from './types'
import { SPLIT_BY_FREQUENCY, MUSCLES_BY_PATTERN } from './tables'

/**
 * Détermine le split optimal selon fréquence, objectif et niveau.
 *
 * Règles (priorité décroissante) :
 * 1. Débutant + daysPerWeek ≤ 4 → toujours 'full_body'
 * 2. Strength + advanced + daysPerWeek ≥ 4 → 'split'
 * 3. Strength + (intermediate|advanced) + daysPerWeek ≥ 5 → 'push_pull_legs'
 * 4. daysPerWeek = 4 + (intermediate|advanced) → 'half_body'
 * 5. Par défaut → SPLIT_BY_FREQUENCY[daysPerWeek]
 */
export function determineSplit(profile: UserProfile): SplitType {
  const { goal, level, daysPerWeek } = profile

  if (level === 'beginner' && daysPerWeek <= 4) return 'full_body'

  if (goal === 'strength' && level === 'advanced' && daysPerWeek >= 4) return 'split'

  if (goal === 'strength' && level !== 'beginner' && daysPerWeek >= 5) return 'push_pull_legs'

  if (daysPerWeek === 4 && level !== 'beginner') return 'half_body'

  return SPLIT_BY_FREQUENCY[daysPerWeek] ?? 'full_body'
}

/**
 * Retourne la liste des muscles cibles pour chaque séance de la semaine.
 *
 * Ex : PPL 6j → [[chest,shoulders,triceps], [back,biceps,traps], [quads,hamstrings,glutes,calves], ...]
 * Ex : full_body 3j → [[chest,back,shoulders,biceps,triceps,quads,hamstrings,glutes,calves,core], ...]
 * Ex : half_body 4j → [[chest,shoulders,triceps,core], [back,biceps,traps,quads,hamstrings,glutes,calves], ...]
 * Ex : split 4j → jour1: push, jour2: pull, jour3: legs, jour4: push (rotation)
 */
export function buildWeeklySchedule(split: SplitType, daysPerWeek: number): MuscleGroup[][] {
  const push = MUSCLES_BY_PATTERN.push
  const pull = MUSCLES_BY_PATTERN.pull
  const legs = MUSCLES_BY_PATTERN.legs
  const core = MUSCLES_BY_PATTERN.core
  const upper: MuscleGroup[] = [...push, ...pull]
  const lower: MuscleGroup[] = [...legs, ...core]
  const allMuscles: MuscleGroup[] = [...upper, ...lower]

  switch (split) {
    case 'full_body':
      return Array.from({ length: daysPerWeek }, () => allMuscles)

    case 'half_body': {
      const pattern: MuscleGroup[][] = [
        [...push, ...core],
        [...pull, ...legs],
      ]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 2])
    }

    case 'push_pull': {
      const pattern: MuscleGroup[][] = [push, pull]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 2])
    }

    case 'push_pull_legs': {
      const pattern: MuscleGroup[][] = [push, pull, legs]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % 3])
    }

    case 'split': {
      // Jour 1: chest+triceps, Jour 2: back+biceps, Jour 3: legs, Jour 4: shoulders+traps
      const pattern: MuscleGroup[][] = [
        ['chest', 'triceps', 'core'],
        ['back', 'biceps', 'traps'],
        ['quads', 'hamstrings', 'glutes', 'calves'],
        ['shoulders', 'traps', 'core'],
      ]
      return Array.from({ length: daysPerWeek }, (_, i) => pattern[i % pattern.length])
    }

    default:
      return Array.from({ length: daysPerWeek }, () => allMuscles)
  }
}
```

### 2. Créer `volumeCalculator.ts`

```typescript
import type { UserProfile, MuscleGroup } from './types'
import {
  WEEKLY_VOLUME_TABLE,
  MUSCLES_BY_PATTERN,
  MAX_SETS_PER_MUSCLE_PER_SESSION,
  MAX_TOTAL_SETS_PER_SESSION,
} from './tables'

/**
 * Calcule le volume hebdomadaire optimal (séries) pour chaque muscle.
 *
 * Ajustements :
 * - minutesPerSession < 45 → supprime les muscles d'isolation (core, calves, traps)
 * - posturalIssues = true → boost ×1.3 sur back + glutes + core (chaîne postérieure)
 */
export function calcWeeklyVolumeByMuscle(profile: UserProfile): Record<MuscleGroup, number> {
  const { goal, level, minutesPerSession, posturalIssues } = profile
  const volumeSpec = WEEKLY_VOLUME_TABLE[goal][level]
  const baseVolume = volumeSpec.optimal

  const isolationMuscles: MuscleGroup[] = ['core', 'calves', 'traps']
  const posteriorChain: MuscleGroup[] = ['back', 'glutes', 'core']

  const allMuscles: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'calves', 'core', 'traps',
  ]

  const result = {} as Record<MuscleGroup, number>

  for (const muscle of allMuscles) {
    // Muscles d'isolation supprimés si séance courte
    if (minutesPerSession < 45 && isolationMuscles.includes(muscle)) {
      result[muscle] = 0
      continue
    }

    let volume = baseVolume

    // Boost chaîne postérieure
    if (posturalIssues && posteriorChain.includes(muscle)) {
      volume = Math.round(volume * 1.3)
    }

    // Les petits groupes musculaires (biceps, triceps, calves) reçoivent moins
    const smallMuscles: MuscleGroup[] = ['biceps', 'triceps', 'calves', 'traps']
    if (smallMuscles.includes(muscle)) {
      volume = Math.max(Math.round(volume * 0.7), 4)
    }

    result[muscle] = volume
  }

  return result
}

/**
 * Distribue le volume hebdomadaire sur les séances selon le planning.
 * Respecte MAX_SETS_PER_MUSCLE_PER_SESSION et MAX_TOTAL_SETS_PER_SESSION.
 *
 * Retourne un tableau (une entrée par séance) de Record<MuscleGroup, number>
 * indiquant le nombre de séries à faire pour chaque muscle dans cette séance.
 */
export function distributeVolumeToSessions(
  weeklyVolume: Record<MuscleGroup, number>,
  schedule: MuscleGroup[][],
): Record<MuscleGroup, number>[] {
  // Compte le nombre de fois que chaque muscle apparaît dans le schedule
  const muscleFrequency: Partial<Record<MuscleGroup, number>> = {}
  for (const dayMuscles of schedule) {
    for (const muscle of dayMuscles) {
      muscleFrequency[muscle] = (muscleFrequency[muscle] ?? 0) + 1
    }
  }

  return schedule.map((dayMuscles) => {
    const dayVolume = {} as Record<MuscleGroup, number>
    let totalSets = 0

    // On traite les muscles dans l'ordre : compound groups first
    const priorityOrder: MuscleGroup[] = [
      'chest', 'back', 'quads', 'hamstrings', 'glutes',
      'shoulders', 'biceps', 'triceps', 'calves', 'core', 'traps',
    ]

    const orderedMuscles = priorityOrder.filter((m) => dayMuscles.includes(m))

    for (const muscle of orderedMuscles) {
      if (totalSets >= MAX_TOTAL_SETS_PER_SESSION) {
        dayVolume[muscle] = 0
        continue
      }

      const freq = muscleFrequency[muscle] ?? 1
      const weekly = weeklyVolume[muscle] ?? 0
      // Divise le volume hebdo équitablement entre les séances où ce muscle est travaillé
      let setsForSession = Math.round(weekly / freq)
      // Respecte le plafond par muscle par séance
      setsForSession = Math.min(setsForSession, MAX_SETS_PER_MUSCLE_PER_SESSION)
      // Respecte le plafond total de la séance
      setsForSession = Math.min(setsForSession, MAX_TOTAL_SETS_PER_SESSION - totalSets)

      dayVolume[muscle] = setsForSession
      totalSets += setsForSession
    }

    return dayVolume
  })
}
```

## Contraintes
- **TypeScript strict** : pas de `any`, toutes les clés `MuscleGroup` couvertes
- **Fonctions pures** : pas d'effets de bord, pas d'import DB
- **Pas de `console.log`** en production
- Utiliser uniquement les imports de `./types` et `./tables`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `determineSplit({ goal: 'hypertrophy', level: 'beginner', daysPerWeek: 4, ... })` → `'full_body'`
- `determineSplit({ goal: 'strength', level: 'advanced', daysPerWeek: 4, ... })` → `'split'`
- `buildWeeklySchedule('push_pull_legs', 6)` → 6 entrées alternant push/pull/legs
- `distributeVolumeToSessions(weeklyVol, schedule)` → chaque séance ≤ MAX_TOTAL_SETS_PER_SESSION

## Dépendances
Ce groupe dépend de : **Groupe A** (types.ts + tables.ts doivent exister)

## Statut
⏳ En attente
