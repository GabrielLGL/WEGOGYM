# Passe 5/8 — Cohérence WatermelonDB
Run : 20260222-2241

## Schema version : 17
9 tables : programs, sessions, session_exercises, exercises, performance_logs, users, body_measurements, histories, sets

## Vérification par modèle

| Modèle | Table | Decorators ↔ Schema | Relations | Statut |
|--------|-------|---------------------|-----------|--------|
| Program | programs | ✅ | ✅ children → sessions | OK |
| Session | sessions | ✅ | ✅ relation → programs, children → session_exercises | OK |
| SessionExercise | session_exercises | ✅ | ✅ relations → sessions, exercises | OK |
| Exercise | exercises | ✅ | ✅ children → performance_logs | OK |
| PerformanceLog | performance_logs | ✅ | ✅ relation → exercises | OK |
| User | users | ✅ | N/A | OK |
| History | histories | ✅ | ✅ relation → sessions, children → sets | OK |
| Set | sets | ✅ | ✅ relations → histories, exercises | OK |
| BodyMeasurement | body_measurements | ✅ | N/A | OK |

## Issues trouvées

### 🔵 #1 — User.ts: annotation de type `string | null` sur champ `@text`
**Fichier :** `model/models/User.ts:19`
Le champ `name` est déclaré `@text('name') name!: string | null`. Le `!` (definite assignment) + `| null` est un pattern inhabituel mais fonctionnel avec WatermelonDB car le schema déclare `isOptional: true`.
**Sévérité :** Suggestion — pas de bug runtime.

## Score
WatermelonDB : **20/20** (cohérence schema/modèles parfaite)
