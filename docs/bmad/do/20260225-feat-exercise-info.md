# feat(exercise-info) — Fiches d'exercice avec descriptions et placeholder animation
Date : 2026-02-25

## Stories
- STORY-01 : Schema v21 (animation_key + description sur exercises)
- STORY-02 : 30 descriptions exercices de base + seed idempotent
- STORY-03 : Composant ExerciseInfoSheet (BottomSheet)
- STORY-04 : Bouton info dans SessionExerciseItem
- STORY-05 : Bouton info dans ExercisePickerModal

## Fichiers modifies

### Nouveaux
- `mobile/src/model/utils/exerciseDescriptions.ts`
- `mobile/src/components/ExerciseInfoSheet.tsx`
- `mobile/src/components/__tests__/ExerciseInfoSheet.test.tsx`

### Modifies
- `mobile/src/model/schema.ts`
- `mobile/src/model/models/Exercise.ts`
- `mobile/src/components/SessionExerciseItem.tsx`
- `mobile/src/components/ExercisePickerModal.tsx`
- `mobile/App.tsx`
- `mobile/src/components/__tests__/SessionExerciseItem.test.tsx`
- `mobile/src/components/__tests__/ExercisePickerModal.test.tsx`

## Ce qui a ete fait
1. **Schema v21** : Ajout colonnes `animation_key` et `description` (string, optional) sur la table `exercises`
2. **Model Exercise** : Ajout decorateurs `@text` pour `animationKey` et `description`
3. **exerciseDescriptions.ts** : Mapping de 30 exercices de base avec descriptions francaises (cues d'execution) et animation_keys. Fonction `seedExerciseDescriptions()` idempotente appelee au lancement.
4. **ExerciseInfoSheet** : Nouveau composant BottomSheet affichant : placeholder animation (icone + "Animation a venir"), nom exercice, chips muscles, description, notes personnelles.
5. **SessionExerciseItem** : Ajout icone info (i) a cote du nom. Tap ouvre ExerciseInfoSheet avec haptic feedback.
6. **ExercisePickerModal** : Ajout icone info (i) a droite de chaque ligne exercice. Tap sur (i) ouvre info sheet, tap sur la ligne selectionne l'exercice.
7. **Tests** : 8 nouveaux tests pour ExerciseInfoSheet. Mocks ajoutes aux tests existants pour Ionicons et Portal.

## Verification
- TypeScript : 0 erreur
- Tests : 1186 passed, 0 failed, 66 suites
- Criteres d'acceptation : 5/5 stories PASSED
