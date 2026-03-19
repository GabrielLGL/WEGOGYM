# Passe 3/8 — Code Review Adversarial

**Date :** 2026-03-20

## Résumé

7 problèmes identifiés (0 critique, 3 warning, 4 suggestions).

## Violations

| # | Fichier | Sévérité | Problème |
|---|---------|----------|----------|
| 1 | `CLAUDE.md` + `schema.ts:4` | WARNING | Documentation dit schema v38 mais code est v39. MEMORY.md dit v35. |
| 2 | `workoutSessionUtils.ts:207-214` | WARNING | `createQuickStartSession` fait 2 `database.write()` séquentiels au lieu d'un seul bloc atomique. Programme orphelin possible si crash entre les deux. |
| 3 | `HomeHeroAction.tsx:85-89` | WARNING | `handleQuickStart` async sans `try/catch`. Crash silencieux si DB échoue. |
| 4 | `HomeHeroAction.tsx:47` | SUGGESTION | Pattern `deletedAt === null && !isAbandoned` inline au lieu d'un helper partagé. |
| 5 | `navigation/index.tsx:229-342` | SUGGESTION | `fetchCurrentUser()` appelé 2 fois au démarrage (AppNavigator + AppContent). |
| 6 | `StatsScreen.tsx:234-239` | SUGGESTION | Query `sets` charge TOUS les sets de toutes les histories — scalabilité limitée. |
| 7 | `workoutSessionUtils.ts:118-189` | SUGGESTION | `getLastSessionVolume` et `getLastSessionDensity` partagent la même logique de recherche. Violation DRY. |

## Verdict

Aucun risque critique de crash ou corruption. 3 warnings à corriger avant merge.
