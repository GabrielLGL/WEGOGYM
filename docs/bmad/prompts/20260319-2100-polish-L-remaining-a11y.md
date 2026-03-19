# Tache L — Accessibilite composants restants — 20260319-2100

## Objectif
Ajouter les labels d'accessibilite aux composants reutilisables et ecrans qui n'ont pas encore ete couverts : ChipSelector, ExercisePickerModal, ExercisesScreen, ProgramsScreen, ProgramDetailScreen.

## Fichiers a modifier

### Composants
- `mobile/src/components/ChipSelector.tsx` — chips de filtre (muscle/equipement)
- `mobile/src/components/ExercisePickerModal.tsx` — modal de selection d'exercice
- `mobile/src/components/ExerciseInfoSheet.tsx` — fiche info exercice

### Ecrans
- `mobile/src/screens/ProgramsScreen.tsx` — FAB, programme cards, options menu
- `mobile/src/screens/ProgramDetailScreen.tsx` — sessions, boutons ajouter/supprimer
- `mobile/src/screens/ExercisesScreen.tsx` — search, filter chips, exercise list items

### i18n
- `mobile/src/i18n/fr.ts` — completer la section `accessibility`
- `mobile/src/i18n/en.ts` — idem

## Contexte technique

### Cles i18n a ajouter

```typescript
// Completer la section accessibility existante
filterBy: 'Filtrer par',
allFilters: 'Tous',
searchExercises: 'Rechercher un exercice',
addExercise: 'Ajouter un exercice',
createProgram: 'Creer un programme',
programOptions: 'Options du programme',
deleteProgram: 'Supprimer le programme',
duplicateProgram: 'Dupliquer le programme',
renameProgram: 'Renommer le programme',
addSession: 'Ajouter une seance',
exerciseInfo: 'Informations sur l exercice',
selectExercise: 'Selectionner un exercice',
closeSearch: 'Fermer la recherche',
```

### Patterns

**ChipSelector.tsx :**
```tsx
// Chaque chip :
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={`${t.accessibility.filterBy} ${item}`}
  accessibilityState={{ selected: item === selectedValue }}
>

// Chip "Tous" :
accessibilityLabel={t.accessibility.allFilters}
```

**ExercisesScreen.tsx :**
```tsx
// Barre de recherche :
accessibilityLabel={t.accessibility.searchExercises}

// FAB ajouter :
accessibilityRole="button"
accessibilityLabel={t.accessibility.addExercise}

// Item exercice :
accessibilityRole="button"
accessibilityLabel={exercise.name}
accessibilityHint={exercise.muscles.join(', ')}
```

**ProgramsScreen.tsx :**
```tsx
// FAB creer :
accessibilityRole="button"
accessibilityLabel={t.accessibility.createProgram}

// Programme card :
accessibilityRole="button"
accessibilityLabel={program.name}

// Menu options :
accessibilityRole="button"
accessibilityLabel={t.accessibility.programOptions}
```

## Etapes
1. Lire chaque fichier pour identifier les elements interactifs
2. Completer `accessibility` dans fr.ts et en.ts
3. Ajouter labels sur ChipSelector (impact global — utilise partout)
4. Ajouter labels sur ExercisePickerModal
5. Ajouter labels sur les 3 ecrans
6. `npx tsc --noEmit` → 0 erreur
7. `npm test` → 0 fail

## Contraintes
- NE PAS modifier Button.tsx, AlertDialog.tsx, BottomSheet.tsx (deja faits)
- NE PAS modifier les composants Home (deja faits)
- NE PAS modifier WorkoutScreen / Workout components (deja faits)
- NE PAS modifier SettingsScreen (deja fait)

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- ChipSelector a des labels sur chaque chip
- ExercisesScreen a des labels sur search, FAB, items

## Dependances
Aucune.

## Statut
✅ Résolu — 20260319-2130

## Résolution
Rapport do : docs/bmad/do/20260319-2130-feat-a11y-remaining.md
