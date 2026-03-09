# Passe 4/8 — Bugs silencieux
**Date:** 2026-03-09 01:11

## Critiques (0)
Aucun.

## Warnings (3)
1. **ExerciseCatalogScreen l.306-348** — `loadInitial` et `loadMore` (async Supabase) sans guard cancelled/mounted. Race condition si l'utilisateur navigue pendant le chargement.
2. **CoachMarks.tsx l.135** — deps useEffect manquantes (`measureTarget`). Stale closure possible si step change pendant visible=true.
3. **CoachMarks.tsx l.171** — deps useEffect manquantes (`measureTarget`, `tooltipAnim`).

## Suggestions (1)
1. **navigation/index.tsx l.157, 243** — useEffect avec DB fetch sans flag cancelled. Risque faible (composant root).

## Points conformes
- Toutes les mutations DB dans write()
- Tous les timers avec cleanup
- isMountedRef sur les flows async critiques (WorkoutScreen, useAssistantWizard)
- Pas de .subscribe() sans cleanup
