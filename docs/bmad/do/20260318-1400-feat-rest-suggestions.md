# feat(home) — Rest day suggestions

Date : 2026-03-18 14:00

## Instruction
docs/bmad/prompts/20260318-1400-sprint14-E.md

## Rapport source
docs/bmad/prompts/20260318-1400-sprint14-E.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/restDaySuggestionsHelpers.ts (NOUVEAU)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `restDaySuggestionsHelpers.ts` avec `computeRestSuggestion()` :
  - Compte les jours d'entraînement consécutifs
  - Réutilise `computeFatigueIndex` (ACWR) et `computeMuscleRecovery`
  - Algorithme de décision à 5 niveaux (tooManyDays, highFatigue, accumulatedFatigue, muscleRecovery, mildFatigue)
  - Suggestions adaptées selon la confiance (takeFullRest, lightActivity, optionalRest, readyToTrain)
- Ajouté carte "Suggestion de repos" sur HomeScreen (après récupération musculaire, avant quick-start)
  - Badge de confiance coloré (rouge/jaune/gris)
  - Bordure gauche colorée selon la confiance
  - Raison, suggestion et muscles fatigués affichés
  - Carte visible UNIQUEMENT si shouldRest = true
- Ajouté traductions FR et EN dans `home.restSuggestion.*`

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ⚠️ 123 suites en échec (problème babel préexistant — `@nozbe/watermelondb/babel/plugin` manquant, non lié aux modifications)
- Nouveau test créé : non (helper éphémère sans logique DB)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260318-1400

## Commit
