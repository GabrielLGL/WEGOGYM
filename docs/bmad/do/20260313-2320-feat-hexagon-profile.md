# FEAT(stats) — Hexagone / Radar Chart — Profil Athlète
Date : 2026-03-13 23:20

## Instruction
docs/bmad/prompts/20260313-2320-sprint4-C.md

## Rapport source
description directe (prompt de spec)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/components/HexagonStatsCard.tsx` — NOUVEAU
- `mobile/src/screens/StatsHexagonScreen.tsx` — NOUVEAU
- `mobile/src/screens/StatsHallOfFameScreen.tsx` — NOUVEAU (stub, autre groupe)
- `mobile/src/navigation/index.tsx` — lazy import + route + Stack.Screen
- `mobile/src/screens/HomeScreen.tsx` — tuile "Profil Athlète" dans section Statistiques
- `mobile/src/i18n/fr.ts` — hexagon.*, home.tiles.hexagon, navigation.statsHexagon
- `mobile/src/i18n/en.ts` — mêmes clés EN

## Ce qui a été fait

### HexagonStatsCard.tsx
- Composant SVG pentagone régulier (N=5 axes, angle -90° + i×72°)
- 3 grilles concentriques (33%, 66%, 100%) en `colors.separator`
- Lignes des axes du centre aux sommets
- Polygone rempli `colors.primary + '4D'` (30% opacité) + contour `strokeWidth 2`
- Points (Circle) aux sommets des valeurs utilisateur
- Labels des axes positionnés à 130% du rayon
- Score global moyen en % au centre
- Valeur minimale 3% pour éviter crash à 0

### StatsHexagonScreen.tsx
- withObservables : user, sets, exercises, histories (filtrés deleted_at/abandoned)
- `distinctMuscleGroups` calculé via exerciseId → muscles (depuis `s.exerciseId`)
- `computeHexagonAxes()` : 5 axes normalisés [0,1] avec Math.min
- Section "Détail par axe" : barre de progression + valeur brute / max
- `useDeferredMount()` pour démarrage progressif

### Navigation
- Lazy import `StatsHexagonScreen`
- Route `StatsHexagon: undefined` dans RootStackParamList
- `Stack.Screen` avec `t.navigation.statsHexagon`

### HomeScreen
- Tuile `git-network-outline` / `t.home.tiles.hexagon` / route `StatsHexagon`
  dans section "Statistiques"

### Stub StatsHallOfFameScreen
- Créé pour débloquer l'erreur TS2307 causée par un autre Claude group
  (référence dans navigation/index.tsx sans fichier créé)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1734 passed (112 suites)
- Nouveau test créé : non (composant pur SVG, logique couverte par normalisation simple)

## Documentation mise à jour
aucune (pas de nouveau pattern ou pitfall)

## Statut
✅ Résolu — 20260313-2320

## Commit
[sera rempli après commit]
