# FEAT(workout) — hide end-button under keyboard + unvalidate set
Date : 2026-02-19 12:30

## Instruction
dans WorkoutExerciseCard.tsx + WorkoutScreen.tsx : bouton ↩ + footer sous clavier

## Classification
Type : feat
Fichiers :
- mobile/src/components/WorkoutExerciseCard.tsx
- mobile/src/screens/WorkoutScreen.tsx

## Ce qui a été fait

### WorkoutScreen.tsx
- Import `Animated` depuis react-native
- Import `useKeyboardAnimation` depuis hooks/
- Destructure `unvalidateSet` depuis useWorkoutState
- `const footerSlide = useKeyboardAnimation(120)` — offset positif pour glisser vers le bas
- `<View style={styles.footer}>` → `<Animated.View style={[styles.footer, { transform: [{ translateY: footerSlide }] }]}>`
- Passage de `onUnvalidateSet={unvalidateSet}` à WorkoutExerciseCard

### WorkoutExerciseCard.tsx
- Ajout de `onUnvalidateSet` dans `WorkoutExerciseCardContentProps`
- Ajout de `onUnvalidate` dans `WorkoutSetRowProps`
- Dans l'état validé du WorkoutSetRow : bouton ↩ (ghost, color textSecondary) après le ✓
- onPress → haptics.onDelete() + await onUnvalidateSet(sessionExercise, setOrder)
- 2 nouveaux styles : `unvalidateBtn` + `unvalidateBtnText`

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 533 passed, 0 failed
- Nouveau test créé : non

## Commit
88b89ce feat(workout): hide end-button under keyboard + unvalidate set
