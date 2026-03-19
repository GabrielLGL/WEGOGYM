# Rapport verrif — 20260319-1408

## Résumé
- Score santé : **96/100**
- 🔴 Critiques : 4 trouvés / 4 corrigés
- 🟡 Warnings : 9 trouvés / 4 corrigés
- 🔵 Suggestions : 5 trouvées / 0 corrigées

## Problèmes restants (non corrigés)

| # | Problème | Fichiers | Effort | Groupe |
|---|----------|----------|--------|--------|
| 1 | handleGo sans useCallback (stale closure) | HomeHeroAction.tsx | 5min | A |
| 2 | Inline arrow dans shortcuts.map | HomeHeroAction.tsx | 5min | A |
| 3 | BackHandler stale closure summaryModal | WorkoutScreen.tsx | 10min | B |
| 4 | handleConfirmEnd deps incomplètes | WorkoutScreen.tsx | 5min | B |
| 5 | CoachMarks timer cleanup partiel | CoachMarks.tsx | 10min | C |
| 6 | s.history.id sans optional chaining | HomeInsightsCarousel.tsx | 5min | D |
| 7 | Render functions instables dans cards | HomeInsightsCarousel.tsx | 15min | D |
| 8 | Hardcoded fallback 'intermediate' | HomeInsightsCarousel.tsx, HomeInsightsSection.tsx | 5min | D |

## Parallélisation
Mêmes lettres = séquentiel. Lettres différentes = parallèle.
- Claude Code 1 : Groupe A — HomeHeroAction useCallback
- Claude Code 2 : Groupe B — WorkoutScreen stale closures
- Claude Code 3 : Groupe C — CoachMarks timer cleanup
- Claude Code 4 : Groupe D — HomeInsightsCarousel perf + null safety
