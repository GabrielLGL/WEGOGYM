# 04 — Bugs silencieux

**Run:** 2026-03-11 00:24

## Pitfalls vérifiés (CLAUDE.md §3.1) — Tous conformes ✅

## Issues détectées

### 🟡 Moyennes
1. **SessionDetailScreen:186** — `handleUpdateTargets` non memoisé avec `useCallback` (inconsistance)
2. **SessionDetailScreen:83,197-206** — `alertConfig.onConfirm` callback dans useState → risque closure stale. Pattern recommandé : stocker la cible (SessionExercise) dans un state, pas le callback.
3. **ChartsScreen:145** — `renderSessionItem` useCallback manque `t` et `alertModal` dans ses deps → closure stale sur changement de langue

### 🔵 Mineures
4. **sentry.ts:21** — console.log gardé par condition parente `__DEV__ && !SENTRY_DSN`, techniquement sûr mais inconsistant

## Score : 18/20
