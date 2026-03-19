# feat(stats) — Estimated percentiles section in hexagon profile screen
Date : 2026-03-14 06:00

## Instruction
docs/bmad/prompts/20260314-0600-sprint8-E.md

## Rapport source
Description directe

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/StatsHexagonScreen.tsx
- mobile/src/i18n/fr.ts (partagé — committés via autre agent sprint 8)
- mobile/src/i18n/en.ts (partagé — committés via autre agent sprint 8)

## Ce qui a été fait
- Ajout de `TPercentiles` type et `getPercentileLabel(value, percentiles)` dans StatsHexagonScreen (map valeur normalisée → label i18n)
- Ajout d'une section "Percentiles estimés" après "Détail par axe" : 5 lignes (une par axe) avec badge coloré (primary si value >= 0.75, sinon cardSecondary)
- Styles ajoutés dans `useStyles` : percentileSection, percentileSubtitle, percentileRow, percentileAxisLabel, percentileBadge, percentileBadgeText, percentileDisclaimer
- Icônes omises (HexagonAxis n'a pas de champ `icon`)
- `colors.textMuted` remplacé par `colors.textSecondary` (textMuted inexistant dans le thème)
- Traductions ajoutées dans fr.ts et en.ts sous `hexagon.percentiles.*` : sectionTitle, subtitle, top5, top20, top35, top50, bottom50, disclaimer

## Vérification
- TypeScript : ✅ (aucune erreur dans les fichiers modifiés)
- Tests : ✅ 0 tests existants / 0 failed
- Nouveau test créé : non (UI pure sans logique métier critique)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0600

## Commit
e086c84 feat(stats): estimated percentiles section in hexagon profile screen
