# FEAT(stats) — Standards de Force — StatsStrengthScreen
Date : 2026-03-15 10:15

## Instruction
docs/bmad/prompts/20260315-1000-sprint9-D.md

## Rapport source
description directe (prompt sprint9-D)

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/strengthStandardsHelpers.ts (NOUVEAU)
- mobile/src/screens/StatsStrengthScreen.tsx (NOUVEAU)
- mobile/src/navigation/index.tsx (ajout lazy import + route StatsStrength + Stack.Screen)
- mobile/src/screens/StatsScreen.tsx (ajout bouton Force dans STAT_BUTTONS)
- mobile/src/i18n/fr.ts (statsStrength + strength + section strengthStandards)
- mobile/src/i18n/en.ts (statsHeatmap + statsStrength + heatmap + strength + section strengthStandards)
- mobile/src/model/utils/__tests__/strengthStandardsHelpers.test.ts (NOUVEAU — tests)

## Ce qui a été fait
- `strengthStandardsHelpers.ts` : 5 benchmarks (bench/squat/deadlift/OHP/row), formule Epley 1RM, matchExercise (case-insensitive), computeStrengthStandards (ratio bodyweight + niveau + nextLevelThreshold)
- `StatsStrengthScreen.tsx` : cartes par lift avec 5 dots colorés par niveau, 1RM estimé, ratio BW, seuil prochain niveau, message si pas de poids corporel
- Navigation : route `StatsStrength: undefined`, lazy import, Stack.Screen avec titre i18n
- StatsScreen : bouton `fitness-outline` → `StatsStrength`
- i18n : sections complètes FR + EN (+ heatmap manquant en EN ajouté en bonus)
- Fix mineur : `textMuted` remplacé par `colors.placeholder` (n'existait pas dans ThemeColors)
- en.ts : statsHeatmap + heatmap ajoutés (manquaient déjà avant)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 10 passed (matchExercise × 3, computeStrengthStandards × 7)
- Nouveau test créé : oui — strengthStandardsHelpers.test.ts

## Documentation mise à jour
aucune (pas de nouveau pattern ou pitfall)

## Statut
✅ Résolu — 20260315-1015

## Commit
a3a6dd1 feat(stats): strength standards screen — 1RM comparison to bodyweight benchmarks
