# feat(home) — Motivation contextuelle — carte HomeScreen (#39)
Date : 2026-03-14 02:00

## Instruction
docs/bmad/prompts/20260314-0200-sprint6-A.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/motivationHelpers.ts` (NOUVEAU)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `motivationHelpers.ts` : `computeMotivation(histories)` détecte le contexte d'engagement (returning_after_long / slight_drop / keep_going / null) en comparant `daysSinceLastWorkout` à `avgDaysBetweenWorkouts` (calculé sur les 10 dernières séances). Guard sur `startTime instanceof Date` pour la robustesse en tests.
- Intégré dans `HomeScreenBase` via `useMemo` + lookup map TypeScript-safe (pas de clés dynamiques).
- Carte rendue avant `WeeklyReportCard`, invisible si `motivationData === null`.
- Styles `motivationCard` / `motivationHeader` / `motivationTitle` / `motivationText` ajoutés (borderLeft primary, couleurs theme).
- Traductions ajoutées dans `fr.ts` et `en.ts` section `motivation.*` avec placeholder `{n}`.

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés
- Tests : ✅ 9 passed (HomeScreen)
- Nouveau test créé : non (les tests existants couvrent le cas)

## Documentation mise à jour
aucune (pas de nouveau pattern ni pitfall)

## Statut
✅ Résolu — 20260314-0200

## Commit
[sera rempli]
