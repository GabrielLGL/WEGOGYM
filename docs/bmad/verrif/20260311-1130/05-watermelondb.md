# Passe 5/8 — Cohérence WatermelonDB

**Run :** 20260311-1130

## Résultat : 1 CRIT (latent), 3 WARN, 1 SUGG

Schema v35 — 9 tables — 9 migrations (v27→v35) toutes couvertes.

| # | Sev | Fichier | Problème |
|---|-----|---------|----------|
| DB1 | 🔴 | `PerformanceLog.ts` / `schema.ts` | Pas de `updated_at` dans `performance_logs` — `.update()` casserait silencieusement. Table must be append-only. |
| DB2 | 🟡 | `PerformanceLog.ts` | `exercise_id` FK non exposé via `@field` — inconsistant avec History/Set |
| DB3 | 🟡 | `History.ts` | `isAbandoned!: boolean` mais schema `isOptional: true` — WDB coerce NULL→false, mais type TS menteur |
| DB4 | 🟡 | `PerformanceLog.ts` | Pas de `updated_at` — append-only ok tant que jamais `.update()` appelé. Non documenté. |
| DB5 | 🔵 | `SessionExercise.ts` | `@text` pour `superset_id`/`superset_type` — correct (string=text), convention ok |

### Schema ↔ Model sync
✅ Toutes les colonnes de schema.ts ont un field correspondant dans les modèles.
✅ Toutes les relations sont valides.
✅ Migrations v27→v35 complètes et correctes.

### Non-bloquants pour MVP
- DB1 : PerformanceLog est effectivement append-only dans le code actuel. Aucun `.update()` trouvé.
- DB2/DB3/DB4 : Patterns existants depuis longtemps, aucun crash observé.
