# Passe 5/8 — Cohérence WatermelonDB

## Résultat

### Schema v39 — 13 tables

| Table | Modèle | Colonnes schema | Colonnes modèle | Sync |
|-------|--------|----------------|-----------------|------|
| programs | Program | ✅ | ✅ | OK |
| sessions | Session | ✅ | ✅ | OK |
| session_exercises | SessionExercise | ✅ | ✅ | OK |
| exercises | Exercise | ✅ | ✅ | OK |
| performance_logs | PerformanceLog | ✅ | ✅ | OK |
| users | User | ✅ | ✅ | OK |
| user_badges | UserBadge | ✅ | ✅ | OK |
| body_measurements | BodyMeasurement | ✅ | ✅ | OK |
| progress_photos | ProgressPhoto | ✅ | ✅ | OK |
| histories | History | ✅ | ✅ | OK |
| sets | Set | ✅ | ✅ | OK |
| friend_snapshots | FriendSnapshot | ✅ | ✅ | OK |
| wearable_sync_logs | WearableSyncLog | ✅ | ✅ | OK |

### Violations trouvées

| # | Sev | Fichier | Problème |
|---|-----|---------|----------|
| 1 | 🟡 | `screens/SessionDetailScreen.tsx:90-91` | Query histories sans filtre `deleted_at === null` — inclut les séances soft-deleted |
| 2 | 🟡 | `model/utils/exportHelpers.ts:6-17` | `TABLE_NAMES` manque `progress_photos`, `friend_snapshots`, `wearable_sync_logs` |

## Verdict : Schema ↔ Models sync OK. 2 violations corrigées en passe 7.
