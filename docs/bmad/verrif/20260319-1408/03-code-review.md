# Passe 3/8 — Code Review

## Résultat : 8 problèmes trouvés (2 CRIT, 5 WARN, 1 SUGG)

| # | Sévérité | Type | Fichier | Lignes |
|---|----------|------|---------|--------|
| 1 | CRIT | Null Safety | HomeInsightsCarousel.tsx | 49, 53, 96, 112 |
| 2 | WARN | Stale Closure | HomeHeroAction.tsx | 73-82 |
| 3 | WARN | Missing Callback | HomeHeroAction.tsx | 156-159 |
| 4 | CRIT | Missing Deps | WorkoutScreen.tsx | 304-314 |
| 5 | WARN | Incomplete Deps | WorkoutScreen.tsx | 316-337 |
| 6 | WARN | Timer Cleanup | CoachMarks.tsx | 115-163 |
| 7 | SUGG | Null Safety | HomeInsightsCarousel.tsx | 57, 68, 104 |
| 8 | WARN | Render Performance | HomeInsightsCarousel.tsx | 125-169 |

### Détail

**#1 CRIT — startTime.getTime() sans null check (HomeInsightsCarousel)**
`h.startTime.getTime()` appelé sans vérifier que startTime n'est pas null. Crash possible.

**#2 WARN — handleGo sans useCallback (HomeHeroAction)**
Closure potentiellement stale sur activeWorkout/lastSession.

**#3 WARN — Inline arrow dans map (HomeHeroAction)**
Nouvelle fonction à chaque render dans shortcuts.map.

**#4 CRIT — BackHandler stale closure (WorkoutScreen)**
summaryModal.isOpen capturé dans le callback du BackHandler, potentiellement stale.

**#5 WARN — handleConfirmEnd deps incomplètes (WorkoutScreen)**
confirmEndModal et summaryModal manquants dans les deps de useCallback.

**#6 WARN — Timers CoachMarks cleanup faible**
Plusieurs setTimeout avec cleanup partiel si dismissed change.

**#7 SUGG — s.history.id sans null check (HomeInsightsCarousel)**
Relation WatermelonDB lazy-loaded, pourrait être un proxy.

**#8 WARN — Render functions dans cards array (HomeInsightsCarousel)**
Fonctions render recréées à chaque recalcul du useMemo.
