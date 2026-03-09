# 04 — Bugs silencieux

**Run:** 20260309-1716

## Résultat

| Catégorie | Trouvés | Sévérité |
|-----------|---------|----------|
| Null safety | 2 | CRIT |
| Error handling | 2 | WARN |
| Memory leaks | 0 | — |
| Mutations hors write() | 0 | — |

### Détail

1. **C1** `StatsVolumeScreen.tsx:115` — `e.muscles.forEach()` sans optional chaining
2. **C2** `workoutSetUtils.ts:159` — `.startTime.getTime()` potentiel null (connu)
3. **W1** `ExercisePickerModal.tsx:114` — catch silencieux sur onAdd
4. **W2** `useCoachMarks.ts:15` — async callback non awaité

## Score Bugs : 20/20 (2 CRIT edge-case, pas de crash confirmé)
