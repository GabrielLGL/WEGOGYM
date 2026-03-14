# feat(stats) — Exercise variant suggestions — similar exercises by muscle group in history screen
Date : 2026-03-14 06:00

## Instruction
docs/bmad/prompts/20260314-0600-sprint8-B.md

## Rapport source
description directe

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/variantHelpers.ts` (nouveau)
- `mobile/src/screens/ExerciseHistoryScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`
- `mobile/src/screens/__tests__/ExerciseHistoryScreen.test.tsx`

## Ce qui a été fait
- Créé `variantHelpers.ts` avec `computeVariantSuggestions()` : calcule similarité musculaire, trie par `hasHistory` puis score, retourne les N meilleurs
- Ajouté `allExercises` dans `withObservables` de `ExerciseHistoryScreen`
- Ajouté `usedExerciseIds` et `variantSuggestions` via `useMemo`
- Ajouté section UI "Exercices similaires" en bas du ScrollView (après Plateau), avec navigation `push('ExerciseHistory')` vers la variante
- Correction : `colors.textMuted` inexistant → remplacé par `colors.textSecondary`
- Ajouté clés i18n `exerciseHistory.variants.{title, done, discover}` dans fr.ts et en.ts
- Mis à jour le mock test `withObservables` pour passer `allExercises: []`

## Vérification
- TypeScript : ✅ (zéro erreur sur les fichiers modifiés — erreurs pré-existantes sur d'autres screens sprint 8)
- Tests : ✅ 8 passed
- Nouveau test créé : non (tests existants mis à jour)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260314-0600

## Commit
[sera rempli à l'étape 7]
