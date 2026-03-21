# CHORE(overtraining) — suppression dead code overtrainingHelpers

Date : 2026-03-21 13:00

## Instruction
docs/bmad/morning/20260321-0900-briefing.md

## Rapport source
docs/bmad/morning/20260321-0900-briefing.md

## Classification
Type : chore
Fichiers modifiés :
- mobile/src/model/utils/overtrainingHelpers.ts (supprimé)
- mobile/src/model/utils/__tests__/overtrainingHelpers.test.ts (supprimé)
- mobile/src/model/utils/statsHelpers.ts (re-export retiré)
- mobile/src/i18n/fr.ts (section overtraining retirée)
- mobile/src/i18n/en.ts (section overtraining retirée)

## Ce qui a été fait
- Supprimé `overtrainingHelpers.ts` (95 lignes) — code mort depuis l'audit critique 20260320
- Supprimé son fichier de test `overtrainingHelpers.test.ts`
- Retiré le re-export `export * from './overtrainingHelpers'` dans `statsHelpers.ts`
- Retiré la section i18n `overtraining` dans `fr.ts` et `en.ts` (6 clés chacun)

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1938 passed, 146 suites
- Nouveau test créé : non (suppression de dead code)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260321-1300

## Commit
a4e3fa8 chore(overtraining): remove dead overtrainingHelpers code
