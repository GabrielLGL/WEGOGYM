# S06 — Notes editables dans WorkoutExerciseCard
> Feature: smart-templates-notes | Priorite: Must | Dependance: S01

## Description
Ajouter une zone de notes editable dans `WorkoutExerciseCard`. Les notes sont stockees sur le modele Exercise (global). L'utilisateur peut lire, creer et modifier ses notes directement pendant la seance.

## Fichiers modifies
- `mobile/src/components/WorkoutExerciseCard.tsx`

## Taches techniques
1. Ajouter state local `isEditingNote` + `noteText`
2. Importer `database` depuis `model/index`
3. 3 etats de rendu :
   - Note existante (lecture) : texte italic gris, tap pour editer
   - Pas de note : lien "+ Ajouter une note", tap pour editer
   - Edition : TextInput inline, autoFocus, multiline
4. Sauvegarde au `onBlur` via `database.write()` → `exercise.update()`
5. Styles : noteText, noteInput, addNoteLink
6. Position : entre le nom de l'exercice et la ligne "Objectif"

## Criteres d'acceptation
- [ ] Note affichee si `exercise.notes` non vide
- [ ] "+ Ajouter une note" affiche si pas de note
- [ ] Tap → TextInput inline avec autoFocus
- [ ] Sauvegarde au onBlur
- [ ] Mutation dans `database.write()`
- [ ] Placeholder : "Ajouter une note (grip, tempo, sensation...)"
- [ ] Pas de modale — tout inline
- [ ] Note persiste apres navigation (stockee sur Exercise)
- [ ] `npx tsc --noEmit` passe
