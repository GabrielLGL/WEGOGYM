# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-08 14:01

## Résumé

- 🔴 Critiques : 2
- 🟡 Warnings : 4

## Violations détectées

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🔴 | RestTimer.tsx | 172 | Textes i18n hardcodés : "REPOS EN COURS" et "Ignorer" |
| 2 | 🔴 | WorkoutHeader.tsx | 35 | Texte i18n hardcodé : "séries" |
| 3 | 🟡 | SessionDetailScreen.tsx | 102, 143 | `toggleSelection` et `getGroupInfo` non wrappés dans `useCallback` — annule la memoization de `renderDraggableItem` |
| 4 | 🟡 | SessionDetailScreen.tsx | 126-134 | `handleCreateGroup` et `handleUngroup` async sans try/catch |
| 5 | 🟡 | WorkoutScreen.tsx | 251-280 | `handleValidateSet` capture `validatedSets` dans deps → re-renders en cascade sur chaque validation |
| 6 | 🟡 | WorkoutSummarySheet.tsx | 84 | `debounceRef` typé `NodeJS.Timeout` au lieu de `ReturnType<typeof setTimeout>` |
