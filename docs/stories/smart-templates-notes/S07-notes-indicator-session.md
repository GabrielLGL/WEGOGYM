# S07 — Indicateur note dans SessionExerciseItem
> Feature: smart-templates-notes | Priorite: Should | Dependance: S01

## Description
Afficher un petit indicateur "Notes" dans `SessionExerciseItem` (vue planification) quand l'exercice a une note. Lecture seule — pas d'edition dans cette vue.

## Fichiers modifies
- `mobile/src/components/SessionExerciseItem.tsx`

## Taches techniques
1. L'exercise est deja observable via withObservables
2. Ajouter conditionnellement :
   ```tsx
   {exercise.notes && <Text style={styles.noteIndicator}>Notes</Text>}
   ```
3. Style : `fontSize.xs - 1` (11px), `colors.textSecondary`, `fontStyle: 'italic'`
4. Position : sous la ligne tags, au-dessus de targetRow

## Criteres d'acceptation
- [ ] "Notes" affiche si `exercise.notes` non vide
- [ ] Non affiche si pas de note
- [ ] Pas d'edition (lecture seule)
- [ ] Style coherent avec le design existant
- [ ] `npx tsc --noEmit` passe
