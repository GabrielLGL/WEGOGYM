# feat(home) — Training calendar heatmap
Date : 2026-03-15 10:30

## Instruction
docs/bmad/prompts/20260315-1000-sprint9-E.md

## Rapport source
docs/bmad/prompts/20260315-1000-sprint9-E.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/trainingCalendarHelpers.ts (NOUVEAU)
- mobile/src/model/utils/__tests__/trainingCalendarHelpers.test.ts (NOUVEAU)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `trainingCalendarHelpers.ts` : fonction `computeTrainingCalendar()` qui génère les données pour une heatmap de N semaines (défaut 12). Utilise le nombre de sessions (histories) par jour pour calculer l'intensité via quartiles (0-4).
- Ajouté section heatmap dans HomeScreen après la card gamification : grille 12×7 de carrés colorés (style GitHub contributions), légende "Moins → Plus", bordure distinctive sur le jour actuel.
- Ajouté traductions FR/EN : `home.heatmap.title/less/more`.
- Créé tests unitaires (5 tests) couvrant : structure, intensité 0, workouts, filtrage deleted/abandoned, marquage isToday.

## Vérification
- TypeScript : ✅ (erreurs pré-existantes sur StatsHeatmapScreen/StatsStrengthScreen d'autres groupes)
- Tests : ✅ 5 passed (helper) — HomeScreen test suite a un problème pré-existant (AsyncStorage mock)
- Nouveau test créé : oui — trainingCalendarHelpers.test.ts

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260315-1030

## Commit
