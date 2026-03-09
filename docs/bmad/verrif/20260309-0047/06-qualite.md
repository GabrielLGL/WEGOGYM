# Passe 6/8 — Code mort & Qualite
**Date:** 2026-03-09 00:47

## Critiques (0)
Aucun `any` en production, console.log gardes par `__DEV__`, pas de couleurs hardcodees.

## Warnings (2) — 1 CORRIGE
1. **Pattern mounted/setMounted duplique 17 fois** → **CORRIGE** : hook `useDeferredMount()` extrait et utilise dans les 17 ecrans.
2. **8 fichiers > 500 lignes** : StatsCalendarScreen (915), HomeScreen (664), ExerciseCatalogScreen (630), exerciseMetadata (605), WorkoutExerciseCard (584), HistoryDetailScreen (568), useAssistantWizard (554), SessionDetailScreen (554).

## Suggestions
- Decouper StatsCalendarScreen en sous-composants (priorite haute).
- ~12 exports "fantomes" (utilises uniquement dans les tests).
- Pas de TODO/FIXME/HACK dans le codebase.
