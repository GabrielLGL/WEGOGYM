# Passe 5 — Cohérence WatermelonDB — 20260226-0224

## Résultats

### ✅ Schéma v17 vs Modèles

| Modèle | Table | Champs vérifiés | Statut |
|--------|-------|-----------------|--------|
| User | users | email, timer_enabled, rest_duration, onboarding_completed, user_level, user_goal, name, ai_provider, ai_api_key, total_xp, level, current_streak, best_streak, streak_target, total_tonnage, last_workout_week | ✅ |
| Program | programs | name, position, equipment, frequency | ✅ |
| Session | sessions | name, position, program_id | ✅ |
| SessionExercise | session_exercises | session_id, exercise_id, position, sets_target, reps_target, weight_target | ✅ |
| Exercise | exercises | name, muscles, equipment | ✅ |
| History | histories | session_id, start_time, end_time, note, deleted_at | ✅ |
| Set | sets | history_id, exercise_id, set_number, reps, weight, validated_at | ✅ |
| PerformanceLog | performance_logs | exercise_id, recorded_at, weight, reps | ✅ |
| BodyMeasurement | body_measurements | recorded_at, weight, waist, hips, chest, arms | ✅ |

### 🟡 W1 — ai_api_key dans User (dette architecturale, cf Pass 3)
Champ présent dans schéma ET modèle. Migration OK. À supprimer future version.

### ✅ Relations
- `Program.sessions` : @children('sessions') → `sessions.program_id` ✅
- `Session.sessionExercises` : @children ✅
- `History.sets` : @children ✅
- `Exercise.performanceLogs` : @children ✅
- Toutes les @relation pointent vers des tables existantes ✅

### ✅ Mutations dans database.write()
Toutes vérifiées (voir pass 4).

### ✅ Migrations
Schema v17. Les migrations incrémentales (v1→v17) sont cohérentes.

## Verdict
Cohérence schéma/modèles : ✅ PASS. 1 dette architecturale mineure (ai_api_key).
