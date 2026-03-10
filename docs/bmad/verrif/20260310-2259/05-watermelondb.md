# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-10 22:59

## Résumé

✅ **Aucune violation critique ou bloquante.**

- Schema v35 parfaitement synchronisé avec les 10 modèles
- Chaîne de migrations complète (v27→v35)
- Relations correctes partout
- Soft-delete filtré dans toutes les requêtes de liste/stats
- `database.write()` respecté pour toutes les mutations

## Schema vs Models

| Table | Colonnes | Verdict |
|-------|----------|---------|
| programs (6) | ✅ | OK |
| sessions (6) | ✅ | OK |
| session_exercises (14) | ✅ | OK |
| exercises (9) | ✅ | OK |
| performance_logs (5) | ✅ | OK |
| users (28) | ✅ | OK |
| user_badges (4) | ✅ | OK |
| body_measurements (8) | ✅ | OK |
| histories (8) | ✅ | OK |
| sets (7) | ✅ | OK |

## Relations

Toutes les `@relation`, `@children`, et `static associations` référencent les bons noms de tables et colonnes FK. ✅

## Migrations (v27→v35)

Chaîne complète et cohérente avec le schéma final. ✅

## Soft-delete

Toutes les requêtes de liste/agrégation filtrent `deleted_at = null`. Les accès directs par ID sont intentionnels. ✅

## Suggestions (non bloquantes)

| # | Fichier | Description |
|---|---------|-------------|
| 🔵 S1 | `BodyMeasurement.ts:7` | `@field('date') date!: number` — nom ambigu (timestamp brut, pas Date) |
| 🔵 S2 | `PerformanceLog.ts` | Pas de `@field('exercise_id')` explicite (relation gère la FK) — incohérent avec Set/History qui ont les deux |
| 🔵 S3 | `SessionExercise.ts` | Idem — pas de `@field` explicite pour session_id/exercise_id |
