# feat(stats) — Prédiction de PR — régression linéaire par exercice
Date : 2026-03-13 23:50

## Instruction
docs/bmad/prompts/20260313-2320-sprint4-D.md

## Rapport source
description directe (prompt Groupe D Sprint 4)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/prPredictionHelpers.ts` (NOUVEAU)
- `mobile/src/screens/ExerciseHistoryScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `prPredictionHelpers.ts` : fonction `computePRPrediction(sets)` qui effectue une régression linéaire simple sur les 1RM (Epley) des sets marqués `isPr`. Retourne `null` si < 2 PRs. Calcule `weeklyGainRate`, `currentBest1RM`, `targetWeight` (prochain palier +2.5% arrondi à 2.5 kg), `weeksToTarget` et `confidence` (low/medium/high).
- Modifié `ExerciseHistoryScreen.tsx` : ajout `useMemo` pour `prediction`, section UI conditionnelle en bas du `ScrollView` avec card, ligne 1RM actuel, prochain palier (couleur warning), délai en semaines, gain hebdomadaire, indicateur de confiance (●○○/●●○/●●●), message `tooFar` si > 52 semaines.
- Ajouté 11 clés i18n `exerciseHistory.prediction.*` dans `fr.ts` et `en.ts`.

## Vérification
- TypeScript : ✅ (erreurs pré-existantes hallOfFame/flashback non liées)
- Tests : ✅ 8 passed (ExerciseHistoryScreen.test.tsx)
- Nouveau test créé : non (tests existants couvrent l'écran)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260313-2350

## Commit
[sera rempli à l'étape 8]
