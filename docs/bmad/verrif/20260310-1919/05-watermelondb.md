# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-10 19:19

## Résultat : ✅ Tout cohérent

| Vérification | Résultat |
|-------------|----------|
| Schema columns ↔ Model decorators | **PASS** (10/10 tables) |
| @relation → tables/FK valides | **PASS** |
| Migrations → schema v35 | **PASS** (v27→v35) |
| Tous les models enregistrés | **PASS** (10/10) |

### ℹ️ Note : Schema est v35 (CLAUDE.md dit v34, stale)
La migration v35 ajoute `is_abandoned` à `histories`.
