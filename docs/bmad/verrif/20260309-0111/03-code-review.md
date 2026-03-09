# Passe 3/8 — Code Review
**Date:** 2026-03-09 01:11

## Critiques (0)
Aucun.

## Warnings (2)
1. **useStyles sans useMemo** dans ~33 fichiers (ecrans + composants) → **CORRIGE** : tous wrappés avec `useMemo(() => ..., [colors])`.
2. **sentry.ts l.56-57** — `console.log` dans callback `beforeSend` inclus dans le bundle de production. Non exécuté car Sentry `enabled: !__DEV__`, mais code présent.

## Suggestions (3)
1. **useModalState() sous-utilisé** — ~25 etats modaux dans 8 ecrans utilisent useState(false) au lieu du hook. ProgramsScreen (7), WorkoutScreen (5), SessionDetailScreen (5).
2. **WorkoutExerciseCard** — `createStyles` devrait être renommé `useStyles` pour la convention.
3. **Accessibilité** — quasi-absente (6 annotations dans tout le codebase).
