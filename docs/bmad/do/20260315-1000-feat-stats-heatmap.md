# FEAT(stats) — Heatmap Musculaire
Date : 2026-03-15 10:00

## Instruction
docs/bmad/prompts/20260315-1000-sprint9-C.md

## Rapport source
description directe (fichier prompt)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/muscleHeatmapHelpers.ts` (NOUVEAU)
- `mobile/src/model/utils/__tests__/muscleHeatmapHelpers.test.ts` (NOUVEAU)
- `mobile/src/screens/StatsHeatmapScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **`muscleHeatmapHelpers.ts`** : helper pur `computeMuscleHeatmap()` — filtre les sets sur la période, distribue le volume (weight × reps) par muscle, compte les jours distincts (sessionCount), normalise l'intensity (0–1), trie par volume décroissant avec les muscles non travaillés en fin de liste.
- **`StatsHeatmapScreen.tsx`** : écran avec FlatList 2 colonnes, toggle période [7j/14j/30j], cartes muscle avec barre de progression colorée (placeholder → primary selon intensity), affichage volume + sessionCount, muscles non travaillés grisés (opacity 0.5).
- **`navigation/index.tsx`** : lazy import `StatsHeatmapScreen`, ajout de `StatsHeatmap: undefined` dans `RootStackParamList`, ajout `<Stack.Screen>` avec titre `t.navigation.statsHeatmap`.
- **`StatsScreen.tsx`** : ajout bouton `{ icon: 'flame-outline', label: t.stats.heatmap, route: 'StatsHeatmap' }` dans `STAT_BUTTONS`.
- **`fr.ts`** : `navigation.statsHeatmap`, `stats.heatmap`, nouvelle section `muscleHeatmap`.
- **`en.ts`** : `navigation.statsHeatmap` (ajouté par agent parallèle), `stats.heatmap` (id.), nouvelle section `muscleHeatmap`.

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 8 passed (muscleHeatmapHelpers.test.ts)
- Nouveau test créé : oui

## Documentation mise à jour
aucune (pas de nouveau pattern/pitfall)

## Statut
✅ Résolu — 20260315-1000

## Commit
c9e2d26 feat(stats): muscle heatmap screen — volume intensity by muscle group with period filter
