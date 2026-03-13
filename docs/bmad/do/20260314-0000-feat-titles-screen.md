# FEAT(gamification) — Titres Débloquables — TitlesScreen
Date : 2026-03-14 00:00

## Instruction
docs/bmad/prompts/20260314-0000-sprint5-B.md

## Rapport source
description directe (prompt sprint 5 Groupe B)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/titlesHelpers.ts` (NEW)
- `mobile/src/screens/TitlesScreen.tsx` (NEW)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **titlesHelpers.ts** : `TitleDefinition` interface + `computeTitles()` pure function — 15 titres avec conditions de déblocage basées sur `user.bestStreak`, `user.totalPrs`, `user.totalTonnage`, `user.level`, `totalHistories`, `distinctExercises`
- **TitlesScreen.tsx** : Écran complet avec header card (progression X/15 + barre), section "Débloqués" (colorée, icon Ionicons), section "Verrouillés" (gris, 🔒). Pattern withObservables + useDeferredMount conforme aux autres écrans Stats.
- **navigation/index.tsx** : lazy import + `Titles: undefined` dans RootStackParamList + Stack.Screen
- **StatsScreen.tsx** : bouton `{ icon: 'ribbon-outline', label: t.stats.titles, route: 'Titles' }` ajouté en STAT_BUTTONS
- **fr.ts + en.ts** : clés `navigation.titles`, `stats.titles`, section `titles.{ title, subtitle, unlockedSection, lockedSection, progress, names, descriptions }`

## Corrections apportées
- `colors.textMuted` → `colors.placeholder` (textMuted n'existe pas dans ThemeColors)
- Type Ionicons : `title.icon as keyof typeof Ionicons.glyphMap` au lieu du mauvais cast `Parameters<typeof Ionicons>[0]['name']`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1734 passed (112 suites)
- Nouveau test créé : non (logique pure `computeTitles` simple, pas de mutation DB)

## Documentation mise à jour
aucune (pas de nouveau pattern ou pitfall)

## Statut
✅ Résolu — 20260314-0000

## Commit
[sera rempli après commit]
