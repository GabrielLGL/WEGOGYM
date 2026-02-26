# /do — perf + style screens
**Date :** 2026-02-26
**Source :** docs/bmad/verrif/20260226-1242/RAPPORT.md (problèmes #3 et #4)

---

## Tâche A — perf(WorkoutExerciseCard) ✅

**Fichier :** `mobile/src/components/WorkoutExerciseCard.tsx`

### Changements effectués
1. `WorkoutSetRowProps` : signatures de `onValidate` et `onUnvalidate` enrichies avec `setOrder: number`
2. `WorkoutSetRow` : appels mis à jour (`onValidate(setOrder, ...)`, `onUnvalidate(setOrder)`)
3. `WorkoutSetRow` wrappé dans `React.memo(function WorkoutSetRow(...))`
4. Handlers stables ajoutés dans `WorkoutExerciseCardContent` :
   - `handleValidate` via `useCallback([haptics, onValidateSet, sessionExercise])`
   - `handleUnvalidate` via `useCallback([haptics, onUnvalidateSet, sessionExercise])`
5. Callbacks inline dans le `.map()` remplacés par `handleValidate` / `handleUnvalidate`

**Impact :** Les lignes de séries ne se re-rendent plus inutilement quand le parent re-render sans changement de données.

---

## Tâche B — style(screens) magic numbers ✅

### B1 — ExercisesScreen.tsx
Remplacements : `paddingTop:10→spacing.sm`, `paddingBottom:15→spacing.ms`, `marginBottom:15→spacing.ms`, `paddingHorizontal:15→spacing.ms` (×2), `marginLeft:10→spacing.sm`, `paddingVertical:15→spacing.ms`, `fontSize:17→fontSize.md`, `fontSize:13→fontSize.xs` (×3), `padding:10→spacing.sm`, `marginBottom:10→spacing.sm`, `padding:15→spacing.ms`, `paddingVertical:10→spacing.sm`, `paddingHorizontal:15→spacing.ms`, `borderRadius:10→borderRadius.sm`, `marginRight:10→spacing.sm` (×2), `paddingVertical:15→spacing.ms`, `marginRight:15→spacing.ms` + inline `marginTop:10→spacing.sm`

### B2 — ChartsScreen.tsx
Remplacements : `paddingVertical:10→spacing.sm`, `paddingVertical:15→spacing.ms`, `paddingHorizontal:16→spacing.md`, `paddingVertical:10→spacing.sm`, `marginRight:10→spacing.sm`, `fontSize:13→fontSize.xs`, `marginBottom:20→spacing.lg`, `marginVertical:8→spacing.sm`, `marginTop:25→spacing.lg`, `marginBottom:15→spacing.ms`, `padding:15→spacing.ms`, `marginBottom:10→spacing.sm`, `padding:10→spacing.sm`

### B3 — SessionDetailScreen.tsx
Remplacements : `paddingTop:10→spacing.sm`, `padding:18→spacing.md` (×2), `marginBottom:10→spacing.sm`

---

## Vérification
- `npx tsc --noEmit` : **0 erreur**
- `npm test` : **1257 tests passés / 75 suites**

---

## Fichiers NON modifiés (déjà résolus)
- `databaseHelpers.ts` — barrel 25L (déjà splité)
- `statsHelpers.ts` — barrel 18L (déjà splité)
