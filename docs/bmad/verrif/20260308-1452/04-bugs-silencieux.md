# 04 — Bugs silencieux

**Date :** 2026-03-08 14:52

## Scan

Scan complet de tous les .ts/.tsx dans `mobile/src/`.

### Async sans try/catch
✅ Tous les appels async dans les hooks et screens sont protégés par try/catch ou `.catch()`.

### Mutations WDB hors write()
✅ Toutes les mutations (`create`, `update`, `destroyPermanently`, `batch`) sont dans `database.write()`.

### Null safety
✅ Les accès optionnels utilisent `?.` ou des guards. Les refs avec `useRef<T | null>(null)` sont vérifiées avant usage.

### Fuites mémoire
✅ Tous les `setTimeout`/`setInterval` ont un cleanup dans useEffect return ou via refs :
- `RestTimer.tsx` : 4 timer refs avec clearTimeout/clearInterval dans cleanup
- `WorkoutExerciseCard.tsx` : weightTimerRef/repsTimerRef avec cleanup
- `WorkoutSummarySheet.tsx` : debounceRef avec cleanup
- `useKeyboardAnimation.ts` : listeners `.remove()` dans cleanup

### Race conditions
✅ `isMountedRef` utilisé dans `RestTimer`, `useWorkoutCompletion`, `useAssistantWizard` pour éviter les updates post-unmount.

### Missing await
✅ Aucun appel async sans await détecté dans les chemins critiques.

### Console.log/warn/error
✅ Tous les console.* sont gardés par `if (__DEV__)`.

## Conclusion

✅ **0 bug silencieux détecté.** Les patterns défensifs sont bien en place.
