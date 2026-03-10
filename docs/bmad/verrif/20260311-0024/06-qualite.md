# 06 — Qualité

**Run:** 2026-03-11 00:24

## Violations détectées

### 🟡 Moyennes
1. **HistoryDetailScreen:414** — `kg` hardcodé → `t.statsMeasurements.weightUnit`
2. **ExerciseHistoryScreen:110,129,169** — 3x `kg` hardcodé
3. **HomeScreen:330** — `kg` hardcodé dans résumé
4. **ChartsScreen:145** — useCallback deps manquantes (`t`, `alertModal`)
5. **ChartsScreen:77** — `toLocaleDateString([])` locale vide au lieu de dateLocale
6. **i18n fr.ts:847, 874** — templates `charts.setDetail`, `statsExercises.prValue` contiennent `kg` hardcodé dans les strings i18n

### 🔵 Mineures
7. **StatsCalendarScreen:379** — `kg` hardcodé dans detail sets

## Score : 17/20
