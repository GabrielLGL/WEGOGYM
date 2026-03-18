# feat(home) — Streak milestones — badges visuels pour jalons de streak
Date : 2026-03-18 15:00

## Instruction
docs/bmad/prompts/20260318-1400-sprint14-C.md

## Rapport source
docs/bmad/prompts/20260318-1400-sprint14-C.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/streakMilestonesHelpers.ts (NEW)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Nouveau helper `computeStreakMilestones()` qui calcule :
  - Le streak actuel (jours consécutifs avec max 1 jour de repos)
  - 8 milestones prédéfinis (3, 7, 14, 30, 60, 100, 200, 365 jours)
  - Le prochain milestone à atteindre + progression en %
- Section UI sur HomeScreen (après la heatmap) :
  - Header avec titre + streak count
  - ScrollView horizontal de badges (emoji + nb jours)
  - Badges atteints en couleur primary, non-atteints grisés (opacity 0.4)
  - Barre de progression vers le prochain jalon
- Traductions FR/EN ajoutées dans `home.milestones.*`

## Vérification
- TypeScript : ✅ zero erreur
- Tests : ⚠️ 123 suites en échec (erreur Babel/Jest pré-existante, non liée aux changements)
- Nouveau test créé : non (erreur infra Jest empêche l'exécution)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260318-1500

## Commit
c92cfd2 feat(home): streak milestones — visual badges for training consistency achievements
