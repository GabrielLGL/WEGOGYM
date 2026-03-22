# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-22

## Résultat

### Schema v42 — 15 tables

| Table | Modèle | Colonnes sync | Status |
|-------|--------|--------------|--------|
| programs | Program | ✅ | OK |
| sessions | Session | ✅ | OK |
| session_exercises | SessionExercise | ✅ | OK |
| exercises | Exercise | ✅ | OK |
| performance_logs | PerformanceLog | ✅ | OK |
| users | User | ✅ | OK |
| user_badges | UserBadge | ✅ | OK |
| body_measurements | BodyMeasurement | ✅ | OK |
| progress_photos | ProgressPhoto | ✅ | OK |
| histories | History | ✅ | OK |
| sets | Set | ✅ | OK |
| friend_snapshots | FriendSnapshot | ✅ | OK |
| wearable_sync_logs | WearableSyncLog | ✅ | OK |
| sleep_records | SleepRecord | ✅ | OK |
| daily_vitals | DailyVitals | ✅ | OK |

### Migrations
- Migrations v27 → v42 : ✅ cohérentes avec le schéma final
- `model/index.ts` : 15 modelClasses enregistrées ✅

### 🟡 WARN-1 — Commentaire version obsolète
- `schema.ts:4` dit "Version actuelle : 39" → devrait être 42

### Pas d'incohérence schema ↔ modèle détectée
