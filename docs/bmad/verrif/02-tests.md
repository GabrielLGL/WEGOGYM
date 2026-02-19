# Tests — 2026-02-19

## Résultat : ✅ 533 passed / 🔴 0 failed / ⏭️ 0 skipped

**33 suites — 13.2s — Aucun échec**

---

### Tests en échec

Aucun. ✅

---

### Couverture

| Métrique    | Valeur  |
|-------------|---------|
| Statements  | 60.70%  |
| Branches    | 54.14%  |
| Functions   | 52.81%  |
| Lines       | 61.72%  |

#### Détail par répertoire

| Répertoire       | Stmts   | Branch  | Funcs   | Lines   |
|------------------|---------|---------|---------|---------|
| components/      | 59.94%  | 50.94%  | 53.60%  | 61.53%  |
| hooks/           | 100%    | 93.51%  | 100%    | 100%    |
| model/           | 18.51%  | 0%      | 0%      | 19.23%  |
| model/models/    | 0%      | 0%      | 0%      | 0%      |
| model/utils/     | 96%     | 93.26%  | 96.38%  | 97.07%  |
| screens/         | 26.46%  | 27.55%  | 19.71%  | 28.59%  |
| services/        | 63.04%  | 44.11%  | 87.50%  | 71.79%  |
| services/ai/     | 53.25%  | 54.88%  | 33.33%  | 52.77%  |

#### Fichiers à 100% de couverture ✅
- `AlertDialog.tsx`, `BottomSheet.tsx`, `ChipSelector.tsx`, `CustomModal.tsx`, `ErrorBoundary.tsx`
- `ExerciseTargetInputs.tsx`, `LastPerformanceBadge.tsx`
- `useExerciseFilters.ts`, `useExerciseManager.ts`, `useHaptics.ts`, `useModalState.ts`, `useSessionManager.ts`
- `model/constants.ts`, `model/onboardingPrograms.ts`
- `services/ai/offlineEngine.ts`

---

### Fichiers critiques sans tests (couverture 0%)

#### model/models/ — CRITIQUE (8 fichiers)
- `model/models/Exercise.ts`
- `model/models/History.ts`
- `model/models/PerformanceLog.ts`
- `model/models/Program.ts`
- `model/models/Session.ts`
- `model/models/SessionExercise.ts`
- `model/models/Set.ts`
- `model/models/User.ts`

#### screens/ — 4 écrans
- `screens/AssistantScreen.tsx`
- `screens/ChartsScreen.tsx`
- `screens/SessionDetailScreen.tsx`
- `screens/WorkoutScreen.tsx`

#### components/ — 5 composants
- `components/AssistantPreviewSheet.tsx`
- `components/ExercisePickerModal.tsx`
- `components/SessionExerciseItem.tsx`
- `components/SetItem.tsx`
- `components/WorkoutExerciseCard.tsx`

#### services/ai/ — 4 providers
- `services/ai/aiService.ts`
- `services/ai/claudeProvider.ts`
- `services/ai/geminiProvider.ts`
- `services/ai/openaiProvider.ts`

#### Autres
- `model/seed.ts` — 8.33% (logique de seeding quasi non couverte)
- `types/workout.ts` — 0%

---

### Couverture partielle à améliorer

| Fichier                           | Stmts   | Priorité |
|-----------------------------------|---------|----------|
| `screens/HomeScreen.tsx`          | 35.65%  | Haute    |
| `screens/ExercisesScreen.tsx`     | 51.51%  | Moyenne  |
| `screens/SettingsScreen.tsx`      | 81.57%  | Basse    |
| `components/SessionItem.tsx`      | 22.22%  | Haute    |
| `components/ProgramSection.tsx`   | 57.14%  | Moyenne  |
| `services/sentry.ts`              | 36.84%  | Basse    |

---

### Recommandations

1. **Priorité haute** : Tester les modèles WatermelonDB (`model/models/`) — aucune couverture sur les classes de données centrales.
2. **Priorité haute** : `WorkoutScreen.tsx` et `SessionDetailScreen.tsx` — écrans coeur de l'app, 0% couvert.
3. **Priorité moyenne** : `SetItem.tsx`, `SessionExerciseItem.tsx`, `WorkoutExerciseCard.tsx` — composants UI actifs dans le workflow principal.
4. **Priorité basse** : AI providers (`claudeProvider`, `geminiProvider`, `openaiProvider`) — dépendent d'APIs externes, mocking requis.
