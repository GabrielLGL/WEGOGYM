# Tests — 2026-02-19

## Résultat : ✅ 120 passed / 🔴 0 failed / ⏭️ 0 skipped

**9 suites, toutes PASS** — Durée : ~24 min (Jest cold-start + WatermelonDB mock)

| Suite | Fichier | Tests |
|-------|---------|-------|
| useModalState + useMultiModalSync | `hooks/__tests__/useModalState.test.ts` | 15 |
| useHaptics | `hooks/__tests__/useHaptics.test.ts` | 8 |
| validationHelpers | `model/utils/__tests__/validationHelpers.test.ts` | 21 |
| notificationService | `services/__tests__/notificationService.test.ts` | 7 |
| Button | `components/__tests__/Button.test.tsx` | 12 |
| AlertDialog | `components/__tests__/AlertDialog.test.tsx` | 11 |
| OnboardingSheet | `components/__tests__/OnboardingSheet.test.tsx` | 6 |
| databaseHelpers | `model/utils/__tests__/databaseHelpers.test.ts` | inclus |
| SettingsScreen | `screens/__tests__/SettingsScreen.test.tsx` | 3 |

### Tests en échec
Aucun.

### Warnings (non-bloquants)
| Type | Fichier | Description |
|------|---------|-------------|
| `act(...)` warning | `AlertDialog.test.tsx` | Animations RN (`Animated.View`) déclenchent des state updates hors `act()`. Cosmétique, non bloquant. |

---

## Fichiers critiques sans tests

### Hooks (logique métier — priorité haute)
- `hooks/useExerciseManager.ts` — gestion CRUD exercices (0%)
- `hooks/useSessionManager.ts` — gestion des séances (0%)
- `hooks/useProgramManager.ts` — gestion des programmes (0%)
- `hooks/useWorkoutState.ts` — état en temps réel du workout (0%)
- `hooks/useWorkoutTimer.ts` — timer de repos (0%)
- `hooks/useKeyboardAnimation.ts` — animation clavier (0%)
- `hooks/useExerciseFilters.ts` — filtres exercices (0% stmts, 100% branch)

### Composants UI (priorité moyenne)
- `components/BottomSheet.tsx` — bottom sheet global (0%)
- `components/ChipSelector.tsx` — filtres chips (0%)
- `components/ExercisePickerModal.tsx` — sélection exercice (0%)
- `components/RestTimer.tsx` — timer de repos (0%)
- `components/SessionExerciseItem.tsx` — item exercice en séance (0%)
- `components/WorkoutExerciseCard.tsx` — carte exercice workout (0%)
- `components/WorkoutSummarySheet.tsx` — résumé fin workout (0%)
- `components/SetItem.tsx` — item série (0% stmts/funcs)
- `components/ProgramSection.tsx`, `SessionItem.tsx`, `ErrorBoundary.tsx`, `CustomModal.tsx` (0%)

### Écrans (priorité haute)
- `screens/HomeScreen.tsx` — écran principal (0%)
- `screens/WorkoutScreen.tsx` — workout en cours (0%)
- `screens/ExercisesScreen.tsx` — bibliothèque exercices (0%)
- `screens/ChartsScreen.tsx` — statistiques (0%)
- `screens/SessionDetailScreen.tsx` — détail séance (0%)
- `screens/AssistantScreen.tsx` — assistant IA (0%)

### Modèles WatermelonDB (priorité moyenne)
- `model/models/Exercise.ts` (0%)
- `model/models/Program.ts` (0%)
- `model/models/History.ts`, `Session.ts`, `SessionExercise.ts`, `Set.ts`, `User.ts`, `PerformanceLog.ts` (0% statements)

### Services (priorité haute)
- `services/ai/aiService.ts` — service IA principal (0%)
- `services/ai/claudeProvider.ts`, `geminiProvider.ts`, `openaiProvider.ts` (0%)
- `services/ai/offlineEngine.ts` (0%)
- `services/ai/providerUtils.ts` (0%)
- `services/sentry.ts` (0%)

### Utils partiellement couverts
- `model/utils/databaseHelpers.ts` — 38.19% stmts, 60.65% branch — lignes 142-312 et 521-666 non couvertes

---

## Couverture globale

| Métrique | Valeur |
|----------|--------|
| Statements | **12.95%** |
| Branches | **16.36%** |
| Functions | **13.60%** |
| Lines | **13.34%** |

### Couverture par zone

| Zone | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| `components/` | 15.17% | 16.82% | 11.7% | 16.12% |
| `hooks/` | 6.57% | 4.9% | 20.45% | 5.58% |
| `model/` | 3.84% | 0% | 0% | 3.84% |
| `model/utils/` | 43.33% | 65.68% | 41.97% | 45.53% |
| `screens/` | 4.15% | 8.8% | 1.45% | 4.48% |
| `services/` | 47.82% | 23.52% | 62.5% | 53.84% |
| `services/ai/` | 0% | 0% | 0% | 0% |

### Fichiers à 100%
- `components/AlertDialog.tsx`
- `hooks/useHaptics.ts`
- `hooks/useModalState.ts`
- `model/onboardingPrograms.ts`
- `services/notificationService.ts` (95.45% lines)
- `components/OnboardingSheet.tsx` (90.47% stmts)

---

## Recommandations prioritaires

1. **Hooks métier** — `useWorkoutState`, `useSessionManager`, `useProgramManager`, `useExerciseManager` : logique critique, 0% couverture.
2. **`databaseHelpers.ts`** — lignes 142-312 (mutations DB) et 521-666 non testées : risque élevé.
3. **`aiService.ts` + providers** — aucun test sur la couche IA.
4. **Écrans principaux** — `HomeScreen`, `WorkoutScreen` : flux utilisateur non couverts.
5. **Warnings `act()`** dans `AlertDialog.test.tsx` — à corriger pour éviter les faux positifs futurs.
