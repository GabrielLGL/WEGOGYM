# Passe 5/8 — Cohérence WatermelonDB

## Schema v35 — 10 tables

| Table | Colonnes |
|-------|----------|
| programs | name, position, equipment, frequency, created_at, updated_at |
| sessions | program_id, name, position, created_at, updated_at, deleted_at |
| session_exercises | session_id, exercise_id, position, sets_target, sets_target_max, reps_target, weight_target, superset_id, superset_type, superset_position, notes, rest_time, created_at, updated_at |
| exercises | name, is_custom, muscles, equipment, notes, animation_key, description, created_at, updated_at |
| performance_logs | exercise_id, sets, weight, reps, created_at |
| users | 29 colonnes (email → cgu_version_accepted + timestamps) |
| user_badges | badge_id, unlocked_at, created_at, updated_at |
| body_measurements | date, weight, waist, hips, chest, arms, created_at, updated_at |
| histories | session_id, start_time, end_time, note, created_at, updated_at, deleted_at, is_abandoned |
| sets | history_id, exercise_id, weight, reps, set_order, is_pr, created_at, updated_at |

## Model ↔ Schema sync

| Table | Match? |
|-------|--------|
| programs | ✅ OK |
| sessions | ✅ OK |
| session_exercises | ✅ OK |
| exercises | ✅ OK |
| performance_logs | ✅ OK (relation-only pour exercise_id) |
| users | ✅ OK (29 colonnes mappées) |
| user_badges | ✅ OK |
| body_measurements | ✅ OK |
| histories | ✅ OK (is_abandoned ajouté v35) |
| sets | ✅ OK |

## Migrations
- **Version chain:** 27 → 28 → 29 → 30 → 31 → 32 → 33 → 34 → 35
- **Intégrité:** ✅ OK — aucun trou, aucun doublon

## Soft-delete filtering
26 requêtes vérifiées sur `histories` — **toutes appliquent le double filtre** `deleted_at === null` + `is_abandoned === null OR false`.

Exceptions légitimes :
- `dataManagementUtils.ts:28` — deleteAllData (intentionnel : supprime tout)
- `HistoryDetailScreen.tsx:583` — findAndObserve par ID (enregistrement unique)

## Issues trouvées
**Aucune.**
