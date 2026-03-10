# Passe 7/8 — Corrections

**Date :** 2026-03-10 18:32

## 7a — Critiques 🔴 (2 corrigés)

### C1 — Stale closure `unvalidateSet` (CR-1/B-3)
**Fichier :** `hooks/useWorkoutState.ts`
**Problème :** `unvalidateSet` dépendait de `validatedSets` dans ses deps useCallback → recréé à chaque validation, causant re-renders en cascade + stale closure lors d'appels rapides.
**Fix :** Ajout `validatedSetsRef` (ref synchronisé), lecture depuis la ref au lieu de la closure. `validatedSets` retiré des deps.

### C2 — `duplicateSession()` ne remappait pas les superset IDs (B-1)
**Fichier :** `hooks/useProgramManager.ts`
**Problème :** Lors de la duplication d'une session, les `supersetId` étaient copiés verbatim → les exercices dupliqués partageaient les mêmes IDs que l'original, risque de conflits.
**Fix :** Ajout `supersetIdMap` avec remapping (même pattern que `Program.duplicate()`).

## 7b — Warnings 🟡 (1 corrigé)

### W1 — Quick-start navigation vers session supprimée (B-2)
**Fichier :** `screens/HomeScreen.tsx`
**Problème :** Si la session est supprimée entre le render du card et le tap, `findAndObserve` crasherait.
**Fix :** Guard `sessions.find()` avant navigation, no-op si session absente.

## 7c — Suggestions 🔵 (non corrigées)

Les suggestions (ExercisePickerModal FlatList, handleTilePress useCallback, useWorkoutCompletion deps pattern) sont des optimisations mineures qui ne justifient pas le risque de régression.

## Vérification post-correction

- TypeScript : ✅ 0 erreur
- Tests : ✅ 1690 passed, 108 suites, 0 fail
