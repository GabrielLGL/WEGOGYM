# 03 — Code Review

**Run:** 20260309-1716

## Issues trouvées

### CRITIQUES (2)

#### C1. Unsafe `.muscles` sans optional chaining — StatsVolumeScreen
- **Fichier:** `screens/StatsVolumeScreen.tsx` L115
- **Code:** `.forEach(e => e.muscles.forEach(m => ...))`
- **Risque:** Crash si `e.muscles` undefined
- **Fix:** `e.muscles?.forEach(...)`

#### C2. `.startTime.getTime()` potentiel null — workoutSetUtils.ts
- **Fichier:** `model/utils/workoutSetUtils.ts` L159
- **Code:** `h.startTime.getTime()`
- **Risque:** Crash si `startTime` null
- **Fix:** `h.startTime?.getTime() ?? 0`
- **Note:** Issue connue, re-confirmée

### WARNINGS (2)

#### W1. Catch silencieux dans ExercisePickerModal
- **Fichier:** `components/ExercisePickerModal.tsx` L114
- **Issue:** `onAdd` error silently swallowed, pas de feedback utilisateur

#### W2. markCompleted async non awaité — useCoachMarks
- **Fichier:** `hooks/useCoachMarks.ts` L15-26
- **Issue:** Callback async passé sans await, mais try/catch interne présent

### SUGGESTIONS (3)

#### S1. Type assertions `as keyof` — ExercisesScreen L44-45
#### S2. `.muscles.length` sans optional chaining — aiService.ts L82-84
#### S3. completeWorkout sans useCallback — useWorkoutCompletion.ts L83

## Schema vs Models : PASS (10/10 modèles cohérents)

## Score Code Review : OK — 2 CRIT corrigeables
