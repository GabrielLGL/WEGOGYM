# STORY-05 — Bouton info dans ExercisePickerModal

## Description
Ajouter une icone info (i) a cote de chaque exercice dans la bibliotheque (ExercisePickerModal). Au tap sur l'icone, ouvre l'ExerciseInfoSheet. Le tap sur le reste de la ligne reste la selection d'exercice.

## Taches techniques
1. Modifier `mobile/src/components/ExercisePickerModal.tsx`
2. Ajouter imports : `ExerciseInfoSheet`, `useModalState`, `Ionicons`
3. Ajouter state : `selectedInfoExercise` + `infoSheet = useModalState()`
4. Modifier chaque ligne exercice : nom a gauche, icone (i) a droite
5. Tap sur (i) : ouvre info sheet (ne selectionne PAS l'exercice)
6. Tap sur le reste : selection exercice (inchange)
7. Ajouter `<ExerciseInfoSheet>` dans le rendu
8. Lancer `npx tsc --noEmit` → 0 erreur

## Criteres d'acceptation
- [ ] Icone info visible sur chaque ligne exercice
- [ ] Tap sur (i) ouvre ExerciseInfoSheet pour le bon exercice
- [ ] Tap sur la ligne (hors icone) selectionne l'exercice normalement
- [ ] Les filtres muscle/equipment restent fonctionnels
- [ ] L'ajout d'exercice reste fonctionnel
- [ ] TypeScript compile sans erreur

## Estimation
S (30 min - 1h)

## Dependances
STORY-03 (composant ExerciseInfoSheet)
