# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-08 14:01

## Résumé

✅ **Aucun problème critique.** Le système WatermelonDB est cohérent.

## Vérifications

| Check | Status |
|-------|--------|
| Schema-Model column sync (10 tables) | ✅ OK |
| Relations et associations | ✅ OK |
| Migrations v27-v32 | ✅ OK |
| Types decorator vs schema | ✅ OK |
| Mutations dans database.write() | ✅ OK |
| Soft-delete History | ✅ OK |
| @children typé Query<T> | ✅ OK |
| tsconfig decorator settings | ✅ OK |

## Points mineurs (non bloquants)

| # | Sévérité | Fichier | Problème |
|---|----------|---------|----------|
| 1 | 🟡 | Session.ts:16 | `position!: number` mais schema `isOptional: true` — devrait être `number | null` |
| 2 | 🟡 | Exercise.ts:28 | `_muscles!: string` mais schema `isOptional: true` — devrait être `string | null` |
| 3 | 🔵 | Session.ts:24 | `deleted_at` existe mais jamais filtré — dead code |
| 4 | 🔵 | BodyMeasurement.ts:7 | `@field('date')` au lieu de `@date('date')` — incohérent avec le reste |
