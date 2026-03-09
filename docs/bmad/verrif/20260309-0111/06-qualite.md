# Passe 6/8 — Code mort & Qualite
**Date:** 2026-03-09 01:11

## Critiques (0)
Aucun.

## Warnings (3)
1. **BadgeCard/BadgeCelebration** — affichaient `badge.title` en francais dur au lieu de `t.badges.list[id]` → **CORRIGE**.
2. **BADGE_CATEGORY_LABELS dead code** dans badgeConstants.ts — duplique `t.badges.categories`. Non corrigé (test dépendant).
3. **10 fichiers > 500 lignes** : StatsCalendarScreen (915), HomeScreen (664), ExerciseCatalogScreen (630), exerciseMetadata (605), WorkoutExerciseCard (584), HistoryDetailScreen (568), useAssistantWizard (554), SessionDetailScreen (554), StatsDurationScreen (537), WorkoutScreen (482).

## Suggestions (3)
1. **`let output: any`** — 10 occurrences dans useWorkoutCompletion.test.ts.
2. **~200 `as any`** dans les tests — creer des mock factories typees.
3. **`formatDuration`** — deux fonctions avec le meme nom (secondes vs minutes). Risque de confusion.

## Points conformes
- Zero `any` en production
- Tous console.log gardes par `__DEV__`
- Pas de couleurs hardcodees en production
- Pas de TODO/FIXME/HACK
- i18n adopte dans 51+ fichiers
