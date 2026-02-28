# Groupe B — CreateExerciseScreen + navigation

## Fichiers créés/modifiés

| Fichier | Action |
|---------|--------|
| `mobile/src/screens/CreateExerciseScreen.tsx` | Créé |
| `mobile/src/navigation/index.tsx` | Modifié |
| `mobile/src/screens/ExercisesScreen.tsx` | Modifié |
| `mobile/src/i18n/fr.ts` | Modifié |
| `mobile/src/i18n/en.ts` | Modifié |
| `mobile/src/screens/__tests__/ExercisesScreen.test.tsx` | Modifié |

## CreateExerciseScreen.tsx

Écran complet remplaçant la modal de création :
- `KeyboardAvoidingView` + `ScrollView` pour l'ergonomie
- `TextInput` nom + chips muscles + équipement horizontal + description multiline
- Validation via `validateExerciseInput()` de `validationHelpers.ts`
- Mutation DB dans `database.write()` avec `isCustom: true`
- `haptics.onSuccess()` + `navigation.goBack()` après création

## Navigation

`RootStackParamList` :
```typescript
CreateExercise: undefined;
```

Stack enregistré avec `options={{ title: t.exercises.newTitle }}`.

## ExercisesScreen.tsx — nettoyage

- Bouton flottant : `setIsAddModalVisible(true)` → `navigation.navigate('CreateExercise')`
- Supprimés : `isAddModalVisible`, `handleCreateExercise`, `<CustomModal>` de création
- Supprimés du destructuring `useExerciseManager` : `newExerciseData`, `updateNewExerciseName`, `updateNewExerciseMuscles`, `updateNewExerciseEquipment`, `createExercise`

## i18n

Ajout dans `exercises` (fr.ts + en.ts) :
```typescript
descriptionLabel: 'Description (optionnelle)',    // fr
descriptionPlaceholder: "Instructions d'exécution...",  // fr
```

## Tests mis à jour

`ExercisesScreen.test.tsx` — 20 tests, tous passent :
- Mock `useExerciseManager` nettoyé (sans les champs create)
- Helper `makeManagerMock()` ajouté pour éviter la répétition
- Tests `•••` mis à jour avec `isCustom: true`
- Tests create modal remplacés par test de navigation
- Nouveaux tests : "pré-installés n'ont pas de •••", "navigue vers CreateExercise"

## Vérification finale
- `npx tsc --noEmit` → 0 erreur ✓
- `npm test -- --testPathPattern="ExercisesScreen"` → 20/20 ✓
