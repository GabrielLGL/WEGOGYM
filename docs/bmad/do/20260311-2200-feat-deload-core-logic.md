# feat(deload) — Moteur de détection fatigue et recommandation deload
Date : 2026-03-11 22:00

## Instruction
docs/bmad/prompts/20260311-2000-deload-A.md

## Rapport source
docs/bmad/prompts/20260311-2000-deload-A.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/constants.ts (ajout constantes deload + MRV)
- mobile/src/model/utils/deloadHelpers.ts (NOUVEAU)
- mobile/src/model/utils/statsHelpers.ts (re-export)
- mobile/src/model/utils/__tests__/deloadHelpers.test.ts (NOUVEAU)

## Ce qui a été fait
- Ajout des constantes de périodisation (seuils consecutiveDays, volumeSpike, trainingBlock, restGap, MRV par niveau)
- Création du moteur `computeDeloadRecommendation()` : fonction pure analysant 5 signaux par priorité (jours consécutifs, spike volume, block long, surcharge musculaire, manque repos)
- Types exportés : `DeloadType`, `DeloadSeverity`, `DeloadRecommendation`
- Re-export depuis le barrel `statsHelpers.ts`
- 17 tests couvrant tous les signaux, la priorité, les filtres deleted/abandoned, les edge cases

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 1734 passed (dont 17 nouveaux deloadHelpers)
- Nouveau test créé : oui

## Documentation mise à jour
aucune (pas de nouveau pattern, pas de nouveau hook)

## Statut
✅ Résolu — 20260311-2200

## Commit
(voir étape commit)
