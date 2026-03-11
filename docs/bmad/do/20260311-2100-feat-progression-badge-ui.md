# feat(workout) — Badge visuel "↑ Progression appliquée"
Date : 2026-03-11 21:00

## Instruction
docs/bmad/prompts/20260311-2000-progression-auto-B.md

## Rapport source
docs/bmad/prompts/20260311-2000-progression-auto-B.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/hooks/useWorkoutState.ts (ajout suggestedExerciseIds dans return)
- mobile/src/components/WorkoutExerciseCard.tsx (prop isProgressionApplied + badge)
- mobile/src/components/WorkoutSupersetBlock.tsx (prop suggestedExerciseIds + badge)
- mobile/src/screens/WorkoutScreen.tsx (passage suggestedExerciseIds aux composants)
- mobile/src/i18n/fr.ts (clé progressionApplied)
- mobile/src/i18n/en.ts (clé progressionApplied)
- mobile/src/screens/__tests__/WorkoutScreen.test.tsx (ajout suggestedExerciseIds au mock)

## Ce qui a été fait
1. Exposé `suggestedExerciseIds: Set<string>` dans le return de `useWorkoutState`
2. Ajouté la clé i18n `progressionApplied` en FR ("↑ Progression appliquée") et EN ("↑ Progression applied")
3. Ajouté prop `isProgressionApplied?: boolean` à `WorkoutExerciseCardContent` — quand true, remplace le texte "Suggestion: +X" par un badge vert avec fond transparent `colors.primary + '26'`
4. Ajouté prop `suggestedExerciseIds?: Set<string>` à `WorkoutSupersetBlock` — propagé à `SupersetExerciseInfo` via `isProgressionApplied`
5. Modifié `WorkoutScreen.renderWorkoutItem` pour passer les props aux deux composants
6. Corrigé le mock de `useWorkoutState` dans les tests pour inclure `suggestedExerciseIds`

## Vérification
- TypeScript : ✅
- Tests : ✅ 1694 passed
- Nouveau test créé : non (mock mis à jour)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260311-2100

## Commit
aafcfd3 feat(workout): add progression applied badge on exercise cards
