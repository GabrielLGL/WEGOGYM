# Passe 5/8 — WatermelonDB

**Run:** 20260310-1830

## Schema v34 sync

| Vérification | Statut |
|-------------|--------|
| schema.ts version = 34 | ✓ |
| migration toVersion: 34 | ✓ |
| sets.created_at isIndexed: true | ✓ |
| unsafeExecuteSql CREATE INDEX IF NOT EXISTS | ✓ |

## Schema ↔ Model sync

| Table | Colonnes schema | Decorators model | Statut |
|-------|----------------|-----------------|--------|
| sets (8 cols) | history_id, exercise_id, weight, reps, set_order, is_pr, created_at, updated_at | Tous matchent | ✓ |
| histories (7 cols) | session_id, start_time, end_time, note, created_at, updated_at, deleted_at | Tous matchent | ✓ |
| exercises (9 cols) | name, is_custom, muscles, equipment, notes, animation_key, description, created_at, updated_at | Tous matchent | ✓ |

## Mutations DB
- Toutes dans `database.write()` ✓
- Pas de nested write ✓
- `recalculateSetPrsBatch` appelé hors du write ✓

## Note sur index dupliqué
`sets.created_at` a à la fois `isIndexed: true` (schema) et `CREATE INDEX` (migration). Les deux coexistent sans conflit — noms d'index différents. Nécessaire pour couvrir fresh installs (schema) ET existing users (migration).
