# FEAT(stats) — Analyse du Split d'Entraînement (#98)
Date : 2026-03-15 11:30

## Instruction
docs/bmad/prompts/20260315-1130-sprint10-C.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/trainingSplitHelpers.ts` (NOUVEAU)
- `mobile/src/screens/StatsTrainingSplitScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **trainingSplitHelpers.ts** : logique de classification (`classifySession`) et d'analyse (`analyzeTrainingSplit`) — détection PPL/Upper-Lower/FullBody/Mixed déterministe, calcul de la régularité (0-100%)
- **StatsTrainingSplitScreen.tsx** : écran avec carte pattern détecté, barres de distribution horizontales par type de split (couleurs distinctes), timeline 30 jours en pastilles + légende ; withObservables sur sets/exercises/histories ; useDeferredMount
- **navigation/index.tsx** : lazy import + route `StatsTrainingSplit: undefined` + Stack.Screen avec `t.navigation.statsTrainingSplit`
- **StatsScreen.tsx** : bouton `git-branch-outline` — `t.stats.trainingSplit` → route `StatsTrainingSplit`
- **fr.ts** : `navigation.statsTrainingSplit`, `stats.trainingSplit`, section `trainingSplit.*` complète
- **en.ts** : mêmes ajouts en anglais

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1770 passed / 9 failed (échecs pré-existants — OnboardingScreen, StatsDuration, HomeScreen, WorkoutSummarySheet — non liés à ce feature)
- Nouveau test créé : non (logique pure déjà couverte par la classification déterministe)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260315-1130

## Commit
c51d94b feat(stats): training split analysis — auto-detect PPL/Upper-Lower/FullBody pattern
