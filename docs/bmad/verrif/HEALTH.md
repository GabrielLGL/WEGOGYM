# HEALTH.md — Score de santé Kore

## Système de notation (0-100)

| Dimension  | Poids | Critères |
|------------|-------|----------|
| Build      | 20    | TypeScript sans erreur, `npx tsc --noEmit` OK |
| Tests      | 20    | Toutes les suites passent, 0 fail |
| Bugs       | 20    | Verrif SCAN-4 (bugs silencieux) OK |
| Qualité    | 20    | Verrif SCAN-6 (code mort, qualité) OK |
| Coverage   | 20    | Barème : <20%=0 · 20-40%=5 · 40-60%=10 · 60-80%=15 · >80%=20 |

---

## Historique des scores

| Date | Build | Tests | Bugs | Qualité | Coverage | **Total** | Tendance |
|------|-------|-------|------|---------|----------|-----------|----------|
| 2026-02-19 | 20 | 20 | 20 | 20 | 10 | **90/100** | — |
| 2026-02-19 | 20 | 20 | 20 | 20 | 15 | **95/100** | ↑ +5 |
| 2026-02-19 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable |
| 2026-02-19 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (638 tests) |
| 2026-02-20 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (642 tests, cov 68.21%) |
| 2026-02-20 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (674 tests, cov 71.11%) |
| 2026-02-21 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (773 tests, cov 78.93%) |
| 2026-02-22 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (789 tests, cov 64.42%) |
| 2026-02-22 | 20 | 20 | 20 | 18 | 15 | **93/100** | ↓ -2 (840 tests, cov 65.84%, 3 critiques fixés) |
| 2026-02-23 | 20 | 20 | 20 | 18 | 15 | **93/100** | → stable (847 tests, cov 65.48%, 2 critiques fixés) |
| 2026-02-26 | 20 | 20 | 20 | 20 | 15 | **95/100** | ↑ +2 (1186 tests, exit 0, Jest teardown ReferenceError fixés) |
| 2026-02-26 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1206 tests, handleSkipOnboarding try/catch fixé) |
| 2026-02-26 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1257 tests, spacing.xxl token ChartsScreen) |
| 2026-02-26 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1257 tests, chartConfig couleurs hardcodées fixées) |
| 2026-02-27 | 20 | 20 | 18 | 20 | 15 | **93/100** | ↓ -2 (1275 tests, RestTimer anim fix, email validation, B1-B7 async sans try/catch restants) |
| 2026-02-28 | 20 | 20 | 20 | 18 | 15 | **93/100** | → stable (1559 tests, cov 80.71% lines, 3 critiques fixés, 23 hardcoded values restantes) |
| 2026-02-28 | 20 | 20 | 20 | 20 | 15 | **95/100** | ↑ +2 (1559 tests, cov 80.61% lines, hardcoded→tokens fixé, LanguageContext rollback, MilestoneCelebration any fixé) |
| 2026-03-06 | 20 | 20 | 18 | 20 | 15 | **93/100** | ↓ -2 (1571 tests, duplicate() setsTargetMax fixé, StatsCalendar try/catch, 30 i18n strings + WorkoutScreen perf restants) |
| 2026-03-06 | 20 | 20 | 20 | 20 | 15 | **95/100** | ↑ +2 (1571 tests, 8 critiques fixés: race condition, cleanup, _raw, useCallback, useWindowDimensions) |
| 2026-03-06 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1558 tests, C1 motivationalPhrase language fixé, @text decorators) |
| 2026-03-07 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1558 tests, 2 CRIT + 5 WARN fixés: i18n WorkoutExerciseCard, soft-delete filter, double observe, dialog stuck, formatWeight) |
| 2026-03-07 | 20 | 20 | 20 | 20 | 15 | **95/100** | → stable (1687 tests, cov 79.3%, TSC isPr fix + OnboardingSheet i18n) |

---

## Détail — 2026-02-19 (session Gemini 15:40)

**Score : 95/100**

| Dimension | Score | Détail |
|-----------|-------|--------|
| Build     | 20/20 | ✅ `npx tsc --noEmit` — 0 erreur |
| Tests     | 20/20 | ✅ 638 tests, 0 fail |
| Bugs      | 20/20 | ✅ SCAN-4 bugs silencieux — OK |
| Qualité   | 20/20 | ✅ SCAN-6 code mort/qualité — OK |
| Coverage  | 15/20 | 📊 60.88% lignes (seuil 60-80% atteint) |

### Coverage détaillée (après P6)
| Métrique   | Score  |
|------------|--------|
| Statements | 59.74% |
| Branches   | 53.44% |
| Functions  | 52.35% |
| Lines      | 60.88% |

### Nouveaux tests créés (P6)
- `src/services/ai/__tests__/offlineEngine.test.ts` — 27 tests (logique pure)
- `src/services/ai/__tests__/providerUtils.test.ts` — 22 tests (buildPrompt + parseGeneratedPlan)
- `src/model/__tests__/constants.test.ts` — 8 tests (MUSCLES_LIST, EQUIPMENT_LIST)
- `src/model/__tests__/seed.test.ts` — 8 tests (BASIC_EXERCISES)
- `src/screens/__tests__/ExercisesScreen.test.tsx` — 10 tests (ExercisesContent)
- `src/screens/__tests__/HomeScreen.test.tsx` — 9 tests (HomeContent)

### Exports ajoutés pour testabilité
- `ExercisesScreen.tsx` : `export { ExercisesContent }`
- `HomeScreen.tsx` : `export { HomeScreen as HomeContent }`

### Prochains objectifs pour augmenter le score
- Coverage 80% (+5 pts) → tests screens complexes (SessionDetailScreen, WorkoutScreen)
- Tests E2E Detox pour les flows critiques
| 20260219-2149 | 48 | 20 | 0 | 10 | 5 | 13 | full |
| 20260219-2149 | 48 | 20 | 0 | 10 | 5 | 13 | full |
| 20260220-0733 | 44 | 20 | 0 | 10 | 0 | 14 | full |
| 20260220-1423 | 43 | 20 | 0 | 10 | 0 | 13 | full |
| 20260220-1423 | 43 | 20 | 0 | 10 | 0 | 13 | full |
| 20260220-2010 | 43 | 20 | 0 | 10 | 0 | 13 | full |
| 20260220-2010 | 71 | 20 | 20 | 17 | 0 | 14 | full |
| 20260221-0223 | 90 | 20 | 20 | 20 | 15 | 15 | full |
| 20260221-0223 | 83 | 20 | 20 | 13 | 15 | 15 | full |
| 20260307-0242 | 93 | 20 | 20 | 20 | 17 | 16 | full |
| 20260307-0242 | 95 | 20 | 20 | 20 | 20 | 15 | full |
| 20260307-2224 | 95 | 20 | 20 | 20 | 20 | 15 | full |
