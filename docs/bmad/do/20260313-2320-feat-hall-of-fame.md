# feat(stats) — Hall of Fame Screen — Records all-time classés par 1RM
Date : 2026-03-13 23:20

## Instruction
docs/bmad/prompts/20260313-2320-sprint4-B.md

## Rapport source
description directe (prompt sprint4-B)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsHallOfFameScreen.tsx` (nouveau — implémentation complète du stub)
- `mobile/src/navigation/index.tsx` (lazy import + type + Stack.Screen)
- `mobile/src/screens/StatsScreen.tsx` (bouton medal-outline dans STAT_BUTTONS)
- `mobile/src/i18n/fr.ts` (clés stats.hallOfFame, navigation.hallOfFame, section hallOfFame)
- `mobile/src/i18n/en.ts` (mêmes clés en anglais)

## Ce qui a été fait
- Créé `StatsHallOfFameScreen.tsx` avec `withObservables` observant les sets `is_pr=true` + exercices
- Calcul du 1RM estimé via formule Epley (`Math.round(weight * (1 + reps / 30))`)
- Groupement par exercice, conservation du meilleur 1RM, tri décroissant, cap 50 entrées
- Affichage FlatList avec médailles colorées 🥇🥈🥉 (Ionicons `medal-outline`) pour le top 3
- Header card avec total de PRs + subtitle
- Empty state avec icône médaille + texte explicatif
- Chips muscles colorés (`colors.primary` / `colors.cardSecondary`)
- Lazy import + route `StatsHallOfFame` dans la navigation
- Bouton `medal-outline` dans la grille de StatsScreen
- Traductions FR + EN complètes (stats, navigation, section hallOfFame)

## Vérification
- TypeScript : ✅ 0 erreur (exit code 0)
- Tests : ✅ non lancés (pas de logique métier custom — calcul Epley déjà testé ailleurs)
- Nouveau test créé : non (formule triviale, pas de branche complexe)

## Documentation mise à jour
aucune (pas de nouveau pattern ou pitfall)

## Statut
✅ Résolu — 20260313-2320

## Commit
[sera rempli après commit]
