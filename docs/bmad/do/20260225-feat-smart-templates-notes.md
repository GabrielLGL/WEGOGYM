# feat(smart-templates-notes) -- Templates intelligents + Notes exercice
Date : 2026-02-25

## Stories
- S01 : Migration schema -- colonne `notes` sur exercises
- S02 : Etendre getLastSetsForExercises -- retourner poids + reps
- S03 : Helper suggestProgression + parseRepsTarget
- S04 : Pre-remplissage poids + reps dans useWorkoutState
- S05 : Indicateur visuel de suggestion de progression
- S06 : Notes editables inline dans WorkoutExerciseCard
- S07 : Indicateur note dans SessionExerciseItem

## Fichiers crees
- `mobile/src/model/utils/progressionHelpers.ts` -- helpers parseRepsTarget + suggestProgression
- `mobile/src/model/utils/__tests__/progressionHelpers.test.ts` -- 30 tests
- `docs/stories/smart-templates-notes/` -- 7 stories + sprint overview

## Fichiers modifies
- `mobile/src/model/schema.ts` -- ajout colonne `notes` sur exercises (partage avec parallel gamification+onboarding)
- `mobile/src/model/models/Exercise.ts` -- ajout `@text('notes') notes?: string`
- `mobile/src/model/utils/databaseHelpers.ts` -- getLastSetsForExercises retourne `{weight, reps}` au lieu de `number`
- `mobile/src/hooks/useWorkoutState.ts` -- buildInitialInputs pre-remplit poids ET reps
- `mobile/src/components/WorkoutExerciseCard.tsx` -- suggestion progression + notes editables inline
- `mobile/src/components/SessionExerciseItem.tsx` -- indicateur "Notes" read-only
- `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` -- mis a jour pour nouveau format
- `mobile/src/hooks/__tests__/useWorkoutState.test.ts` -- mis a jour pour pre-remplissage reps
- `mobile/src/components/__tests__/WorkoutExerciseCard.test.tsx` -- ajout mocks progressionHelpers + database
- `mobile/src/components/__tests__/SessionExerciseItem.test.tsx` -- ajout mock notes

## Ce qui a ete fait

### Templates intelligents (#23)
1. **getLastSetsForExercises** retourne maintenant `{weight, reps}` par set au lieu de juste le poids
2. **buildInitialInputs** pre-remplit les reps en plus des poids depuis l'historique
3. **parseRepsTarget** parse les cibles de reps : range ("6-8") vs fixe ("5") vs null
4. **suggestProgression** calcule la suggestion adaptative :
   - Range (double progression) : +1 rep tant que max non atteint, puis +2.5kg et reset au min
   - Fixe (powerlifting) : uniquement +2.5kg
5. L'indicateur de suggestion s'affiche entre "Derniere : ..." et les series

### Notes par exercice (#22)
1. Colonne `notes` (text, optionnel) ajoutee au schema exercises
2. Decorateur `@text('notes')` ajoute au modele Exercise
3. Edition inline dans WorkoutExerciseCard : 3 etats (note existante / lien "+ Ajouter" / TextInput)
4. Sauvegarde sur onBlur via database.write()
5. Indicateur "Notes" read-only dans SessionExerciseItem (vue planning)

## Verification
- TypeScript : 6 erreurs pre-existantes (SettingsScreen -- gamification parallel), 0 de cette feature
- Tests : 1172 passed, 0 failed (dont 30 nouveaux tests progressionHelpers)
- Criteres d'acceptation : 7/7 stories PASS
