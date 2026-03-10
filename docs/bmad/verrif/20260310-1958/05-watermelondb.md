# Passe 5/8 — Cohérence WatermelonDB

## Résultat : ✅ Schéma, modèles et migrations synchronisés

### Schema v35 vs History model

| Colonne schema | Décorateur modèle | Match |
|----------------|-------------------|-------|
| session_id | @field + @relation | ✅ |
| start_time | @date | ✅ |
| end_time | @date (optional) | ✅ |
| note | @text (optional) | ✅ |
| created_at | @readonly @date | ✅ |
| updated_at | @readonly @date | ✅ |
| deleted_at | @date (optional) | ✅ |
| is_abandoned | @field (optional) | ✅ |

### Migrations

- v35 ajoute `is_abandoned` sur `histories` — cohérent avec schema et modèle
- Chaîne de migration v27→v35 complète

### Soft-delete

- Toutes les queries d'historique filtrent `Q.where('deleted_at', null)` — vérifié sur :
  - HomeScreen, StatsVolumeScreen, workoutSetUtils, exerciseStatsUtils
