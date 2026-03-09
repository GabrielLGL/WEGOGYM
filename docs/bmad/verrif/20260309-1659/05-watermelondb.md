# Passe 5/8 — Cohérence WatermelonDB

**Date :** 2026-03-09 16:59

## Résultat : Schema/Models synchronisés ✅

### Vérification schema v33 vs 10 modèles

| Modèle | Colonnes schema | Decorators model | Sync |
|--------|----------------|------------------|------|
| Program | 6 | 6 | ✅ |
| Session | 6 | 6 | ✅ |
| SessionExercise | 12 | 12 | ✅ |
| Exercise | 8 | 8 | ✅ |
| PerformanceLog | 5 | 5 | ✅ |
| User | 28 | 28 | ✅ |
| UserBadge | 4 | 4 | ✅ |
| BodyMeasurement | 7 | 7 | ✅ |
| History | 7 | 7 | ✅ |
| Set | 8 | 8 | ✅ |

### Migrations
- v27 → v33 : toutes cohérentes avec le schéma actuel
- v32 no-op (ai_api_key removal) documenté

### Suggestions d'amélioration (non bloquantes)

| Fichier | Suggestion |
|---------|-----------|
| `SessionExercise.ts` | Ajouter `@field('session_id')` et `@field('exercise_id')` pour accès direct aux FK (cohérence avec Session, Set, History) |
| `PerformanceLog.ts` | Ajouter `@field('exercise_id')` pour accès direct |
| `Exercise.ts` | Ajouter `@children` pour session_exercises, performance_logs, sets |
| `BodyMeasurement.ts` | `date` utilise `@field` au lieu de `@date` — incohérent mais intentionnel (timestamp brut) |
