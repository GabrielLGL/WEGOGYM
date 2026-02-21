<!-- v1.0 — 2026-02-21 -->
# Rapport — programGenerator — Groupe C : Couche DB + Point d'entrée — 20260221-1725

## Objectif
Créer les 3 derniers fichiers du module `programGenerator` :
- `exerciseSelector.ts` — charge et filtre les exercices depuis WatermelonDB
- `sessionBuilder.ts` — construit une `PGGeneratedSession` complète
- `index.ts` — point d'entrée + adaptateur vers `GeneratedPlan` (format DB existant)

## Fichiers concernés
- **CRÉER** `mobile/src/services/ai/programGenerator/exerciseSelector.ts`
- **CRÉER** `mobile/src/services/ai/programGenerator/sessionBuilder.ts`
- **CRÉER** `mobile/src/services/ai/programGenerator/index.ts`

## Contexte technique

### Dossier créé par Groupes A + B
`mobile/src/services/ai/programGenerator/` contient déjà :
- `types.ts` — UserProfile, Equipment, MuscleGroup, BodyZone, SplitType, MovementPattern,
  PGSessionExercise, PGGeneratedSession, PGGeneratedProgram, SetParams,
  EQUIPMENT_TO_DB, MUSCLE_TO_DB, INJURY_ZONE_TO_BODY_ZONE
- `tables.ts` — WEEKLY_VOLUME_TABLE, PARAMS_TABLE, MUSCLES_BY_PATTERN, MUSCLE_TO_PATTERN,
  MAX_SETS_PER_MUSCLE_PER_SESSION, MAX_TOTAL_SETS_PER_SESSION, MIN_EFFECTIVE_SETS, DUMBBELL_ONLY_EQUIPMENT
- `splitStrategy.ts` — determineSplit(), buildWeeklySchedule()
- `volumeCalculator.ts` — calcWeeklyVolumeByMuscle(), distributeVolumeToSessions()

### WatermelonDB — Modèle Exercise
```typescript
// mobile/src/model/models/Exercise.ts
class Exercise extends Model {
  static table = 'exercises'
  @text('name') name: string
  @field('is_custom') isCustom: boolean
  @json('muscles', sanitizer) muscles: string[]   // ex: ['Pecs', 'Epaules']
  @text('equipment') equipment: string | null      // ex: 'Poids libre' | 'Machine' | 'Poulies' | 'Poids du corps'
}
```

### ExerciseMetadata existant
```typescript
// mobile/src/services/ai/types.ts
type ExerciseType = 'compound_heavy' | 'compound' | 'accessory' | 'isolation'
type InjuryZone = 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque' | 'none'
interface ExerciseMetadata {
  type: ExerciseType          // utilisé pour dériver nervousDemand et movementPattern
  minLevel: AILevel           // 'débutant' | 'intermédiaire' | 'avancé'
  isUnilateral: boolean
  primaryMuscle: string       // nom français ex: 'Pecs'
  secondaryMuscles: string[]  // noms français
  injuryRisk?: InjuryZone[]  // zones à éviter
}
// La map est dans mobile/src/services/ai/exerciseMetadata.ts
// import { EXERCISE_METADATA } from '../exerciseMetadata'
```

### Format de sortie DB (existant, ne pas modifier)
```typescript
// mobile/src/services/ai/types.ts
interface GeneratedExercise { exerciseName, setsTarget, repsTarget, weightTarget, restSeconds?, rpe? }
interface GeneratedSession   { name: string, exercises: GeneratedExercise[] }
interface GeneratedPlan      { name: string, sessions: GeneratedSession[], includeDeload?: boolean }
```
La fonction `importGeneratedPlan(plan: GeneratedPlan, db: Database)` est dans
`mobile/src/model/utils/databaseHelpers.ts` — réutiliser telle quelle.

## Étapes

### 1. Créer `exerciseSelector.ts`

Logique :
1. Récupère tous les exercices de la collection WatermelonDB
2. Pour chaque exercice, récupère son ExerciseMetadata depuis EXERCISE_METADATA
3. Filtre :
   - equipment : `profile.equipment` mappé FR → intersection avec `exercise.equipment`
   - muscles : au moins un muscle de `musclesWithSets` dans `exercise.muscles` (comparaison FR)
   - difficulty : exclure si `metadata.minLevel === 'avancé'` et `profile.level === 'beginner'`
   - injuries : exclure si `metadata.injuryRisk` contient une zone mappée depuis `profile.injuries`
4. Dérive `nervousDemand` depuis metadata.type :
   - 'compound_heavy' → 3, 'compound' → 2, 'accessory' → 2, 'isolation' → 1
5. Dérive `movementPattern` depuis metadata.primaryMuscle via MUSCLE_TO_PATTERN (mapping FR→MuscleGroup)
6. Trie : nervousDemand desc → compound avant isolation
7. Limite : max 1-2 exercices par muscle primaire pour éviter la redondance
8. Retourne `PGSessionExercise[]` sans les SetParams (assignés par sessionBuilder)

```typescript
import type { Database } from '@nozbe/watermelondb'
import type { UserProfile, MuscleGroup, MovementPattern, PGSessionExercise } from './types'
import { EQUIPMENT_TO_DB, MUSCLE_TO_DB, INJURY_ZONE_TO_BODY_ZONE, MUSCLE_TO_PATTERN } from './types'
import type { ExerciseType } from '../types'
import { EXERCISE_METADATA } from '../exerciseMetadata'

// Dérive nervousDemand depuis ExerciseType
function toNervousDemand(type: ExerciseType): 1 | 2 | 3 {
  if (type === 'compound_heavy') return 3
  if (type === 'compound' || type === 'accessory') return 2
  return 1
}

// Dérive movementPattern depuis le muscle primaire français
function toMovementPattern(primaryMuscleFr: string): MovementPattern {
  // Map FR → MuscleGroup (EN)
  const FR_TO_MUSCLE: Record<string, MuscleGroup> = {
    'Pecs': 'chest', 'Dos': 'back', 'Epaules': 'shoulders',
    'Biceps': 'biceps', 'Triceps': 'triceps', 'Quadriceps': 'quads',
    'Ischios': 'hamstrings', 'Mollets': 'calves', 'Abdos': 'core', 'Trapèzes': 'traps',
  }
  const muscleEn = FR_TO_MUSCLE[primaryMuscleFr]
  return muscleEn ? MUSCLE_TO_PATTERN[muscleEn] : 'push'
}

export async function selectExercisesForSession(
  musclesWithSets: Record<MuscleGroup, number>,
  profile: UserProfile,
  db: Database,
): Promise<Omit<PGSessionExercise, 'params'>[]> {
  // 1. Charge tous les exercices
  const exercises = await db.collections.get('exercises').query().fetch()

  // 2. Ensemble des equipment DB valides selon le profil
  const validEquipmentDB = new Set(
    profile.equipment.flatMap((eq) => EQUIPMENT_TO_DB[eq])
  )

  // 3. Muscles ciblés cette séance (noms FR)
  const targetMusclesFR = new Set(
    (Object.keys(musclesWithSets) as MuscleGroup[])
      .filter((m) => musclesWithSets[m] > 0)
      .map((m) => MUSCLE_TO_DB[m])
  )

  // 4. Zones d'injury à éviter (EN)
  const injuryBodyZones = new Set(profile.injuries)

  // 5. Mapping AILevel → int pour comparaison
  const levelOrder = { 'débutant': 0, 'intermédiaire': 1, 'avancé': 2 }
  const profileLevelInt = profile.level === 'beginner' ? 0 : profile.level === 'intermediate' ? 1 : 2

  type Candidate = {
    exerciseId: string
    exerciseName: string
    musclesPrimary: MuscleGroup[]
    nervousDemand: 1 | 2 | 3
    movementPattern: MovementPattern
  }

  const candidates: Candidate[] = []

  for (const ex of exercises) {
    const meta = EXERCISE_METADATA[ex.name]
    if (!meta) continue

    // Filtre equipment
    const exEquipment = ex.equipment ?? ''
    if (exEquipment && !validEquipmentDB.has(exEquipment)) continue
    if (!exEquipment && !profile.equipment.includes('bodyweight')) continue

    // Filtre muscles cibles
    const exMusclesFR: string[] = Array.isArray(ex.muscles) ? ex.muscles : []
    const matchesMuscle = exMusclesFR.some((m) => targetMusclesFR.has(m))
    if (!matchesMuscle) continue

    // Filtre difficulty
    const metaLevelInt = levelOrder[meta.minLevel] ?? 0
    if (metaLevelInt > profileLevelInt) continue

    // Filtre injuries
    const injuryZonesFR = meta.injuryRisk ?? []
    const hasConflict = injuryZonesFR.some((zone) => {
      const bodyZone = INJURY_ZONE_TO_BODY_ZONE[zone]
      return bodyZone && injuryBodyZones.has(bodyZone)
    })
    if (hasConflict) continue

    // Dérive musclesPrimary (EN)
    const primaryMuscleEn: MuscleGroup | undefined = (Object.entries(MUSCLE_TO_DB) as [MuscleGroup, string][])
      .find(([, fr]) => fr === meta.primaryMuscle)?.[0]
    const musclesPrimary: MuscleGroup[] = primaryMuscleEn ? [primaryMuscleEn] : []

    candidates.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      musclesPrimary,
      nervousDemand: toNervousDemand(meta.type),
      movementPattern: toMovementPattern(meta.primaryMuscle),
    })
  }

  // 6. Tri : nervousDemand desc
  candidates.sort((a, b) => b.nervousDemand - a.nervousDemand)

  // 7. Limite : max 2 exercices par primaryMuscle pour éviter redondance
  const muscleCount: Partial<Record<MuscleGroup, number>> = {}
  const selected: Candidate[] = []
  for (const c of candidates) {
    const primary = c.musclesPrimary[0]
    if (!primary) { selected.push(c); continue }
    const count = muscleCount[primary] ?? 0
    if (count < 2) {
      selected.push(c)
      muscleCount[primary] = count + 1
    }
  }

  return selected.map((c, i) => ({
    exerciseId: c.exerciseId,
    exerciseName: c.exerciseName,
    musclesPrimary: c.musclesPrimary,
    order: i + 1,
  }))
}
```

### 2. Créer `sessionBuilder.ts`

```typescript
import type { Database } from '@nozbe/watermelondb'
import type { UserProfile, MuscleGroup, SplitType, PGGeneratedSession, PGSessionExercise, SetParams } from './types'
import { PARAMS_TABLE, MAX_TOTAL_SETS_PER_SESSION } from './tables'
import { selectExercisesForSession } from './exerciseSelector'

function buildSetParams(
  goal: UserProfile['goal'],
  isCompound: boolean,
  setsCount: number,
): SetParams {
  const p = PARAMS_TABLE[goal]
  return {
    sets: setsCount,
    repsMin: p.repsMin,
    repsMax: p.repsMax,
    restSeconds: isCompound ? p.restCompound : p.restIsolation,
    rir: p.rir,
    tempoEccentric: p.tempoEcc,
  }
}

function estimateDuration(exercises: PGSessionExercise[], goal: UserProfile['goal']): number {
  const p = PARAMS_TABLE[goal]
  return exercises.reduce((total, ex) => {
    const setTime = p.tempoEcc * p.repsMax + ex.params.restSeconds
    return total + ex.params.sets * setTime
  }, 0) / 60  // en minutes
}

export async function buildSession(
  dayIndex: number,
  musclesWithSets: Record<MuscleGroup, number>,
  profile: UserProfile,
  db: Database,
  splitType: SplitType,
): Promise<PGGeneratedSession> {
  const rawExercises = await selectExercisesForSession(musclesWithSets, profile, db)

  // Assigne les séries à chaque exercice
  let totalSets = 0
  const exercises: PGSessionExercise[] = []

  for (const ex of rawExercises) {
    if (totalSets >= MAX_TOTAL_SETS_PER_SESSION) break

    // Séries cibles pour ce muscle dans cette séance
    const primaryMuscle = ex.musclesPrimary[0]
    const targetSets = primaryMuscle ? (musclesWithSets[primaryMuscle] ?? 3) : 3

    // Détermine si compound (nervousDemand via order approximation : premiers = compound)
    const isCompound = exercises.length < rawExercises.length / 2

    const setsToAssign = Math.min(targetSets, MAX_TOTAL_SETS_PER_SESSION - totalSets)
    if (setsToAssign <= 0) break

    const params = buildSetParams(profile.goal, isCompound, setsToAssign)

    exercises.push({ ...ex, params })
    totalSets += setsToAssign
  }

  const musclesTargeted = Array.from(
    new Set(exercises.flatMap((e) => e.musclesPrimary))
  )

  return {
    dayOfWeek: dayIndex + 1,  // 1=lundi
    sessionType: splitType,
    musclesTargeted,
    totalSets,
    estimatedMinutes: Math.round(estimateDuration(exercises, profile.goal)),
    exercises,
  }
}
```

### 3. Créer `index.ts`

Expose le point d'entrée principal + un adaptateur vers `GeneratedPlan` pour réutiliser
`importGeneratedPlan()` sans modifier le code existant.

```typescript
import type { Database } from '@nozbe/watermelondb'
import type { UserProfile, MuscleGroup, PGGeneratedProgram, PGGeneratedSession } from './types'
import type { GeneratedPlan, GeneratedSession, GeneratedExercise } from '../types'
import { determineSplit, buildWeeklySchedule } from './splitStrategy'
import { calcWeeklyVolumeByMuscle, distributeVolumeToSessions } from './volumeCalculator'
import { buildSession } from './sessionBuilder'
import { PARAMS_TABLE } from './tables'

export type { UserProfile, PGGeneratedProgram, PGGeneratedSession }

/**
 * Génère un programme complet (4 semaines) à partir d'un profil utilisateur.
 * 100% offline, déterministe, zéro appel réseau.
 */
export async function generateProgram(
  profile: UserProfile,
  db: Database,
): Promise<PGGeneratedProgram> {
  const splitType = determineSplit(profile)
  const schedule = buildWeeklySchedule(splitType, profile.daysPerWeek)
  const weeklyVolume = calcWeeklyVolumeByMuscle(profile)
  const sessionVolumes = distributeVolumeToSessions(weeklyVolume, schedule)

  const sessions: PGGeneratedSession[] = []
  for (let i = 0; i < profile.daysPerWeek; i++) {
    const session = await buildSession(i, sessionVolumes[i], profile, db, splitType)
    sessions.push(session)
  }

  return {
    id: `pg_${Date.now()}`,
    createdAt: new Date(),
    profile,
    splitType,
    weeksCount: 4,
    sessionsPerWeek: sessions,
    weeklyVolumeByMuscle: weeklyVolume,
  }
}

/**
 * Convertit un PGGeneratedProgram vers le format GeneratedPlan
 * pour être sauvegardé via importGeneratedPlan() existant.
 */
export function toDatabasePlan(program: PGGeneratedProgram, programName: string): GeneratedPlan {
  const p = PARAMS_TABLE[program.profile.goal]

  const sessions: GeneratedSession[] = program.sessionsPerWeek.map((session, i) => {
    const exercises: GeneratedExercise[] = session.exercises.map((ex) => ({
      exerciseName: ex.exerciseName,
      setsTarget: ex.params.sets,
      repsTarget: `${ex.params.repsMin}-${ex.params.repsMax}`,
      weightTarget: 0,  // pas de poids initial — l'utilisateur définit
      restSeconds: ex.params.restSeconds,
      rpe: p.rir + 7,   // approximation RPE depuis RIR (RIR 2 ≈ RPE 8)
    }))

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    const dayName = dayNames[(session.dayOfWeek - 1) % 7]

    return {
      name: `Séance ${i + 1} — ${dayName}`,
      exercises,
    }
  })

  return {
    name: programName,
    sessions,
    includeDeload: false,
  }
}

export { determineSplit, buildWeeklySchedule } from './splitStrategy'
export { calcWeeklyVolumeByMuscle, distributeVolumeToSessions } from './volumeCalculator'
```

## Contraintes
- **TypeScript strict** : pas de `any`, toutes les propriétés typées
- **WatermelonDB mutations** : ce module ne fait QUE des reads (queries). Les writes restent dans importGeneratedPlan
- **Pas de `console.log`** en production
- **Pas de imports circulaires** entre les fichiers du module

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `generateProgram(profile, db)` retourne un `PGGeneratedProgram` valide
- `toDatabasePlan(program, 'Mon programme')` retourne un `GeneratedPlan` compatible avec `importGeneratedPlan()`
- Chaque session : `totalSets ≤ MAX_TOTAL_SETS_PER_SESSION`
- Chaque session : `exercises.length > 0` si des exercices disponibles en DB

## Dépendances
Ce groupe dépend de : **Groupe A** (types.ts, tables.ts) + **Groupe B** (splitStrategy.ts, volumeCalculator.ts)

## Statut
✅ Résolu — 20260221-1730

## Résolution
Rapport do : docs/bmad/do/20260221-1730-feat-program-generator-C.md
