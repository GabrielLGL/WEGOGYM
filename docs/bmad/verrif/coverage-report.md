
---

## Run P10 — 2026-03-21 (session test-coverage #4)

| Métrique   | Avant (P9) | Après (P10) | Delta  |
|------------|------------|-------------|--------|
| Statements | 72.93%     | 75.52%      | **+2.59%** |
| Branches   | 60.44%     | 62.21%      | **+1.77%** |
| Functions  | 65.86%     | 68.89%      | **+3.03%** |
| Lines      | 74.91%     | 77.61%      | **+2.70%** |

**1938 → 2046 tests (+108), 147 → 156 suites (+9)** — tous passent (0 failed).

Note : test fantôme `overtrainingHelpers.test.ts` résolu (cache Jest nettoyé).

### Fichiers de test ajoutés

| Fichier | Tests |
|---------|-------|
| `services/__tests__/shareService.test.ts` | 22 |
| `services/__tests__/progressPhotoService.test.ts` | 21 |
| `services/__tests__/widgetDataService.test.ts` | 5 |
| `components/__tests__/Toast.test.tsx` | 7 |
| `components/__tests__/WeeklyReportCard.test.tsx` | 11 |
| `components/__tests__/HexagonStatsCard.test.tsx` | 7 |
| `components/__tests__/ShareCard.test.tsx` | 19 |
| `components/__tests__/AnimatedSplash.test.tsx` | 4 |
| `components/__tests__/ScreenLoading.test.tsx` | 3 |
| `components/__tests__/WarmupChecklistSheet.test.tsx` | 8 |
| `components/__tests__/BadgeCelebration.test.tsx` | +1 (existant) |

### Couverture par fichier — avant/après

| Fichier | Avant | Après |
|---------|-------|-------|
| `shareService.ts` | 0% | **100%** |
| `progressPhotoService.ts` | 0% | **90%** |
| `Toast.tsx` | 0% | **100%** |
| `WeeklyReportCard.tsx` | 0% | **100%** |
| `HexagonStatsCard.tsx` | 0% | **100%** |
| `ShareCard.tsx` | 5% | **100%** |
| `AnimatedSplash.tsx` | 0% | **100%** |
| `ScreenLoading.tsx` | 50% | **100%** |
| `WarmupChecklistSheet.tsx` | 52% | **100%** |
| `widgetDataService.ts` | 43% | **58%** |
| `BadgeCelebration.tsx` | 50% | **56%** |

---

## Run P9 — 2026-03-07 (session test-coverage #3)

| Métrique   | Avant (P8) | Après (P9) | Delta  |
|------------|------------|------------|--------|
| Statements | 79.30%     | 81.00%     | **+1.70%** |
| Branches   | 67.85%     | 69.95%     | **+2.10%** |
| Functions  | 72.27%     | 74.26%     | **+1.99%** |
| Lines      | 77.35%     | 83.17%     | **+5.82%** |

**1687 → 1737 tests (+50), 106 → 112 suites (+6)** — tous passent.

### Fichiers ajoutés

| Fichier | Tests ajoutés |
|---------|---------------|
| `hooks/__tests__/useWorkoutCompletion.test.ts` | 13 |
| `model/utils/__tests__/dataManagementUtils.test.ts` | 3 |
| `model/utils/__tests__/exerciseDescriptions.test.ts` | 8 |
| `model/utils/__tests__/badgeConstants.test.ts` | 8 |
| `model/utils/__tests__/barrels.test.ts` | 16 |
| `components/__tests__/ScreenLoader.test.tsx` | 1 |
| `model/utils/__tests__/workoutSessionUtils.test.ts` | +1 |
| `services/ai/programGenerator/__tests__/exerciseSelector.test.ts` | +1 |

### Couverture par fichier clé — état final P9

| Fichier | Avant | Après |
|---------|-------|-------|
| `hooks/useWorkoutCompletion.ts` | 25.84% | **84.26%** |
| `model/utils/dataManagementUtils.ts` | 0% | **100%** |
| `model/utils/exerciseDescriptions.ts` | 0% | **100%** |
| `model/utils/badgeConstants.ts` | 50% | **100%** |
| `model/utils/databaseHelpers.ts` (barrel) | 0% | **100%** |
| `model/utils/statsHelpers.ts` (barrel) | 0% | **100%** |
| `components/ScreenLoader.tsx` | 0% | **100%** |
| `model/utils/workoutSessionUtils.ts` | 90% | **92%** |
| `services/ai/programGenerator/exerciseSelector.ts` | 84.61% | **100%** |

### Config

- Exclu `seedDevData.ts` (442 lignes, données dev-only sans logique) de la couverture
- Exclu `migrations.ts` (single-line re-export) de la couverture

---

## Run P8 — 2026-03-07 (session test-coverage #2)

| Métrique   | Avant (P7) | Après (P8) | Delta  |
|------------|------------|------------|--------|
| Statements | 75.69%     | 77.00%     | **+1.31%** |
| Branches   | 65.93%     | 67.80%     | **+1.87%** |
| Functions  | 70.61%     | 72.00%     | **+1.39%** |
| Lines      | 77.74%     | 79.01%     | **+1.27%** |

**1654 → 1687 tests (+33), 102 → 106 suites (+4)** — tous passent.

### Fichiers ajoutés

| Fichier | Tests ajoutés |
|---------|---------------|
| `model/utils/__tests__/buildRecapExercises.test.ts` | 6 |
| `hooks/__tests__/useSessionManager-superset.test.ts` | 10 |
| `hooks/__tests__/useCoachMarks.test.ts` | 7 |
| `components/__tests__/SessionExerciseItem-extended.test.tsx` | 13 |

### Couverture par fichier — avant/après

| Fichier | Avant | Après |
|---------|-------|-------|
| exerciseStatsUtils.ts | 79.83% stmts | **97.47%** |
| useSessionManager.ts | 68.96% stmts | **100%** |
| useCoachMarks.ts | 37.50% stmts | **100%** |
| SessionExerciseItem.tsx | 57.14% stmts | **85.71%** |
 corrigés**

### Couverture par fichier clé — état final P7

| Fichier | Avant | Après |
|---------|-------|-------|
| `workoutSetUtils.ts` | 34.48% | **100%** |
| `validationHelpers.ts` | 89.09% | **100%** |
| `exportHelpers.ts` | 60% | **96.77%** |
| `workoutSessionUtils.ts` | 81.48% | **100%** |
| `exerciseCatalog.ts` | 0% | **100%** |
| `timerBeep.ts` | 0% | **100%** |
7%   | 12            |
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

---

## Run P6 — 2026-02-19 (session test-coverage)

| Métrique   | Avant (P5) | Après (P6) | Delta  |
|------------|------------|------------|--------|
| Statements | 60.70%     | 68.39%     | +7.69% |
| Branches   | 54.14%     | 58.87%     | +4.73% |
| Functions  | 52.81%     | 59.96%     | +7.15% |
| Lines      | 61.72%     | 70.19%     | +8.47% |

**616 → 617 tests, 33 → 39 suites** — tous passent.

### Fichiers ajoutés/modifiés

| Fichier | Action | Tests ajoutés |
|---------|--------|---------------|
| `screens/WorkoutScreen.tsx` | Export `WorkoutContent` | — |
| `screens/SessionDetailScreen.tsx` | Export `SessionDetailContent` | — |
| `screens/__tests__/WorkoutScreen.test.tsx` | Créé | 10 |
| `screens/__tests__/SessionDetailScreen.test.tsx` | Créé | 11 |
| `model/models/__tests__/models.test.ts` | Créé | 29 |
| `components/__tests__/SetItem.test.tsx` | Créé | 9 |
| `components/__tests__/SessionExerciseItem.test.tsx` | Créé | 11 |
| `components/__tests__/WorkoutExerciseCard.test.tsx` | Créé | 13 |

**Total : 83 nouveaux tests** — 6 fichiers créés, 2 fichiers source modifiés (export nommé uniquement)

### Couverture par fichier clé — état final P6

| Fichier                                | Statements | Branches | Functions | Lines  |
|----------------------------------------|------------|----------|-----------|--------|
| `screens/WorkoutScreen.tsx`            | 65.06%     | 17.85%   | 53.57%    | 70.66% |
| `screens/SessionDetailScreen.tsx`      | 48.48%     | 29.16%   | 37.5%     | 50.84% |
| `model/models/Exercise.ts`             | 46.15%     | 100%     | 33.33%    | 46.15% |
| `model/models/History.ts`              | 100%       | 100%     | 100%      | 100%   |
| `model/models/PerformanceLog.ts`       | 100%       | 100%     | 100%      | 100%   |
| `model/models/Program.ts`              | 8%         | 0%       | 0%        | 8%     |
| `model/models/Session.ts`              | 100%       | 100%     | 100%      | 100%   |
| `model/models/SessionExercise.ts`      | 100%       | 100%     | 100%      | 100%   |
| `model/models/Set.ts`                  | 100%       | 100%     | 100%      | 100%   |
| `model/models/User.ts`                 | 100%       | 100%     | 100%      | 100%   |
| `components/SetItem.tsx`               | 80%        | 100%     | 50%       | 100%   |
| `components/SessionExerciseItem.tsx`   | 88.23%     | 84.21%   | 75%       | 92.85% |
| `components/WorkoutExerciseCard.tsx`   | 70.58%     | 73.07%   | 55.55%    | 69.69% |

### Notes techniques P6

- **WorkoutContent** : Tests limités aux interactions UI accessibles. La couverture de branches reste basse (17.85%) car les handlers async (abandon, navigation post-résumé, back Android) nécessitent des mocks plus profonds du système de navigation.
- **SessionDetailContent** : Branches non couvertes concentrées sur `handleAddExercise` (logique après picker) et `handleUpdateTargets` (modale edit) — leur logique réelle est dans `useSessionManager` déjà couvert à 100%.
- **Program.ts** : La méthode `duplicate()` n'est pas couverte (8%) car elle nécessite un vrai contexte de base de données WatermelonDB. La structure de la classe elle-même (table, associations) est vérifiée.
- **Exercise.ts** : Couverture à 46% car `deleteAllAssociatedData()` (cascade delete) nécessite un contexte DB réel. Le getter/setter `muscles` est 100% couvert.
