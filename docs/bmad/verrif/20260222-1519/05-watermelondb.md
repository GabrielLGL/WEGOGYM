# Passe 5/8 — Cohérence WatermelonDB — 20260222-1519

## Schema v17 — Vérification colonnes ↔ modèles

### Table `programs` ✅
Schema: name, position, created_at, updated_at
Model: name, position, createdAt, updatedAt — OK

### Table `sessions` ✅
Schema: program_id, name, position, created_at, updated_at, deleted_at
Model: name, position, session, createdAt, updatedAt, deletedAt + relation program — OK

### Table `session_exercises` ✅
Schema: session_id, exercise_id, position, sets_target, reps_target, weight_target, created_at, updated_at
Model: position, setsTarget, repsTarget, weightTarget, createdAt, updatedAt + relations session, exercise — OK

### Table `exercises` ✅
Schema: name, is_custom, muscles, equipment, created_at, updated_at
Model: name, isCustom, _muscles (with getter/setter), equipment, createdAt, updatedAt — OK

### Table `performance_logs` ✅
Schema: exercise_id, sets, weight, reps, created_at
Model: exerciseId (field), sets, weight, reps, createdAt — OK

### Table `users` ✅
Schema: email, name, timer_enabled, rest_duration, onboarding_completed, ai_provider, ai_api_key, created_at, updated_at
Model: email, name, timerEnabled, restDuration, onboardingCompleted, aiProvider, aiApiKey, createdAt, updatedAt — OK

### Table `body_measurements` ✅ (NOUVEAU)
Schema: date, weight, waist, hips, chest, arms, created_at, updated_at
Model: date, weight, waist, hips, chest, arms, createdAt, updatedAt — OK

### Table `histories` ✅
Schema: session_id, start_time, end_time, note, created_at, updated_at, deleted_at
Model: startTime, endTime, note, session (relation), sets (children), createdAt, updatedAt, deletedAt — OK

### Table `sets` ✅
Schema: history_id, exercise_id, weight, reps, set_order, is_pr, created_at, updated_at
Model: weight, reps, setOrder, isPr, history (relation), exercise (relation), createdAt, updatedAt — OK

## modelClasses dans index.ts ✅
9 modèles enregistrés : Program, Session, History, Set, Exercise, User, SessionExercise, PerformanceLog, BodyMeasurement
9 tables dans le schema — **match parfait**.

## Relations ✅
- Set.history → histories (belongs_to, history_id) ✅
- Set.exercise → exercises (belongs_to, exercise_id) ✅
- History.session → sessions (belongs_to, session_id) ✅
- History.sets → sets (has_many, history_id) ✅
- SessionExercise.session → sessions (belongs_to, session_id) ✅
- SessionExercise.exercise → exercises (belongs_to, exercise_id) ✅
- Exercise.session_exercises (has_many) ✅
- Exercise.performance_logs (has_many) ✅
- Exercise.sets (has_many) ✅

## Problèmes trouvés

### 🟡 Warning — BodyMeasurement n'a pas d'associations déclarées
**File:** `BodyMeasurement.ts`
**Description:** Le modèle ne déclare pas `static associations`. Ce n'est pas un bug (la table n'a pas de FK), mais c'est incohérent avec les autres modèles qui déclarent tous leurs associations.
**Impact:** Aucun — pas de FK dans cette table.

## Résumé
✅ Schema ↔ Models : 9/9 tables cohérentes
✅ Relations : toutes correctes
✅ modelClasses : 9/9 enregistrés
🟡 1 warning mineur (associations vides non déclarées sur BodyMeasurement)
