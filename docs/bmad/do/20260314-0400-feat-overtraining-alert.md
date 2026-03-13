# FEAT(home) — Carte d'alerte surentraînement
Date : 2026-03-14 04:00

## Instruction
docs/bmad/prompts/20260314-0400-sprint7-A.md

## Rapport source
Description directe (prompt sprint 7 — Groupe A)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/overtrainingHelpers.ts` (NOUVEAU)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`
- `mobile/src/model/utils/__tests__/overtrainingHelpers.test.ts` (NOUVEAU)

## Ce qui a été fait
- Créé `overtrainingHelpers.ts` avec `computeOvertrainingAlert()` : détecte 3 signaux (high_frequency > 7/sem, no_rest_7days, volume_spike_3weeks > 150%), priorité décroissante, null si < 10 séances
- Intégré dans `HomeScreenBase` via `useMemo` après motivationData
- Carte JSX avec bordure `colors.warning`, icône `warning-outline`, message selon signal
- Styles `overtrainingCard/Header/Title/Text/Advice` dans `useStyles()`
- Traductions FR/EN dans la section `overtraining.*`
- 5 tests unitaires pour le helper

## Vérification
- TypeScript : ✅ (erreurs pré-existantes non liées à ces fichiers)
- Tests : ✅ 5/5 passed (overtrainingHelpers) + 9/9 passed (HomeScreen)
- Nouveau test créé : oui — `overtrainingHelpers.test.ts`

## Documentation mise à jour
Aucune (helper simple, logique claire)

## Statut
✅ Résolu — 20260314-0400

## Commit
1a190dc feat(home): overtraining alert card — detects high frequency, no rest, volume spike
