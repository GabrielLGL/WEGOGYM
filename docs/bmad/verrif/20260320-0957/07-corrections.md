# Passe 7/8 — Corrections

## 7a — Critiques 🔴

| # | Fichier | Correction | Status |
|---|---------|-----------|--------|
| 1 | `components/WorkoutExerciseCard.tsx:72` | Ajout de 2 `useEffect` pour resynchroniser `localWeight` et `localReps` quand `input.weight`/`input.reps` changent | ✅ Corrigé |

## 7b — Warnings 🟡

| # | Fichier | Correction | Status |
|---|---------|-----------|--------|
| 1 | `screens/SessionDetailScreen.tsx:91` | Ajout `Q.where('deleted_at', null)` au query histories pour la prédiction de durée | ✅ Corrigé |
| 2 | `model/utils/exportHelpers.ts:6-17` | Ajout `progress_photos`, `friend_snapshots`, `wearable_sync_logs` à TABLE_NAMES | ✅ Corrigé |

## 7c — Suggestions 🔵

Aucune correction de suggestion nécessaire — le code est propre.

## Vérification post-correction

- `npx tsc --noEmit` → **0 erreur** ✅
- `npx jest` → **154 suites, 2002 tests, 0 fail** ✅
