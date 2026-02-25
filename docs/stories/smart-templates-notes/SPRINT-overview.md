# Sprint — Smart Templates + Notes exercice

> Feature: #23 Templates intelligents + #22 Notes par exercice
> Date: 2026-02-24
> Priorite: Core gratuit — Phase 1 Fondations

## Stories

| # | Story | Priorite | Dependance | Fichiers |
|---|-------|----------|------------|----------|
| S01 | Migration schema v18 (notes) | Must | — | schema.ts, Exercise.ts |
| S02 | Helper derniers sets (poids + reps) | Must | — | databaseHelpers.ts |
| S03 | Helper suggestion progression | Must | — | progressionHelpers.ts (NEW) |
| S04 | Pre-remplissage poids + reps | Must | S02 | useWorkoutState.ts |
| S05 | Indicateur suggestion | Must | S03 | WorkoutExerciseCard.tsx |
| S06 | Notes editables workout | Must | S01 | WorkoutExerciseCard.tsx |
| S07 | Indicateur note planification | Should | S01 | SessionExerciseItem.tsx |

## Ordre d'implementation

```
S01 (schema) ─────────────┐
                           ├── S06 (notes workout) ── S07 (notes indicator)
S02 (helper sets) ── S04 (prefill)
S03 (helper progression) ── S05 (suggestion)
```

S01, S02, S03 sont independants → peuvent etre faits en parallele.
S04 depend de S02. S05 depend de S03. S06 et S07 dependent de S01.

## Estimation
- 7 stories
- ~6 fichiers modifies, 1 nouveau
- Pas de nouvelle dependance npm
- Pas de nouvel ecran
