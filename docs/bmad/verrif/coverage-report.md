# Coverage Report — 2026-02-19

## Avant / Après

| Métrique   | Avant  | Après  | Gain   |
|------------|--------|--------|--------|
| Statements | 11.64% | 30.07% | +18.4% |
| Branches   | 14.03% | 27.20% | +13.2% |
| Functions  | 12.73% | 26.80% | +14.1% |
| Lines      | 11.97% | 30.43% | +18.5% |

## Tests ajoutés : 114 nouveaux tests dans 5 fichiers

---

## Par priorité

### P1 — Hooks critiques (commit c0eb43c)

| Fichier               | Avant | Après | Tests ajoutés |
|-----------------------|-------|-------|---------------|
| `useProgramManager.ts` | 0%   | 100%  | 34            |
| `useSessionManager.ts` | 0%   | 100%  | 23            |
| `useWorkoutState.ts`   | 0%   | 100%  | 23            |

**80 nouveaux tests** — 3 fichiers créés dans `mobile/src/hooks/__tests__/`

Couverture finale :
- `useProgramManager.ts` : 100% statements / 92% branches / 100% functions
- `useSessionManager.ts` : 100% toutes métriques
- `useWorkoutState.ts` : 100% statements / 94% branches / 100% functions

### P2 — Utils & helpers (commit c386d11)

| Fichier               | Avant | Après | Tests ajoutés |
|-----------------------|-------|-------|---------------|
| `validationHelpers.ts` | ~75% | 97%   | 12            |
| `databaseHelpers.ts`   | ~40% | 63%   | 22            |

**34 nouveaux tests** — 2 fichiers existants modifiés

Fonctions nouvellement couvertes :
- `validateSetInput` (12 cas)
- `formatRelativeDate` (5 cas — fonction pure)
- `buildExerciseStatsFromData` (6 cas — fonction pure)
- `getMaxWeightForExercise` (3 cas)
- `completeWorkoutHistory` (1 cas)
- `updateHistoryNote` (1 cas)
- `createWorkoutHistory` (2 cas)
- `saveWorkoutSet` (1 cas)
- `getLastPerformanceForExercise` (3 cas)

Non couverts (hors scope P2) :
- `getNextPosition` (ligne 50-51) — testé indirectement via hooks
- `importGeneratedPlan` / `importGeneratedSession` (lignes 521-666) — fonctions AI complexes, scope séparé

---

## Détail couverture par fichier clé

| Fichier                          | Statements | Branches | Functions | Lines |
|----------------------------------|------------|----------|-----------|-------|
| `hooks/useProgramManager.ts`     | 100%       | 92%      | 100%      | 100%  |
| `hooks/useSessionManager.ts`     | 100%       | 100%     | 100%      | 100%  |
| `hooks/useWorkoutState.ts`       | 100%       | 94%      | 100%      | 100%  |
| `model/utils/validationHelpers.ts` | 97%      | 98%      | 100%      | 97%   |
| `model/utils/databaseHelpers.ts` | 63%        | 84%      | 68%       | 64%   |

## Suites de tests — état final

| Suite                          | Tests |
|--------------------------------|-------|
| `useProgramManager.test.ts`    | 34    |
| `useSessionManager.test.ts`    | 23    |
| `useWorkoutState.test.ts`      | 23    |
| `databaseHelpers.test.ts`      | 57    |
| `validationHelpers.test.ts`    | 35    |
| `useModalState.test.ts`        | 13    |
| `useHaptics.test.ts`           | 9     |
| `notificationService.test.ts`  | 8     |
| `AlertDialog.test.tsx`         | 8     |
| `Button.test.tsx`              | 9     |
| `OnboardingSheet.test.tsx`     | 8     |
| `SettingsScreen.test.tsx`      | 7     |
| **Total**                      | **234** |
