# FEAT(workout) — Score d'intensité de séance dans WorkoutSummarySheet
Date : 2026-03-15 10:00

## Instruction
docs/bmad/prompts/20260315-1000-sprint9-A.md

## Rapport source
description directe (fichier prompt sprint9-A)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/sessionIntensityHelpers.ts` (CRÉÉ)
- `mobile/src/model/utils/__tests__/sessionIntensityHelpers.test.ts` (CRÉÉ)
- `mobile/src/components/WorkoutSummarySheet.tsx` (MODIFIÉ)
- `mobile/src/i18n/fr.ts` (MODIFIÉ)
- `mobile/src/i18n/en.ts` (MODIFIÉ)

## Ce qui a été fait

### `sessionIntensityHelpers.ts` (nouveau)
- `computeSessionIntensity(totalVolume, totalPrs, recapExercises, colors)` → `IntensityResult`
- volumeScore (0-33) : linéaire entre 500 kg et 10 000 kg
- prScore (0-33) : 0→0, 1→11, 2→22, 3+→33
- effortScore (0-34) : ratio sets ≥ 80 % du max historique (prevMaxWeight)
- label : light (<30) / moderate (<55) / intense (<80) / extreme (≥80)
- color : textSecondary / primary / #F59E0B / danger

### `WorkoutSummarySheet.tsx`
- Import `computeSessionIntensity`
- `useMemo` calcule `intensity` (null si totalSets === 0)
- Section UI insérée après le `sectionDivider` post-gratitude :
  - Score jumbo coloré + label
  - Barre de progression colorée
  - Breakdown 3 composantes (volume/PRs/effort)
- 8 nouveaux styles dans `createStyles` (intensitySection, intensityTitle, etc.)

### `fr.ts` / `en.ts`
- Section `intensity` ajoutée avant `share:` avec title, levels (light/moderate/intense/extreme), volume/prs/effort

## Vérification
- TypeScript : ✅ (0 erreur dans mes fichiers — erreurs pré-existantes sprint9 non liées)
- Tests : ✅ 11 passed (sessionIntensityHelpers) + 20 passed (WorkoutSummarySheet)
- Nouveau test créé : oui — `sessionIntensityHelpers.test.ts` (11 cas)

## Documentation mise à jour
aucune (helper utilitaire interne, suffisamment documenté par JSDoc inline)

## Statut
✅ Résolu — 20260315-1000

## Commit
ff89363 feat(workout): session intensity score — volume/PRs/effort breakdown in summary sheet
