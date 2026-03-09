# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-09 20:11

## Points conformes

- Toutes les mutations WDB dans `database.write()`
- Tous les `setInterval`/`setTimeout` ont un cleanup
- Guards `isMountedRef` sur les async critiques (WorkoutScreen, useWorkoutCompletion, RestTimer)
- try/catch sur toutes les opérations DB critiques

## Violations détectées

| # | Sévérité | Fichier | Ligne(s) | Problème |
|---|----------|---------|----------|----------|
| 1 | WARN | `hooks/useWorkoutCompletion.ts` | 94-98 | Erreur `completeWorkoutHistory` catchée mais exécution continue vers gamification — données XP/tonnage écrites même si historique pas fermé |
| 2 | WARN | `components/CoachMarks.tsx` | 112-118 | Race condition : safety timeout 10s peut double-fire `onComplete` si l'utilisateur clique juste avant — le guard `dismissed` est en state (async) pas en ref |
| 3 | WARN | `hooks/useCalendarDayDetail.ts` | 78-221 | `handleDayPress` async sans guard unmount — state updates potentiellement après démontage |
| 4 | WARN | `model/utils/exportHelpers.ts` | 113-147 | Import supprime toutes les données puis recrée — pas de rollback explicite si la création échoue partiellement (single `write()` devrait protéger mais non vérifié) |
| 5 | WARN | `hooks/useWorkoutCompletion.ts` | 150-157 | `unsafeFetchRaw()` retourne un tableau non typé — cast best-effort |

## Recommandations

1. **CoachMarks** : Remplacer le guard `dismissed` state par un `completedRef` ref
2. **useWorkoutCompletion** : Abort gamification si `completeWorkoutHistory` échoue
3. **useCalendarDayDetail** : Ajouter un flag `cancelled` dans le callback async
