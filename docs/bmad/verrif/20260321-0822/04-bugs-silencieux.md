# Passe 4/8 — Bugs silencieux

## Bugs trouves

### 🔴 CRITICAL

| # | Fichier | Ligne | Bug | Impact |
|---|---------|-------|-----|--------|
| 1 | `model/utils/dataManagementUtils.ts` | 23-35 | 12 `query().fetch()` inside `database.write()` — risque de deadlock WatermelonDB | Possible freeze de l'app lors de "Supprimer toutes les donnees" |
| 2 | `model/utils/dataManagementUtils.ts` | 54-79 | `deleteAllData` ne reset pas `friendCode`, `wearableProvider`, `wearableSyncWeight`, `wearableLastSyncAt` | Donnees residuelles apres suppression totale |

### 🟡 WARNING

| # | Fichier | Ligne | Bug | Impact |
|---|---------|-------|-----|--------|
| 1 | `screens/StatsDurationScreen.tsx` | 148,190,197,201,203 | 5x `as any` sur records WatermelonDB — contourne le typage | Pas de bug runtime, mais masque les erreurs de typage |

## Verdict : 2 CRITICAL + 1 WARNING — tous corriges en passe 7
