# 07 — Corrections

**Run:** 2026-03-11 00:24

## 7a — Critiques 🔴
Aucune correction critique nécessaire.

## 7b — Warnings 🟡 (8 corrections)

### 1-6. Unités `kg` hardcodées → i18n (6 fichiers)
- **HistoryDetailScreen:414** — `kg` → `t.statsMeasurements.weightUnit`
- **ExerciseHistoryScreen:110** — `kg × reps` → `t.statsMeasurements.weightUnit × t.workout.reps`
- **ExerciseHistoryScreen:129** — Y-axis `${val}kg` → `${val}${t.statsMeasurements.weightUnit}`
- **ExerciseHistoryScreen:169** — `${s.weight} kg` → `${s.weight} ${t.statsMeasurements.weightUnit}`
- **HomeScreen:330** — résumé hebdo `kg` → `t.statsMeasurements.weightUnit`
- **StatsCalendarScreen:379** — detail sets `kg` → `t.statsMeasurements.weightUnit`

### 7. SessionDetailScreen:186 — handleUpdateTargets
- **Avant:** `async () => {}` (non memoisé)
- **Après:** `useCallback(async () => {}, [updateTargets, editModal])`

### 8. ChartsScreen:145 — useCallback deps manquantes
- **Avant:** `[styles, colors, haptics, navigation]`
- **Après:** `[styles, colors, haptics, navigation, t, alertModal, setSelectedStat]`
- **Impact:** Élimine stale closure sur changement de langue et modal state

## 7c — Non corrigés (backlog)
- i18n templates fr.ts avec `kg` dans les strings (charts.setDetail, statsExercises.prValue) — nécessite refactor template avec placeholder `{unit}`
- ChartsScreen:77 locale vide `[]` — nécessite `dateLocale` pattern
- SessionDetailScreen alertConfig callback dans state — risque stale closure, refactor significatif

## Vérification post-fix
- TSC: ✅ 0 erreur
- Tests: ✅ 109 suites, 1694 tests — 100% pass
