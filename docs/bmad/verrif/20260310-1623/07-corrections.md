# Passe 7/8 — Corrections

## 7a — Critiques 🔴

### CRIT-1: Sequential `recalculateSetPrs` → `Promise.all()` ✅
**Fichier:** `screens/HistoryDetailScreen.tsx:214-215`
**Avant:** `for...of` loop séquentiel bloquant l'UI
**Après:** `Promise.all([...affectedExerciseIds].map(exId => recalculateSetPrs(exId)))` — concurrent, safe car chaque exercice indépendant

## 7b — Warnings 🟡

### WARN-Q1: 10x `any` dans useWorkoutCompletion.test.ts ✅
**Fichier:** `hooks/__tests__/useWorkoutCompletion.test.ts`
**Avant:** `let output: any` (10 occurrences)
**Après:** `let output: WorkoutCompletionResult | null | undefined` + import du type

### Non corrigés (risque comportemental):
- WARN-CR1: Program.duplicate() sequential → batch — modifie le comportement, nécessite test E2E
- WARN-CR2: HistoryDetailScreen imperative fetch → withObservables — refactoring significatif
- WARN-CR3: lastPerformance one-shot Promise — acceptable design tradeoff
- WARN-CR4: HomeScreen observe entire sets — optimisation perf significative, hors scope auto-fix
- WARN-B1: RestTimer stale haptics — risque réel faible, useHaptics stable
- WARN-B2: unsafe SQL cast — risque faible, debug log serait nice-to-have
- WARN-DB1: Migrations gap v1-v26 — historique, pas fixable sans risque
- WARN-Q2: exerciseDescriptions.ts dead code — décision produit (intégrer ou supprimer)

## 7c — Suggestions 🔵
Non traitées — toutes mineures (magic numbers, AnimatedSplash colors, useEffect deps stables).

## Vérifications post-correction
- TypeScript : ✅ 0 erreur
- Tests : ✅ 1737 passed, 0 failed
