# S05 — Indicateur visuel de suggestion de progression
> Feature: smart-templates-notes | Priorite: Must | Dependance: S03

## Description
Afficher un indicateur de suggestion de progression dans `WorkoutExerciseCard`, entre la ligne "Derniere" et les rangees de series. Utilise `suggestProgression()` avec les donnees `lastPerformance` et `repsTarget`.

## Fichiers modifies
- `mobile/src/components/WorkoutExerciseCard.tsx`

## Taches techniques
1. Importer `suggestProgression` depuis `progressionHelpers.ts`
2. Dans `WorkoutExerciseCardContent`, calculer la suggestion :
   ```typescript
   const suggestion = lastPerformance
     ? suggestProgression(lastPerformance.avgWeight, lastPerformance.avgReps, sessionExercise.repsTarget)
     : null
   ```
3. Afficher conditionnellement :
   ```tsx
   {suggestion && <Text style={styles.suggestionText}>Suggestion : {suggestion.label}</Text>}
   ```
4. Style : `colors.success`, `fontSize.xs`, `fontWeight: '600'`

## Criteres d'acceptation
- [ ] Suggestion affichee quand lastPerformance existe ET repsTarget non null
- [ ] Suggestion NON affichee si pas d'historique ou repsTarget null
- [ ] Couleur : `colors.success` (#34C759)
- [ ] Position : entre "Derniere : ..." et les series
- [ ] Pas d'interaction (texte informatif uniquement)
- [ ] `npx tsc --noEmit` passe
