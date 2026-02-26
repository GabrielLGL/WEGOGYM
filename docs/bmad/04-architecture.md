# Architecture — Récap Post-Séance — 2026-02-26

## Aucune migration de schéma (v17 inchangé)

## Flux de données
```
handleConfirmEnd()
  → buildRecapExercises(sessionExercises, validatedSets, historyId)
  → getLastSessionVolume(session.id, historyId)
  → setState(recapExercises, recapComparison)
  → WorkoutSummarySheet reçoit les nouvelles props
```

## 1. Nouveaux types — types/workout.ts
```typescript
export interface RecapExerciseData {
  exerciseName: string
  setsValidated: number
  setsTarget: number
  sets: Array<{ reps: number; weight: number }>
  prevMaxWeight: number  // 0 = première fois
  currMaxWeight: number
  muscles: string[]
}
export interface RecapComparisonData {
  prevVolume: number | null  // null = première séance
  currVolume: number
  volumeGain: number
}
```

## 2. Nouveaux helpers — databaseHelpers.ts
- `getLastSessionVolume(sessionId, excludeHistoryId)` → number | null
- `buildRecapExercises(sessionExercises, validatedSets, historyId)` → RecapExerciseData[]

## 3. WorkoutScreen — handleConfirmEnd
- 2 nouveaux useState : recapExercises, recapComparison
- Calcul avant setSummaryVisible(true)
- 2 nouveaux props passés au WorkoutSummarySheet

## 4. WorkoutSummarySheet — structure enrichie
```
BottomSheet "Séance terminée !"
  ├── Message motivant dynamique (remplace celebrationText)
  ├── Chips muscles travaillés
  ├── Stats grid 2×2 (inchangé)
  ├── Section gamification (inchangée)
  ├── separator
  ├── "Ce que tu as fait" (exercices + sets + indicateur complétion)
  ├── "Progression" (delta volume + delta poids max par exo)
  ├── separator
  ├── Note input (inchangé)
  └── Bouton "Terminer" (inchangé)
```

## 5. Stories
| # | Story | Fichier(s) |
|---|-------|-----------|
| S01 | Types RecapExerciseData + RecapComparisonData | types/workout.ts |
| S02 | Helpers getLastSessionVolume + buildRecapExercises | databaseHelpers.ts |
| S03 | WorkoutScreen : états + calcul + props | WorkoutScreen.tsx |
| S04 | WorkoutSummarySheet : message + chips + exos + progression | WorkoutSummarySheet.tsx |
