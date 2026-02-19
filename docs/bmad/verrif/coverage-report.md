# Coverage Report — 2026-02-19

## Avant / Après (P1+P2 → P3+P4)

| Métrique   | Avant (P1+P2) | Après (P3+P4) | Delta  |
|------------|---------------|---------------|--------|
| Statements | 30.07%        | 39.63%        | +9.6%  |
| Branches   | 27.20%        | 33.80%        | +6.6%  |
| Functions  | 26.80%        | 35.55%        | +8.8%  |
| Lines      | 30.43%        | 40.27%        | +9.8%  |

## Depuis l'état initial (avant P1)

| Métrique   | Avant tout | Après P3+P4 | Delta total |
|------------|------------|-------------|-------------|
| Statements | 11.64%     | 39.63%      | +28.0%      |
| Branches   | 14.03%     | 33.80%      | +19.8%      |
| Functions  | 12.73%     | 35.55%      | +22.8%      |
| Lines      | 11.97%     | 40.27%      | +28.3%      |

---

## Par priorité

### P1 — Hooks critiques (commit c0eb43c)

| Fichier               | Avant | Après | Tests ajoutés |
|-----------------------|-------|-------|---------------|
| `useProgramManager.ts` | 0%   | 100%  | 34            |
| `useSessionManager.ts` | 0%   | 100%  | 23            |
| `useWorkoutState.ts`   | 0%   | 100%  | 23            |

**80 nouveaux tests** — 3 fichiers créés dans `mobile/src/hooks/__tests__/`

### P2 — Utils & helpers (commit c386d11)

| Fichier               | Avant | Après | Tests ajoutés |
|-----------------------|-------|-------|---------------|
| `validationHelpers.ts` | ~75% | 97%   | 12            |
| `databaseHelpers.ts`   | ~40% | 63%   | 22            |

**34 nouveaux tests** — 2 fichiers dans `mobile/src/model/utils/__tests__/`

### P3 — Hooks secondaires (2026-02-19)

| Fichier                  | Statements | Branches | Fonctions | Lignes |
|--------------------------|-----------|---------|-----------|--------|
| useExerciseFilters.ts    | 100%      | 100%    | 100%      | 100%   |
| useExerciseManager.ts    | 100%      | 100%    | 100%      | 100%   |
| useWorkoutTimer.ts       | 100%      | 50%     | 100%      | 100%   |
| useKeyboardAnimation.ts  | 100%      | 60%     | 100%      | 100%   |

Note branches non couvertes : `Platform.OS === 'ios'` (useKeyboardAnimation L26-27) et cleanup de l'intervalle (useWorkoutTimer L40).

**73 nouveaux tests** dans 4 fichiers créés.

### P4 — Composants avec logique (2026-02-19)

| Fichier          | Statements | Branches | Fonctions | Lignes |
|------------------|-----------|---------|-----------|--------|
| ChipSelector.tsx | 100%      | 100%    | 100%      | 100%   |
| ErrorBoundary.tsx| 100%      | 100%    | 100%      | 100%   |
| RestTimer.tsx    | 93.44%    | 79.16%  | 100%      | 92.59% |

Note RestTimer : lignes 78-79, 93-94 (finishTimer / closeTimer après décompte à 0) non couvertes car déclenchées uniquement après que le timer atteigne 0 dans un environnement de timers réels.

**33 nouveaux tests** dans 3 fichiers créés.

---

## Tests ajoutés (P3+P4) : 106 nouveaux tests dans 7 fichiers

| Fichier de test                   | Tests | Répertoire                        |
|-----------------------------------|-------|-----------------------------------|
| `useExerciseFilters.test.ts`      | 18    | `hooks/__tests__/`                |
| `useExerciseManager.test.ts`      | 30    | `hooks/__tests__/`                |
| `useWorkoutTimer.test.ts`         | 12    | `hooks/__tests__/`                |
| `useKeyboardAnimation.test.ts`    | 13    | `hooks/__tests__/`                |
| `ChipSelector.test.tsx`           | 14    | `components/__tests__/`           |
| `ErrorBoundary.test.tsx`          | 8     | `components/__tests__/`           |
| `RestTimer.test.tsx`              | 11    | `components/__tests__/`           |

---

## Suites de tests — état final (après P1+P2+P3+P4)

| Suite                            | Tests |
|----------------------------------|-------|
| `useProgramManager.test.ts`      | 34    |
| `useSessionManager.test.ts`      | 23    |
| `useWorkoutState.test.ts`        | 23    |
| `useExerciseManager.test.ts`     | 30    |
| `useExerciseFilters.test.ts`     | 18    |
| `useWorkoutTimer.test.ts`        | 12    |
| `useKeyboardAnimation.test.ts`   | 13    |
| `useModalState.test.ts`          | 13    |
| `useHaptics.test.ts`             | 9     |
| `databaseHelpers.test.ts`        | 57    |
| `validationHelpers.test.ts`      | 35    |
| `notificationService.test.ts`    | 8     |
| `AlertDialog.test.tsx`           | 8     |
| `Button.test.tsx`                | 9     |
| `ChipSelector.test.tsx`          | 14    |
| `ErrorBoundary.test.tsx`         | 8     |
| `RestTimer.test.tsx`             | 11    |
| `OnboardingSheet.test.tsx`       | 8     |
| `SettingsScreen.test.tsx`        | 7     |
| **Total**                        | **334** |

---

## Couverture par fichier clé — état final

| Fichier                          | Statements | Branches | Functions | Lines |
|----------------------------------|------------|----------|-----------|-------|
| `hooks/useProgramManager.ts`     | 100%       | 92%      | 100%      | 100%  |
| `hooks/useSessionManager.ts`     | 100%       | 100%     | 100%      | 100%  |
| `hooks/useWorkoutState.ts`       | 100%       | 94%      | 100%      | 100%  |
| `hooks/useExerciseFilters.ts`    | 100%       | 100%     | 100%      | 100%  |
| `hooks/useExerciseManager.ts`    | 100%       | 100%     | 100%      | 100%  |
| `hooks/useWorkoutTimer.ts`       | 100%       | 50%      | 100%      | 100%  |
| `hooks/useKeyboardAnimation.ts`  | 100%       | 60%      | 100%      | 100%  |
| `hooks/useModalState.ts`         | 100%       | 100%     | 100%      | 100%  |
| `hooks/useHaptics.ts`            | 100%       | 100%     | 100%      | 100%  |
| `components/AlertDialog.tsx`     | 100%       | 100%     | 100%      | 100%  |
| `components/Button.tsx`          | 92.85%     | 94.73%   | 100%      | 100%  |
| `components/ChipSelector.tsx`    | 100%       | 100%     | 100%      | 100%  |
| `components/ErrorBoundary.tsx`   | 100%       | 100%     | 100%      | 100%  |
| `components/RestTimer.tsx`       | 93.44%     | 79.16%   | 100%      | 92.59%|
| `model/utils/validationHelpers.ts`| 97.29%    | 97.56%   | 100%      | 97.14%|
| `model/utils/databaseHelpers.ts` | 62.66%     | 83.6%    | 68%       | 63.5% |
| `services/notificationService.ts`| 81.48%     | 66.66%   | 100%      | 95.45%|

---

## Opportunités suivantes (P5+)

Pour atteindre 50%+ global, les pistes les plus rentables :

1. **`databaseHelpers.ts`** — couvrir `importGeneratedPlan` / `importGeneratedSession` (lignes 521-666, ~+5% lignes globales)
2. **`sentry.ts`** — 0% actuellement, simple à tester avec mocks (~+1%)
3. **`SettingsScreen.tsx`** — déjà à 31.9%, potentiel supplémentaire (~+3%)
4. **Composants UI simples** — `LastPerformanceBadge`, `WorkoutHeader` (~+1%)

---

## Run P5 — 2026-02-19

| Métrique   | Avant (P4) | Après (P5) | Delta  |
|------------|------------|------------|--------|
| Statements | 39.63%     | 49.94%     | +10.3% |
| Branches   | 33.80%     | 41.46%     | +7.7%  |
| Functions  | 35.55%     | 44.86%     | +9.3%  |
| Lines      | 40.27%     | 50.78%     | +10.5% |

**Objectif 50% atteint : 50.78% de lignes couvertes.**

### Fichiers ajoutés/modifiés

| Fichier | Action | Tests ajoutés |
|---------|--------|---------------|
| `model/utils/__tests__/databaseHelpers.test.ts` | Correction (dynamic import bug) | 0 nouveaux, 2 bugs corrigés |
| `services/__tests__/sentry.test.ts` | Créé | 10 |
| `components/__tests__/ExerciseTargetInputs.test.tsx` | Créé | 12 |
| `components/__tests__/LastPerformanceBadge.test.tsx` | Créé | 7 |
| `components/__tests__/CustomModal.test.tsx` | Créé | 10 |
| `components/__tests__/WorkoutHeader.test.tsx` | Créé | 9 |
| `components/__tests__/BottomSheet.test.tsx` | Créé | 7 |
| `components/__tests__/WorkoutSummarySheet.test.tsx` | Créé | 14 |
| `components/__tests__/SessionItem.test.tsx` | Créé | 8 |
| `screens/__tests__/SettingsScreen.test.tsx` | Étendu (3→24 tests) | 21 |

**Total : 98 nouveaux tests** — 9 fichiers créés, 2 fichiers modifiés

### Couverture par fichier clé — état final P5

| Fichier                               | Statements | Branches | Functions | Lines  |
|---------------------------------------|------------|----------|-----------|--------|
| `components/CustomModal.tsx`          | 100%       | 100%     | 100%      | 100%   |
| `components/ExerciseTargetInputs.tsx` | 100%       | 100%     | 100%      | 100%   |
| `components/LastPerformanceBadge.tsx` | 100%       | 100%     | 100%      | 100%   |
| `components/WorkoutHeader.tsx`        | 100%       | 100%     | 100%      | 100%   |
| `components/BottomSheet.tsx`          | ~80%       | ~75%     | 100%      | ~85%   |
| `components/WorkoutSummarySheet.tsx`  | ~90%       | ~85%     | 100%      | ~90%   |
| `model/utils/databaseHelpers.ts`      | 97.85%     | 93.44%   | 98.66%    | 99%    |
| `screens/SettingsScreen.tsx`          | 81.57%     | 81.63%   | 66.66%    | 81.94% |
| `services/sentry.ts`                  | 36.84%     | 31.81%   | 66.66%    | 41.17% |

### Notes techniques

- **databaseHelpers.test.ts** : Correction des 2 tests `importGeneratedSession` qui utilisaient `await import()` dynamique (non supporté sans `--experimental-vm-modules`). Remplacé par l'import statique déjà disponible en tête du fichier.
- **sentry.ts** : Les branches liées à `__DEV__ = false` ne peuvent pas être testées car Jest/jest-expo fixe `__DEV__ = true` au runtime. Seuls les chemins avec `__DEV__ = true` sont couverts.
- **SessionItem.tsx** : Composant interne testé via un wrapper pur (sans `withObservables`) pour éviter la dépendance à WatermelonDB en tests.
- **WorkoutSummarySheet.tsx** : Tests complets incluant le debounce de sauvegarde de note et le flush à la fermeture.
