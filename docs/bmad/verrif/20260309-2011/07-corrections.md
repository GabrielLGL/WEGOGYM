# Passe 7/8 — Corrections

**Date :** 2026-03-09 20:11

## 7a — Critiques 🔴

Aucun critique trouvé. TSC 0 errors, 1737 tests pass, WDB schema/model sync OK.

## 7b — Warnings 🟡 (3 corrigés)

### W1 — `useWorkoutState.ts` : 3 fonctions sans `useCallback`
- `updateSetInput` → `useCallback([], [])`
- `validateSet` → `useCallback([historyId])`
- `unvalidateSet` → `useCallback([historyId, validatedSets])`
- **Impact** : le `renderWorkoutItem` du FlatList était recréé à chaque keystroke, causant un re-render complet de la liste

### W2 — `HomeScreen.tsx` : `handleCloseCelebration` sans `useCallback`
- Wrappé en `useCallback([], [])`
- **Impact** : MilestoneCelebration et BadgeCelebration re-rendaient à chaque render parent

### W3 — `CoachMarks.tsx` : race condition double-fire `onComplete`
- Ajout `completedRef = useRef(false)` comme guard dans `handleComplete`
- Reset du ref quand `visible` passe à false (pour permettre ré-affichage)
- **Impact** : timeout 10s + clic utilisateur simultané pouvaient appeler `onComplete()` deux fois

## 7c — Suggestions 🔵

Non corrigées (non bloquantes) :
- `as any` dans les tests (197 occurrences) — nécessite factories de mock typées, effort ~2h
- Valeurs magiques padding scroll (100, 150, 80) — contextuelles, pas de token adapté

## Vérification post-correction

- TypeScript : ✅ 0 erreurs
- Tests : ✅ 1737 passed, 0 failed
