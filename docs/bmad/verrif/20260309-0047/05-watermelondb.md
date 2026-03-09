# Passe 5/8 — Coherence WatermelonDB
**Date:** 2026-03-09 00:47

## Critiques (0)
Schema v33 et modeles parfaitement synchronises. Toutes mutations dans `database.write()`. Decorateurs coherents.

## Warnings (3) — TOUS CORRIGES
1. **getMaxWeightForExercise** (workoutSetUtils.ts l.19-33) — ne filtrait pas les histories soft-deleted → **CORRIGE** : filtre `Q.where('deleted_at', null)` ajoute.
2. **getLastPerformanceForExercise** (exerciseStatsUtils.ts l.38-84) — idem → **CORRIGE** : filtre soft-delete ajoute.
3. **SQL brute dans useWorkoutCompletion.ts l.151** — COUNT sans filtre soft-delete → **CORRIGE** : JOIN avec histories + filtre deleted_at IS NULL.

## Points conformes
- Schema ↔ Model sync : OK
- Relations (@relation, @children) : OK
- Decorateurs : OK
- duplicate() : copie tous les champs + children
- Soft-delete History : filtre dans la majorite des requetes
- withObservables : 33 fichiers
