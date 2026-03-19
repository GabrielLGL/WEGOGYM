# feat(a11y) — Accessibilite composants restants
Date : 2026-03-19 21:30

## Instruction
docs/bmad/prompts/20260319-2100-polish-L-remaining-a11y.md

## Rapport source
docs/bmad/prompts/20260319-2100-polish-L-remaining-a11y.md

## Classification
Type : feat
Fichiers modifies :
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts
- mobile/src/components/ChipSelector.tsx
- mobile/src/components/ExercisePickerModal.tsx
- mobile/src/components/ExerciseInfoSheet.tsx
- mobile/src/screens/ExercisesScreen.tsx
- mobile/src/screens/ProgramsScreen.tsx
- mobile/src/screens/ProgramDetailScreen.tsx

## Ce qui a ete fait
- Ajout de 13 cles i18n dans la section `accessibility` de fr.ts et en.ts (filterBy, allFilters, searchExercises, addExercise, createProgram, programOptions, deleteProgram, duplicateProgram, renameProgram, addSession, exerciseInfo, selectExercise, closeSearch)
- ChipSelector : accessibilityRole/Label/State sur chaque chip (tous + items)
- ExercisePickerModal : a11y sur boutons de selection et info exercice
- ExerciseInfoSheet : a11y sur bouton historique
- ExercisesScreen : a11y sur search fake input, close search, FAB ajouter, ExerciseItem
- ProgramsScreen : a11y sur FAB creer, options rename/duplicate/delete
- ProgramDetailScreen : a11y sur bouton ajouter seance

## Verification
- TypeScript : ✅ (1 erreur pre-existante non liee — HomeNavigationGrid)
- Tests : ✅ 2219 passed (12 failed pre-existants — statsDuration)
- Nouveau test cree : non

## Documentation mise a jour
aucune

## Statut
✅ Resolu — 20260319-2130

## Commit
