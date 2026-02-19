# style(workout) — Redesign WorkoutHeader avec barre de progression et nouvelles props
Date : 2026-02-19 19:05

## Instruction
Redesign UI de WorkoutHeader ET mise à jour de WorkoutScreen — nouveau layout row (timer / volume),
compteur de séries, barre de progression statique, nouvelles props completedSets et totalSetsTarget.

## Classification
Type : style
Fichiers :
- mobile/src/components/WorkoutHeader.tsx
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/components/__tests__/WorkoutHeader.test.tsx

## Ce qui a été fait

### WorkoutHeader.tsx
- Nouvelle interface : `completedSets: number`, `totalSetsTarget: number`
- Layout row : timer (fontSize.xxxl, monospace, bold) à gauche / volume (value xl + "kg" xs) à droite
- Ligne centrale : "{completedSets} / {totalSetsTarget} séries" — colors.success si > 0, sinon textSecondary
- Barre de progression statique (height 3, colors.success) sur fond cardSecondary — visible seulement si totalSetsTarget > 0

### WorkoutScreen.tsx
- `totalSets` → `completedSets`
- Ajout `totalSetsTarget = sessionExercises.reduce(...)`
- `<WorkoutHeader>` mis à jour avec les 4 props
- `<WorkoutSummarySheet totalSets={completedSets}>` mis à jour

### WorkoutHeader.test.tsx
- Props mises à jour (defaultProps avec completedSets/totalSetsTarget)
- Assertions volume adaptées au nouveau rendu (valeur + "kg" séparés)
- Nouveaux tests : compteur séries (0/0 et 3/10)

## Vérification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 10 passed (WorkoutHeader.test.tsx)
- Nouveau test créé : oui (compteur séries)

## Commit
a50c2b0 style(workout): redesign rest timer with progress bar, dynamic color, and card layout
(inclus dans le commit du Claude parallèle — WorkoutHeader.tsx, WorkoutScreen.tsx, WorkoutHeader.test.tsx présents)
