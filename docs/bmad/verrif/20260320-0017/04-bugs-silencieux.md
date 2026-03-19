# Passe 4/8 — Bugs Silencieux

**Date :** 2026-03-20

## Résumé

7 problèmes identifiés (1 critique, 2 haute, 2 moyenne, 2 faible).

## Points conformes

- Toutes les mutations WDB dans `database.write()` ✓
- Tous les `setTimeout`/`setInterval` ont cleanup ✓
- Pas de `<Modal>` natif ✓
- `console.log` gardés par `__DEV__` ✓
- `isMountedRef` appliqué dans WorkoutScreen et RestTimer ✓

## Violations

| # | Fichier | Sévérité | Problème |
|---|---------|----------|----------|
| 1 | `HomeHeroAction.tsx:85-90` | CRITIQUE | `handleQuickStart` sans try/catch. Si createQuickStartSession échoue, navigation.navigate reçoit un sessionId undefined → crash cascade. |
| 2 | `workoutSessionUtils.ts:31-231` | HAUTE | 5 fonctions font `database.find()` qui throw si ID inexistant, sans try/catch ni documentation `@throws`. |
| 3 | `workoutSetUtils.ts:74-130` | HAUTE | `saveWorkoutSet` et `addRetroactiveSet` font 2 `database.find()` sans try/catch. |
| 4 | `schema.ts:5` | MOYENNE | Commentaire version dit v38, code dit v39. |
| 5 | `workoutSessionUtils.ts:174` | MOYENNE | `mostRecent.endTime!.getTime()` — non-null assertion sur un champ nullable. Le filtre garantit non-null mais TypeScript ne le sait pas. |
| 6 | `workoutSetUtils.ts:159` | FAIBLE | `s.history.id` au lieu de `s.historyId` — indirection inutile. |
| 7 | `StatsScreen.tsx:248` | FAIBLE | Style inline au lieu de StyleSheet. |

## Verdict

1 bug critique à corriger (handleQuickStart). Le reste est de la dette technique acceptable.
