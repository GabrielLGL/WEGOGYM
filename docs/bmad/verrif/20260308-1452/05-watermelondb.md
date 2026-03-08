# 05 — Cohérence WatermelonDB

**Date :** 2026-03-08 14:52
**Schema :** v32

## Vérification Schema ↔ Models

| Table | Model | Colonnes Schema | Décorateurs Model | Status |
|-------|-------|-----------------|-------------------|--------|
| programs | Program.ts | 6 cols + created/updated | ✅ 6 + 2 | ✅ PASS |
| sessions | Session.ts | 5 cols + created/updated/deleted | ✅ 5 + 3 | ✅ PASS |
| session_exercises | SessionExercise.ts | 12 cols + created/updated | ✅ 12 + 2 | ✅ PASS |
| exercises | Exercise.ts | 7 cols + created/updated | ✅ 7 + 2 | ✅ PASS |
| performance_logs | PerformanceLog.ts | 4 cols + created | ✅ 4 + 1 | ✅ PASS |
| users | User.ts | 23 cols + created/updated | ✅ 23 + 2 | ✅ PASS |
| user_badges | UserBadge.ts | 2 cols + created/updated | ✅ 2 + 2 | ✅ PASS |
| body_measurements | BodyMeasurement.ts | 6 cols + created/updated | ✅ 6 + 2 | ✅ PASS |
| histories | History.ts | 5 cols + created/updated/deleted | ✅ 5 + 3 | ✅ PASS |
| sets | Set.ts | 6 cols + created/updated | ✅ 6 + 2 | ✅ PASS |

## Relations

| Model | Relation | Type | Foreign Key | Schema Index | Status |
|-------|----------|------|-------------|-------------|--------|
| Session | program | @relation | program_id | ✅ isIndexed | ✅ |
| SessionExercise | session | @relation | session_id | ✅ isIndexed | ✅ |
| SessionExercise | exercise | @relation | exercise_id | ✅ isIndexed | ✅ |
| History | session | @relation | session_id | ✅ isIndexed | ✅ |
| Set | history | @relation | history_id | ✅ isIndexed | ✅ |
| Set | exercise | @relation | exercise_id | ✅ isIndexed | ✅ |
| PerformanceLog | exercise | @relation | exercise_id | ✅ isIndexed | ✅ |

## Conclusion

✅ **PASS** — Schema v32 et modèles sont parfaitement synchronisés. Toutes les colonnes, types et relations correspondent.
