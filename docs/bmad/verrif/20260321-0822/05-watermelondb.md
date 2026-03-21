# Passe 5/8 — Coherence WatermelonDB

## Resultat

### Schema v39 — 13 tables : toutes synchronisees avec les modeles

### Violations trouvees

| # | Sev | Fichier | Probleme |
|---|-----|---------|----------|
| 1 | 🔴 | `model/utils/dataManagementUtils.ts:23-35` | Reads inside `database.write()` — risque de deadlock WatermelonDB |
| 2 | 🔴 | `model/utils/dataManagementUtils.ts:54-79` | `deleteAllData` ne reset pas friendCode, wearableProvider, wearableSyncWeight, wearableLastSyncAt |
| 3 | 🔵 | `model/schema.ts:46` | `deleted_at` sur table sessions jamais utilise — feature morte ou anticipee |

### Points conformes
- Schema ↔ Models sync OK (13/13 tables)
- Migrations v27→v39 completes
- Relations @relation/@children toutes correctes
- Soft-delete histories filtre `deleted_at === null` partout
- TABLE_NAMES dans exportHelpers couvre les 13 tables
- deleteAllData couvre les 13 tables

## Verdict : 2 CRITICAL corriges en passe 7, 1 SUGGESTION non corrigee
