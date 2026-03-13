# feat(stats) — plateau detection in exercise history

Date : 2026-03-14 04:00

## Instruction
docs/bmad/prompts/20260314-0400-sprint7-B.md

## Rapport source
description directe (prompt sprint 7 Groupe B)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/plateauHelpers.ts` (NOUVEAU)
- `mobile/src/model/utils/__tests__/plateauHelpers.test.ts` (NOUVEAU)
- `mobile/src/screens/ExerciseHistoryScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `plateauHelpers.ts` avec `computePlateauAnalysis()` :
  - Retourne null si < 5 sets
  - Calcule 1RM Epley pour chaque set, trouve le meilleur
  - Compte les jours et séances uniques depuis le dernier PR
  - Plateau détecté si ≥ 3 séances ET ≥ 21 jours sans amélioration
  - Suggestions : `['deload', 'vary_reps']` si ≥ 6 séances, sinon `['progressive', 'vary_reps']`
- Ajouté `plateauData = useMemo(() => computePlateauAnalysis(...))` dans `ExerciseHistoryContent`
- Ajouté section UI conditionnelle (après la section prediction) avec icône warning + alerte + stratégies
- Ajouté 7 styles dans `useStyles` : `plateauCard`, `plateauHeader`, `plateauAlert`, `plateauSubtitle`, `strategyRow`, `strategyBullet`, `strategyText`
- Ajouté clés `exerciseHistory.plateau.*` dans fr.ts et en.ts

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés
- Tests : ✅ 6 passed (nouveaux tests plateauHelpers)
- Nouveau test créé : oui — `plateauHelpers.test.ts`

## Documentation mise à jour
aucune (logique documentée via JSDoc dans le fichier source)

## Statut
✅ Résolu — 20260314-0400

## Commit
[sera rempli à l'étape 7]
