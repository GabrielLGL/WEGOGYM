<!-- v1.0 — 2026-02-26 -->
# Rapport — Split databaseHelpers.ts — Groupe A — 20260226-1120

## Objectif
Décomposer `mobile/src/model/utils/databaseHelpers.ts` (863 lignes) en modules cohérents,
sans casser aucun import existant. La stratégie : créer des sous-fichiers thématiques et
transformer `databaseHelpers.ts` en **barrel de re-export** (`export * from './...'`).

## Fichiers concernés
- `mobile/src/model/utils/databaseHelpers.ts` ← à transformer en barrel
- `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` ← NE PAS MODIFIER (imports déjà corrects via barrel)
- Nouveaux fichiers à créer dans `mobile/src/model/utils/` :
  - `parseUtils.ts`
  - `exerciseQueryUtils.ts`
  - `workoutSessionUtils.ts`
  - `workoutSetUtils.ts`
  - `exerciseStatsUtils.ts`
  - `programImportUtils.ts`
  - `aiPlanUtils.ts`

## Contexte technique
- Stack : React Native + TypeScript + WatermelonDB (schéma v17)
- Toutes les mutations DB sont dans `database.write(async () => {...})`
- `database` s'importe depuis `../../index` (ou `../index` selon niveau)
- Les modèles sont dans `../models/` (Program, Session, SessionExercise, History, WorkoutSet, Exercise, User)
- `onboardingPrograms.ts` définit le type `PresetProgram`
- **Pattern barrel** : `databaseHelpers.ts` doit re-exporter TOUT pour que les 15+ fichiers qui l'importent continuent à fonctionner sans modification

### Importeurs actuels (NE PAS CASSER)
```
components/ExercisePickerModal.tsx       → filterExercises
components/LastPerformanceBadge.tsx      → formatRelativeDate
components/WorkoutExerciseCard.tsx       → getLastPerformanceForExercise
components/WorkoutSummarySheet.tsx       → updateHistoryNote
hooks/useExerciseFilters.ts              → filterAndSearchExercises
hooks/useProgramManager.ts               → getNextPosition
hooks/useSessionManager.ts              → parseNumericInput, parseIntegerInput, getNextPosition
hooks/useWorkoutState.ts                → plusieurs fonctions
screens/AssistantScreen.tsx             → importGeneratedPlan, importGeneratedSession
screens/ChartsScreen.tsx                → buildExerciseStatsFromData + type ExerciseSessionStat
screens/ProgramsScreen.tsx              → importPresetProgram, markOnboardingCompleted
screens/StatsExercisesScreen.tsx        → formatRelativeDate
screens/StatsMeasurementsScreen.tsx     → parseNumericInput
screens/WorkoutScreen.tsx               → plusieurs fonctions
```

## Découpage en sous-modules

### `parseUtils.ts` (~20 lignes)
Fonctions pures, aucune dépendance DB.
```
parseNumericInput(value: string, fallback = 0): number
parseIntegerInput(value: string, fallback = 0): number
formatRelativeDate(dateMs: number): string
```

### `exerciseQueryUtils.ts` (~65 lignes)
Fonctions de filtrage/recherche exercices + position. Dépend de `database`.
```
getNextPosition(collectionName, ...clauses): Promise<number>
filterExercises(exercises, muscle?, equipment?): Exercise[]
searchExercises(exercises, query): Exercise[]
filterAndSearchExercises(exercises, muscle?, equipment?, query?): Exercise[]
```

### `workoutSessionUtils.ts` (~100 lignes)
Gestion du cycle de vie d'une séance (créer, compléter, noter, volume).
```
createWorkoutHistory(sessionId, startTime): Promise<History>
completeWorkoutHistory(historyId, endTime): Promise<void>
updateHistoryNote(historyId, note): Promise<void>
getLastSessionVolume(sessionId): Promise<number>
```

### `workoutSetUtils.ts` (~120 lignes)
Opérations sur les séries (save, delete, max poids).
```
saveWorkoutSet(historyId, exerciseId, sets, reps, weight, setOrder): Promise<WorkoutSet>
deleteWorkoutSet(historyId, exerciseId, setOrder): Promise<void>
getMaxWeightForExercise(exerciseId, excludeHistoryId?): Promise<number>
```

### `exerciseStatsUtils.ts` (~220 lignes)
Stats et récap exercice. Contient le type `ExerciseSessionStat`.
```
interface ExerciseSessionStat { ... }
getLastPerformanceForExercise(exerciseId, sessionId): Promise<...>
getExerciseStatsFromSets(exerciseId): Promise<ExerciseSessionStat[]>
buildExerciseStatsFromData(data): ExerciseSessionStat[]   ← fonction pure
buildRecapExercises(historyId): Promise<...>
getLastSetsForExercises(sessionId, exerciseIds): Promise<...>
```
Dépendance interne : `getExerciseStatsFromSets` appelle `buildExerciseStatsFromData`.

### `programImportUtils.ts` (~85 lignes)
Import de presets + onboarding.
```
importPresetProgram(preset: PresetProgram): Promise<void>
markOnboardingCompleted(): Promise<void>
```

### `aiPlanUtils.ts` (~190 lignes)
Import de plans générés par IA. Fonctions internes non exportées.
```
// Internes (non exportées)
collectExerciseNames(plan): string[]
resolveExercisesForBatch(names, db): Promise<Map<...>>
// Exports
importGeneratedPlan(plan, programId?): Promise<string>   ← retourne l'ID programme créé
importGeneratedSession(session, programId): Promise<void>
```

## Étapes

1. Lire entièrement `databaseHelpers.ts` pour extraire le code exact de chaque section
2. Créer `parseUtils.ts` avec les 3 fonctions de parsing/date
3. Créer `exerciseQueryUtils.ts`
4. Créer `workoutSessionUtils.ts`
5. Créer `workoutSetUtils.ts`
6. Créer `exerciseStatsUtils.ts` (inclure l'interface `ExerciseSessionStat`)
7. Créer `programImportUtils.ts`
8. Créer `aiPlanUtils.ts`
9. Remplacer le contenu de `databaseHelpers.ts` par un barrel :
   ```ts
   export * from './parseUtils'
   export * from './exerciseQueryUtils'
   export * from './workoutSessionUtils'
   export * from './workoutSetUtils'
   export * from './exerciseStatsUtils'
   export * from './programImportUtils'
   export * from './aiPlanUtils'
   ```
10. Vérifier `npx tsc --noEmit` → 0 erreur
11. Vérifier `npm test` → 0 fail (les tests importent depuis le barrel, donc transparents)

## Contraintes
- **NE PAS modifier** les fichiers importeurs (screens, hooks, components) — le barrel garantit la compatibilité
- **NE PAS modifier** `databaseHelpers.test.ts` — il importe depuis le barrel
- Respecter les imports WatermelonDB : `import { database } from '../../index'` dans les sous-fichiers
- Conserver EXACTEMENT les signatures de fonctions (noms, types, valeurs par défaut)
- Pas de `any` TypeScript
- Pattern WatermelonDB : mutations DANS `database.write()`

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- `npm test -- --testPathPattern="databaseHelpers"` → zéro fail
- `npm test` → zéro fail global

## Dépendances
Aucune dépendance sur Groupe B ou D. Peut être lancé en parallèle.

## Statut
⏳ En attente
