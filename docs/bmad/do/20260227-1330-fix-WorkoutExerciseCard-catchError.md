# fix(WorkoutExerciseCard) — __DEV__ log in catchError observable
Date : 2026-02-27 13:30

## Instruction
RAPPORT 20260227-1220 — problème #6
Ajoute un log __DEV__ dans le catchError de WorkoutExerciseCard.tsx:337 pour
que les erreurs d'observable ne soient plus avalées silencieusement.

## Rapport source
docs/bmad/verrif/20260227-1220/RAPPORT.md (problème #6 — H4)

## Classification
Type : fix
Fichiers modifiés : aucun (fix déjà présent)

## Ce qui a été fait
Le fix était **déjà appliqué** avant ce run. `WorkoutExerciseCard.tsx:341-344` contenait :
```tsx
catchError(err => {
  if (__DEV__) console.error('WorkoutExerciseCard: lastPerformance error', err)
  return of(null)
})
```
Aucun changement de code requis. Vérification + documentation du statut.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : ✅ 19/19 passed (WorkoutExerciseCard suite)
- Nouveau test créé : non

## Documentation mise à jour
- docs/bmad/verrif/20260227-1220/RAPPORT.md — problème #6 marqué ✅ Résolu

## Statut
✅ Résolu — 20260227-1330

## Commit
08bd07a fix(useSessionManager): guard exercise null before PerformanceLog creation
(co-inclus dans le commit parallèle)
