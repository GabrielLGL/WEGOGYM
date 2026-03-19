# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-20

## Résumé

Schema v39, 13 tables, 13 models enregistrés. **Aucun mismatch schema↔model détecté.**

## Audit colonne par colonne

| Table | Colonnes schema | Decorators model | Status |
|-------|----------------|------------------|--------|
| programs | 6 | 6 | ✓ |
| sessions | 6 | 6 | ✓ |
| session_exercises | 14 | 14 | ✓ |
| exercises | 9 | 9 | ✓ |
| performance_logs | 5 | 5 | ✓ |
| users | 28 | 28 | ✓ |
| user_badges | 4 | 4 | ✓ |
| body_measurements | 10 | 10 | ✓ |
| progress_photos | 7 | 7 | ✓ |
| histories | 9 | 9 | ✓ |
| sets | 10 | 10 | ✓ |
| friend_snapshots | 12 | 12 | ✓ |
| wearable_sync_logs | 8 | 8 | ✓ |

## Relations

15 relations vérifiées (belongs_to, has_many) — toutes FK existent et sont indexées. ✓

## Migrations

Chain v27→v39 complète et linéaire. Migration v39 ajoute `set_type` + `rpe` dans `sets` — conforme au schema.

## Points mineurs

| # | Sévérité | Problème |
|---|----------|----------|
| 1 | MOYENNE | Commentaire `schema.ts:4` dit "v38" au lieu de "v39" |
| 2 | FAIBLE | `PerformanceLog.ts` et `SessionExercise.ts` n'ont pas de raw `@field` accessor pour les FK (contrairement à `Set.ts`). Inconsistance de pattern. |

## Verdict

DB COHERENTE — Schema, models, migrations et relations sont synchronisés.
