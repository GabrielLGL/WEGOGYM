# FEAT(gamification) — Classe Athlète — badge de classification automatique
Date : 2026-03-14 00:10

## Instruction
docs/bmad/prompts/20260314-0000-sprint5-A.md

## Rapport source
description directe (prompt sprint 5 — Groupe A)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/athleteClassHelpers.ts` (nouveau)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Création de `athleteClassHelpers.ts` : helper pur `computeAthleteClass(sets, exercises)` qui calcule la distribution du volume par groupe musculaire (push/pull/legs/core) et retourne la classe parmi 4 : powerlifter, bodybuilder, complete, polyvalent. Retourne null si < 20 sets.
- HomeScreen : import du helper + `useMemo` `athleteClass` + affichage conditionnel sous `LevelBadge` (badge texte centré en `colors.primary`, uppercase, letterSpacing 1)
- fr.ts / en.ts : section `athleteClass` avec title + 4 clés de classe

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1734 passed (112 suites)
- Nouveau test créé : non (logique pure, couverture à ajouter si besoin)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0010

## Commit
[sera rempli]
