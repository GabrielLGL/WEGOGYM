# FEAT(gamification) — Exercise Collection Screen — Pokédex-style
Date : 2026-03-14 04:00

## Instruction
docs/bmad/prompts/20260314-0400-sprint7-C.md

## Rapport source
description directe (prompt)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/ExerciseCollectionScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **ExerciseCollectionScreen** : écran Pokédex à 2 colonnes. `withObservables` sur `exercises` + `sets` (filtrés sur histories non supprimées). `useMemo` construit un `CollectionEntry` par exercice (discovered, setsCount, lastDoneMs). Tri : découverts en premier (par lastDoneMs desc), verrouillés par ordre alpha. Header card avec progression `X/N` + barre de progression. Carte verrouillée : nom masqué `exercise.name.replace(/./g, '?')` + icône 🔒. Carte découverte : nom, muscles, count séries.
- **navigation/index.tsx** : lazy import + route `ExerciseCollection: undefined` dans `RootStackParamList` + `Stack.Screen` avec titre `t.navigation.exerciseCollection`.
- **StatsScreen.tsx** : ajout `{ icon: 'albums-outline', label: t.stats.collection, route: 'ExerciseCollection' }` en dernier dans `STAT_BUTTONS`.
- **fr.ts / en.ts** : ajout `stats.collection`, `navigation.exerciseCollection`, section complète `exerciseCollection.*`.
- Correction : `colors.textMuted` → `colors.placeholder` (n'existe pas dans ThemeColors).

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1751 passed (1 échec pré-existant StatsDurationScreen non lié)
- Nouveau test créé : non (logique de tri/calcul dans useMemo sans side-effects DB)

## Documentation mise à jour
aucune (pas de nouveau pattern)

## Statut
✅ Résolu — 20260314-0400

## Commit
[à remplir après commit]
