# Passe 4/8 — Bugs silencieux

**Run :** 20260311-1130

## Résultat : 4 CRIT, 10 WARN, 3 SUGG

| ID | Sev | Fichier | Catégorie | Problème |
|----|-----|---------|-----------|----------|
| B01 | 🟡 | `geminiProvider.ts:37` | Async/try-catch | `response.json()` non protégé |
| B04 | 🟡 | `HomeScreen.tsx:197` | Null safety | `lastCompletedHistory.session.id` sans null-safe |
| B05 | 🟡 | `workoutSetUtils.ts:142` | Null safety | `a.history.id` sans null-safe |
| B06 | 🟡 | `exerciseStatsUtils.ts:52` | Null safety | `s.history.id` sans null-safe |
| B07 | 🔴 | `RestTimer.tsx:94` | Memory leak | Animation spring jamais arrêtée au unmount |
| B08 | 🟡 | `SessionDetailScreen.tsx:93` | Memory leak | Fade-in animation sans cleanup |
| B09 | 🟡 | `useAssistantWizard.ts:383` | Memory leak | Fade-in animation sans cleanup |
| B10 | 🔴 | `useWorkoutCompletion.ts:148-167` | Race condition | Guards `isMountedRef` manquants entre awaits → double XP |
| B11 | 🟡 | `WorkoutScreen.tsx:272` | Stale closure | `abandonModal` absent des deps useCallback |
| B12 | 🟡 | `WorkoutScreen.tsx:249` | Stale closure | `confirmEndModal`/`summaryModal` absents des deps |
| B15 | 🔵 | `useAssistantWizard.ts:425` | Stale closure | `sessionMode` instabilité d'identité objet |
| B16 | 🔴 | `exportHelpers.ts:113` | WatermelonDB | `fetch()` inside `write()` — risque deadlock |
| B17 | 🟡 | `Exercise.ts:69` | WatermelonDB | 3× `fetch()` inside `write()` |
| B18 | 🟡 | `workoutSetUtils.ts:92` | WatermelonDB | `fetch()` inside `write()` |
| B19 | 🟡 | `workoutSessionUtils.ts:29,48,67,99,152` | WatermelonDB | `find()` inside `write()` (5 occurrences) |
| B20 | 🔵 | `WorkoutScreen.tsx:237` | Stale closure | `abandonModal.open` absent des deps |
| B21 | 🔵 | `useWorkoutCompletion.ts:86` | Pattern OK | `paramsRef` correct, no action |

## Priorité critique

1. **B16** — `exportHelpers.ts` : Move fetch() hors de write() dans importAllData (deadlock)
2. **B10** — `useWorkoutCompletion.ts` : Ajouter isMountedRef guards manquants (double XP)
3. **B07** — `RestTimer.tsx` : Stop spring animation on unmount
