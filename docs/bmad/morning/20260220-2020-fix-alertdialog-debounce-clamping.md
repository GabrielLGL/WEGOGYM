# Rapport — fix AlertDialog + debounce + clamping — 2026-02-20

## Problème
3 corrections groupées (Groupe B du dernier verrif) sur des fichiers différents :
1. `AlertDialog.tsx` — `onConfirm` peut lever une exception silencieuse en prod (pas de try/catch, pas de user feedback)
2. `WorkoutExerciseCard.tsx` — inputs weight/reps sans debounce → setState à chaque keystroke, risque de perf
3. `ExerciseTargetInputs.tsx` — pas de clamping sur sets/reps/weight → valeurs aberrantes possibles (ex: 9999 reps)

## Fichiers concernés
- `mobile/src/components/AlertDialog.tsx`
- `mobile/src/components/WorkoutExerciseCard.tsx`
- `mobile/src/components/ExerciseTargetInputs.tsx`

## Commande à lancer
/do Ajouter try/catch + feedback utilisateur dans AlertDialog.onConfirm en prod + debounce inputs WorkoutExerciseCard (300ms) + clamping valeurs ExerciseTargetInputs (sets 1-10, reps 1-99, weight 0-999)

## Contexte
- CLAUDE.md : No native Modal (Portal only), use useHaptics(), colors.* only, no any, validationHelpers pour validation
- AlertDialog est dans `components/AlertDialog.tsx`, utilise Portal
- WorkoutExerciseCard est dans `components/WorkoutExerciseCard.tsx`
- ExerciseTargetInputs est dans `components/ExerciseTargetInputs.tsx`
- Pour debounce : utiliser useRef + setTimeout/clearTimeout (pas de lib externe)
- Clamping : dans `validationHelpers.ts` si possible, sinon inline avec Math.min/Math.max
- Rapport verrif source : `docs/bmad/verrif/20260220-1844/RAPPORT.md` problèmes #2, #4, #7

## Critères de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 0 fail (les tests AlertDialog/WorkoutExerciseCard existants passent encore)
- AlertDialog : si onConfirm throw → message d'erreur visible ou haptic onDelete
- WorkoutExerciseCard : les inputs ne setState qu'après 300ms de pause
- ExerciseTargetInputs : impossible de saisir > seuils définis

## Statut
⏳ En attente
