# Rapport — Tests nouveaux composants Phase 1 — 2026-02-25

## Problème
Les 5 features du 25/02 ont ajouté ~10 nouveaux fichiers sans tests unitaires dédiés :
- LevelBadge, XPProgressBar, StreakIndicator, MilestoneCelebration (gamification)
- HeatmapCalendar (visual)
- OnboardingCard, OnboardingScreen (onboarding)
- ExerciseInfoSheet (exercise-info)
- exportHelpers.ts (export)
- progressionHelpers.ts — a 30 tests ✅
- gamificationHelpers.ts — a 47 tests ✅

Les helpers sont bien testés mais les composants UI n'ont pas de tests dédiés.

## Fichiers concernés
- mobile/src/components/LevelBadge.tsx
- mobile/src/components/XPProgressBar.tsx
- mobile/src/components/StreakIndicator.tsx
- mobile/src/components/MilestoneCelebration.tsx
- mobile/src/components/HeatmapCalendar.tsx
- mobile/src/components/OnboardingCard.tsx
- mobile/src/screens/OnboardingScreen.tsx
- mobile/src/components/ExerciseInfoSheet.tsx (a 8 tests ✅)
- mobile/src/model/utils/exportHelpers.ts

## Commande à lancer
/do docs/bmad/morning/20260225-0900-test-new-components.md

## Contexte
- Coverage actuelle : 85.29% lignes — objectif maintenir ou augmenter
- Les composants gamification sont simples (render props → View/Text)
- OnboardingScreen a du state (steps, selection) → tester les transitions
- exportHelpers fait du I/O (FileSystem, Sharing) → mocker expo-file-system et expo-sharing
- Pattern tests existant : Jest + React Native Testing Library, mocks dans __tests__/

## Critères de validation
- Au moins 1 test suite par nouveau composant sans test
- Coverage maintenue ≥ 85% lignes
- 0 fail, tsc clean

## Statut
⏳ En attente
