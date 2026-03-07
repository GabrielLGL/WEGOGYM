# Passe 7 — Corrections
**Date:** 2026-03-07 00:51

## 7a — Critiques (2 fixes)

### C1 — WorkoutExerciseCard i18n
4 strings FR hardcodees remplacees par cles i18n `t.workout.*`.
Ajout de 7 cles dans fr.ts et en.ts : targetLabel, reps, lastPerfLabel, lastPerfOn, lastPerfSet, lastPerfSets, suggestionLabel, noSetsMessage.

### C2 — buildWeeklyActivity soft-delete filter
Ajout `h.deletedAt === null` dans le filtre de `buildWeeklyActivity()` (statsVolume.ts:157).

## 7b — Warnings (5 fixes)

### W1 — formatWeight dead ternary
`WorkoutSummarySheet.tsx:63` — branche float corrigee : `${w}` → `${w.toFixed(1)}`.

### W2 — Double exercise.observe()
`WorkoutExerciseCard.tsx:352-361` — Observable extraite dans `exercise$`, reutilisee pour `exercise` et `lastPerformance`. Plus qu'un seul abonnement DB.

### W3/W4 — Dialog bloquee sur erreur
`ProgramDetailScreen.tsx:257` et `ProgramsScreen.tsx:302` — `setIsAlertVisible(false)` deplace dans `finally` pour garantir la fermeture meme si onConfirm throw.

### W5 — @text decorators
`SessionExercise.ts:18-19` — `@field` → `@text` pour `superset_id` et `superset_type` (colonnes string).

## Verification post-fix
- `npx tsc --noEmit` → 0 erreurs
- `npm test` → 1558 tests, 0 failures
