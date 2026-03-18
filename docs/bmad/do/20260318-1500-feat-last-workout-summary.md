# feat(home) — Last workout summary card
Date : 2026-03-18 15:00

## Instruction
docs/bmad/prompts/20260318-1400-sprint14-A.md

## Rapport source
docs/bmad/prompts/20260318-1400-sprint14-A.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/workoutSummaryHelpers.ts (NOUVEAU)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `workoutSummaryHelpers.ts` avec :
  - `WorkoutSummary` interface
  - `computeWorkoutSummary()` : dernière séance non-abandonnée, volume total, durée, densité, PRs, top exercice, timeAgo
  - `formatTimeAgo()` : formatage bilingue fr/en (il y a Xh, hier, il y a Xj)
- HomeScreen : ajouté useMemo `lastWorkout` + fetch async des programs (sans modifier withObservables)
- Carte UI : 4 stats (durée, volume, séries, kg/min) + PRs si > 0 + timeAgo
- Traductions fr.ts et en.ts : clés `home.lastWorkout.*`
- Styles conformes au design system (colors, spacing, borderRadius, fontSize du thème)

## Vérification
- TypeScript : ✅
- Tests : 🔴 123 failed (erreur Babel pré-existante `@nozbe/watermelondb/babel/plugin` manquant — non lié)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260318-1500

## Commit
41ecb3b feat(home): last workout summary card — duration, volume, sets, density and PRs
