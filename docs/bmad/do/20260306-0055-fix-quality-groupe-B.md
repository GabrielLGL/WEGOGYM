# fix(misc) — icon as any + shadowColor hardcode
Date : 2026-03-06 00:55

## Instruction
WorkoutSummarySheet icon as any + sentry console.log + CoachMarks shadowColor

## Rapport source
docs/bmad/reviews/20260306-0030-review.md (issues #2, #3, #5)

## Classification
Type : fix
Fichiers modifies : WorkoutSummarySheet.tsx, CoachMarks.tsx

## Ce qui a ete fait
1. **WorkoutSummarySheet.tsx** : Remplace `icon: string` par `icon: React.ComponentProps<typeof Ionicons>['name']` et supprime le `as any` cast. Type-safe.
2. **CoachMarks.tsx** : Remplace `shadowColor: '#000'` par `shadowColor: colors.shadow` (couleur theme dynamique).
3. **sentry.ts** : Faux positif — le `console.log` est deja garde par `if (__DEV__ && !SENTRY_DSN)`. Aucun changement necessaire.

## Verification
- TypeScript : ✅ zero erreur
- Tests : ✅ 1572 passed (93 suites)
- Nouveau test cree : non

## Documentation mise a jour
aucune

## Statut
✅ Resolu — 20260306-0055
