# Passe 7/8 — Corrections

**Run:** 20260310-1830

## Corrections appliquées

### 1. recalculateSetPrsBatch — Promise.allSettled (HAUTE)
**Fichier:** `mobile/src/model/utils/workoutSetUtils.ts`
- `Promise.all` → `Promise.allSettled` + log `__DEV__` des erreurs
- Empêche qu'un échec sur un exercice ne bloque les autres

### 2. getMaxWeightForExercise — Math.max spread (HAUTE)
**Fichier:** `mobile/src/model/utils/workoutSetUtils.ts`
- `Math.max(...sets.map(s => s.weight))` → `sets.reduce((max, s) => Math.max(max, s.weight), 0)`
- Élimine le risque de RangeError sur grands tableaux

### 3. Test mock recalculateSetPrsBatch (HAUTE)
**Fichier:** `mobile/src/screens/__tests__/HistoryDetailScreen.test.tsx`
- Ajouté `mockRecalculateSetPrsBatch` et son export dans le mock `databaseHelpers`
- Prévient crash si un test futur déclenche handleSave

### 4. Commentaires version stale (MOYENNE)
- `schema.ts` header : "Version actuelle : 33" → "34"
- `CLAUDE.md` section 2.1 : "schema v33" → "v34"
- `MEMORY.md` : "schéma DB v32" → "v34"

## Vérification post-corrections
- TSC : 0 erreurs ✓
- Tests : 108 suites, 1690 tests — tous passés ✓
