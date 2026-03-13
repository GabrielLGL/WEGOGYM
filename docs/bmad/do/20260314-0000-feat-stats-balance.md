# FEAT(stats) — Muscle Balance Screen — push/pull and upper/lower ratios
Date : 2026-03-14 00:00

## Instruction
docs/bmad/prompts/20260314-0000-sprint5-C.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsBalanceScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `StatsBalanceScreen` avec `withObservables` (sets + exercises)
- Calcul des volumes push/pull/legs via `useMemo` : division équitable si exercice multi-catégorie
- `getPushPullStatus` : balanced (0.67–1.5), push_dominant (>1.5), pull_dominant (<0.67)
- `getUpperLowerStatus` : balanced (0.8–3.0), upper_dominant (>3.0), legs_dominant (<0.8)
- UI : 3 cards (Push/Pull, Haut/Bas, Répartition) avec barres proportionnelles via `View`
- Alertes visuelles : `colors.warning` si déséquilibre, `colors.primary` si équilibré
- Empty state si `totalSets < 10`
- Ajouté route `StatsBalance` dans navigation + lazy import
- Ajouté bouton `scale-outline` / `t.stats.balance` dans `STAT_BUTTONS` de StatsScreen
- Ajouté traductions `balance.*`, `stats.balance`, `navigation.statsBalance` dans fr.ts et en.ts

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés (erreurs pré-existantes TitlesScreen/ExerciseHistoryScreen)
- Tests : non lancés (pas de test sur logique pure simple)
- Nouveau test créé : non

## Documentation mise à jour
aucune (pas de nouveau pattern ou pitfall)

## Statut
✅ Résolu — 20260314-0000

## Commit
4ca46e4 feat(stats): muscle balance screen — push/pull and upper/lower ratios
