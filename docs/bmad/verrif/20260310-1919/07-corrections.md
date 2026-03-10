# Passe 7/8 — Corrections

**Date :** 2026-03-10 19:19

## 7a — Critiques 🔴 (2 corrigés)

### C1 — StatsScreen + StatsExercisesScreen : sets sans filtre soft-delete
**Fichiers :** `screens/StatsScreen.tsx`, `screens/StatsExercisesScreen.tsx`
**Problème :** Query `sets` sans `Q.on('histories', Q.where('deleted_at', null))` → sets de histories supprimées polluaient les stats.
**Fix :** Ajout du filtre join sur histories.deleted_at.

### C2 — PR detection échoue pour le premier set d'un exercice
**Fichier :** `hooks/useWorkoutState.ts:112`
**Problème :** `maxWeight > 0 && weight > maxWeight` → le tout premier set (maxWeight=0) n'était jamais PR.
**Fix :** `weight > 0 && weight > maxWeight` — le premier set avec poids positif est maintenant un PR.
**Tests :** 3 tests mis à jour dans `useWorkoutState.test.ts` pour refléter le nouveau comportement.

## 7b — Warnings 🟡 (1 corrigé)

### W1 — RestTimer dead styles
**Fichier :** `components/RestTimer.tsx:208-216`
**Problème :** `progressBarWrapper` et `progressBarFill` définis mais jamais utilisés.
**Fix :** Supprimés.

## Non corrigés
- B-1/B-2 (timer cleanup ProgramsScreen/ProgramDetailScreen) : **Faux positifs** — cleanup déjà présent dans useEffect
- CR-3/CR-8 (MUSCLES_FOCUS_OPTIONS i18n) : Labels traduits au rendu via `t.assistant.musclesFocus[muscle]`
- CR-5 (se.exercise.id null guard) : Risque théorique, pas de cas réel
- CR-6 (concurrent writes) : WatermelonDB sérialise, pas de corruption
- CR-7 (HistoryDetailScreen validation) : Changement fonctionnel → `/do`

## Vérification post-correction

- TypeScript : ✅ 0 erreur
- Tests : ✅ 1691 passed, 108 suites, 0 fail
