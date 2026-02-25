# STORY-04 — Bouton info dans SessionExerciseItem

## Description
Ajouter une icone info (i) a cote du nom de l'exercice dans SessionExerciseItem. Au tap, ouvre l'ExerciseInfoSheet pour consulter la fiche de l'exercice sans quitter la seance.

## Taches techniques
1. Modifier `mobile/src/components/SessionExerciseItem.tsx`
2. Ajouter imports : `ExerciseInfoSheet`, `useModalState`, `useHaptics`, `Ionicons`
3. Ajouter state : `const infoSheet = useModalState()`
4. Ajouter icone `information-circle-outline` (20px, textSecondary) a cote du nom
5. Au tap : `haptics.onPress()` + `infoSheet.open()`
6. Ajouter `<ExerciseInfoSheet>` dans le rendu
7. Verifier que le flow de saisie/drag n'est pas casse
8. Lancer `npx tsc --noEmit` → 0 erreur

## Criteres d'acceptation
- [ ] Icone info visible a cote du nom de chaque exercice
- [ ] Tap ouvre le ExerciseInfoSheet avec le bon exercice
- [ ] Haptic feedback `onPress` au tap
- [ ] Le drag & drop reste fonctionnel
- [ ] Le tap sur les targets/delete reste fonctionnel
- [ ] TypeScript compile sans erreur

## Estimation
S (30 min - 1h)

## Dependances
STORY-03 (composant ExerciseInfoSheet)
