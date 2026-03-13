# feat(stats) — Duration records section — fastest/average/longest session badges
Date : 2026-03-14 02:00

## Instruction
docs/bmad/prompts/20260314-0200-sprint6-D.md

## Rapport source
description directe (prompt sprint 6 groupe D)

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/StatsDurationScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Ajout de `longestHistoryId` (useMemo) calculant l'id de la séance la plus longue
- Section "Records" avec 3 cards (plus rapide / moyenne / plus longue) insérée avant le graphique, visible seulement si `historyAll.length > 0`
- Badge "🏆 Record" conditionnel dans chaque ligne de la liste historique (uniquement sur la séance `longestHistoryId`)
- Styles ajoutés dans `useStyles` : `recordsRow`, `recordCard`, `recordValue`, `recordLabel`, `longestBadge`, `longestBadgeText`
- Clés i18n ajoutées dans `statsDuration.records` (fr.ts et en.ts) : `shortest`, `average`, `longest`, `longestBadge`

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés (erreurs pré-existantes dans WarmupChecklistSheet.tsx non liées)
- Tests : non lancés (feat UI sans logique métier testable supplémentaire)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0200

## Commit
[à remplir]
