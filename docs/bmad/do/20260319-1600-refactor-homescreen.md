# refactor(home) — Extraire HomeScreen en 8 sous-composants
Date : 2026-03-19 16:00

## Instruction
Refactor HomeScreen.tsx (2082 lignes) en composants extraits dans mobile/src/components/home/.
Corriger : (1) non-null assertion ! sur motivationData.context → optional chaining,
(2) fetch impératif programs → withObservables.

## Rapport source
docs/bmad/verrif/20260319-1009/RAPPORT.md — problèmes #2, #4, #5

## Classification
Type : refactor
Fichiers modifiés :
- mobile/src/screens/HomeScreen.tsx (2082 → 536 lignes)
- mobile/src/screens/__tests__/HomeScreen.test.tsx (ajout prop programs)
- mobile/src/components/home/types.ts (nouveau)
- mobile/src/components/home/index.ts (nouveau)
- mobile/src/components/home/HomeHeaderCard.tsx (nouveau)
- mobile/src/components/home/HomeGamificationCard.tsx (nouveau)
- mobile/src/components/home/HomeStreakSection.tsx (nouveau)
- mobile/src/components/home/HomeBodyStatusSection.tsx (nouveau)
- mobile/src/components/home/HomeWeeklyGoalsCard.tsx (nouveau)
- mobile/src/components/home/HomeWorkoutSection.tsx (nouveau)
- mobile/src/components/home/HomeWeeklyActivityCard.tsx (nouveau)
- mobile/src/components/home/HomeInsightsSection.tsx (nouveau)

## Ce qui a été fait
1. **Fix #5** : Supprimé le `useState` + `useEffect` impératif pour programs. Ajouté `programs: database.get<Program>('programs').query().observe()` dans le HOC withObservables. Programs est maintenant réactif.
2. **Fix #4** : Remplacé `motivationData.context!` (non-null assertion) par `motivationData?.context` avec optional chaining dans HomeInsightsSection.
3. **Refactor #2** : Extrait 8 sous-composants dans `mobile/src/components/home/` :
   - HomeHeaderCard (greeting, KPIs, settings button)
   - HomeGamificationCard (XP, level, streak, athlete class, badges)
   - HomeStreakSection (heatmap + milestones)
   - HomeBodyStatusSection (readiness, fatigue, recovery, rest suggestion)
   - HomeWeeklyGoalsCard (sessions + volume goals)
   - HomeWorkoutSection (last workout summary + quick-start)
   - HomeWeeklyActivityCard (weekly day-by-day chart)
   - HomeInsightsSection (motivation, weekly report, flashback, deload)
4. Chaque composant possède ses propres useMemos et styles locaux.
5. Export `HomeContent` préservé pour les tests.
6. Tests mis à jour avec la nouvelle prop `programs`.

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 2230 passed, 188 suites
- Nouveau test créé : non (tests existants suffisants)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260319-1600

## Commit
5314f13 style(theme): replace 71 hardcoded hex colors with semantic theme tokens
Note : fichiers embarqués dans le commit de l'autre Claude Code (couleurs hardcodées).
Le refactoring HomeScreen est bien inclus dans ce commit.
