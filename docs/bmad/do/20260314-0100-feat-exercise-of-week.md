# feat(home) — Exercise of the Week card
Date : 2026-03-14 01:00

## Instruction
docs/bmad/prompts/20260314-0000-sprint5-E.md

## Rapport source
docs/bmad/prompts/20260314-0000-sprint5-E.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/exerciseOfWeekHelpers.ts (NEW)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `exerciseOfWeekHelpers.ts` avec `computeExerciseOfWeek()` :
  - Calcule la dernière utilisation de chaque exercice via les sets
  - Priorise : exercices jamais faits > non faits depuis 30j > moins récent
  - Sélection déterministe par semaine (weekIndex % candidates.length)
  - Retourne null si < 5 exercices
- Ajouté carte "Exercice de la Semaine" dans HomeScreen section outils :
  - Affiche nom, statut (jamais essayé / il y a N jours), muscles (chips)
  - Tap → BottomSheet avec détail et phrase d'encouragement
- Ajouté traductions FR/EN (exerciseOfWeek.*)

## Vérification
- TypeScript : ✅ (zéro erreur sur nos fichiers, erreurs pré-existantes d'autres groupes)
- Tests : ✅ 1734 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0100

## Commit
(à remplir après commit)
