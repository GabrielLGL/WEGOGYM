# feat(gamification) — Personal Challenges Screen
Date : 2026-03-14 06:00

## Instruction
docs/bmad/prompts/20260314-0600-sprint8-C.md

## Rapport source
docs/bmad/prompts/20260314-0600-sprint8-C.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/personalChallengesHelpers.ts (NEW)
- mobile/src/screens/PersonalChallengesScreen.tsx (NEW)
- mobile/src/navigation/index.tsx
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `personalChallengesHelpers.ts` : 12 défis épiques (séances, tonnage, PRs, streak, level) avec calcul de progression dynamique, tri par progression décroissante
- Créé `PersonalChallengesScreen.tsx` : écran FlatList avec header (compteur + barre globale), cartes de défi avec icône, badge difficulté coloré (easy/medium/hard/legendary), barre de progression, valeur courante/cible
- Ajouté route `PersonalChallenges` dans navigation + lazy import
- Ajouté bouton "Défis" (shield-outline) dans la section Outils du HomeScreen
- Ajouté toutes les traductions FR/EN (navigation, tiles, section challenges complète avec titres et descriptions)

## Vérification
- TypeScript : ✅ (zéro erreur liée à nos fichiers)
- Tests : ✅ 1754 passed (1 failed pré-existant StatsDuration)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0600

## Commit
