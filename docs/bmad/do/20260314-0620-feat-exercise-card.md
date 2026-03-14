# FEAT(stats) — Exercise Card Screen — fiche trophée depuis Hall of Fame
Date : 2026-03-14 06:20

## Instruction
docs/bmad/prompts/20260314-0600-sprint8-D.md

## Rapport source
description directe (prompt)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/ExerciseCardScreen.tsx` (NOUVEAU)
- `mobile/src/navigation/index.tsx`
- `mobile/src/screens/StatsHallOfFameScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- **ExerciseCardScreen.tsx** : Nouvel écran "fiche trophée" d'un exercice.
  - `withObservables` observe l'exercice + tous ses sets (hors historiques abandonnés/supprimés).
  - `useMemo` pour calculer : best 1RM (formule Epley), tonnage total, nombre de séances uniques, sets PR, dates premier/dernier PR, niveau d'expertise (débutant/intermédiaire/avancé/expert selon nb séances).
  - UI : header card avec nom en uppercase bold, chips muscles, grille 2×2 de KPIs, barre de dots d'expertise, section dates PR.
  - Pattern `useDeferredMount` + wrapper classique.
- **navigation/index.tsx** : Ajout lazy import `ExerciseCardScreen`, route `ExerciseCard: { exerciseId: string }` dans `RootStackParamList`, `Stack.Screen` avec `title: ''`.
- **StatsHallOfFameScreen.tsx** : Ajout `TouchableOpacity` autour de chaque ligne (remplacement du `View`), `onPress` prop dans `HallOfFameRow`, `useNavigation` dans `StatsHallOfFameScreenBase` pour naviguer vers `ExerciseCard`.
- **fr.ts / en.ts** : Ajout section `exerciseCard` (orm, tonnage, sessions, prs, expertise, expertiseLevels, firstPR, lastPR, noPRYet).

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 19 passed
- Nouveau test créé : non (logique UI pure, pas de logique métier critique)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0620

## Commit
[sera rempli à l'étape 7]
