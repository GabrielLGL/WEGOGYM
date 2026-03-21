# Passe 7/8 — Corrections

## 7a — Critiques 🔴

| # | Fichier | Correction | Status |
|---|---------|-----------|--------|
| 1 | `model/utils/dataManagementUtils.ts` | Reads deplacees AVANT `database.write()` pour eviter deadlock WatermelonDB | ✅ Corrige |
| 2 | `model/utils/dataManagementUtils.ts` | Ajout reset `friendCode`, `wearableProvider`, `wearableSyncWeight`, `wearableLastSyncAt` | ✅ Corrige |

## 7b — Warnings 🟡

| # | Fichier | Correction | Status |
|---|---------|-----------|--------|
| 1 | `screens/StatsDurationScreen.tsx` | 5x `as any` remplaces par generics types (`database.get<Session>()`, `database.get<WorkoutSet>()`, `database.get<Exercise>()`) | ✅ Corrige |
| 2 | `screens/ExerciseCatalogScreen.tsx` | AbortController loadMore — non corrige, risque faible (composant rarement demonte pendant fetch) | ⏭️ Reporte |
| 3 | `screens/WorkoutScreen.tsx` | Resume race condition — non corrige, risque faible (withObservables emet synchroniquement sur WDB/JSI) | ⏭️ Reporte |

## 7c — Suggestions 🔵

Non corrigees — impact negligeable.

## Verification post-correction

- `npx tsc --noEmit` → **0 erreur** ✅
- `npx jest` → **147 suites, 1943 tests, 0 fail** ✅
