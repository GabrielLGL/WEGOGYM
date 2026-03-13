# FEAT(stats) — Comparateur de périodes — StatsCompareScreen (#47)
Date : 2026-03-14 02:00

## Instruction
docs/bmad/prompts/20260314-0200-sprint6-C.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsCompareScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `StatsCompareScreen.tsx` : écran comparateur de 2 périodes côte à côte
  - Sélecteurs de périodes scrollables (Ce mois / Mois dernier / 3 mois / 6 mois / Cette année)
  - Tableau 4 métriques : séances, volume, PRs, durée moyenne
  - Indicateur gagnant par ligne (flèche + lettre A/B en `colors.primary`, `=` si égal)
  - Card résumé avec comptage des victoires (A/B/Égal)
  - Message "Aucune séance" si une période est vide
  - Pattern `withObservables` + `useDeferredMount` + `useColors` + `useLanguage`
  - Calcul `useMemo` avec `getPeriodRange()` et `computePeriodStats()`
- Ajouté route `StatsCompare: undefined` dans `RootStackParamList`
- Ajouté lazy import `StatsCompareScreen` dans navigation
- Ajouté `Stack.Screen name="StatsCompare"` avec titre `t.navigation.statsCompare`
- Ajouté bouton `git-compare-outline` dans `STAT_BUTTONS` de `StatsScreen`
- Ajouté traductions FR : `stats.compare`, `navigation.statsCompare`, section `compare.*`
- Ajouté traductions EN : mêmes clés

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1733 passed (1 failure pré-existante StatsDurationScreen, sans rapport)
- Nouveau test créé : non (logique de calcul dans des fonctions pures intégrées à l'écran)

## Documentation mise à jour
aucune (nouvelle feature standalone, pas de nouveau pattern)

## Statut
✅ Résolu — 20260314-0200

## Commit
[sera rempli après commit]
