# Passe 7/8 — Corrections — 20260222-1519

## 7a — Critiques 🔴 (corrigés)

### FIX-1 — StatsScreen: useMemo pour KPIs et phrase d'accroche
**Fichier:** `StatsScreen.tsx:1,75-76`
**Avant:** `computeGlobalKPIs()` et `computeMotivationalPhrase()` appelés directement dans le render
**Après:** Wrappés dans `useMemo(…, [histories, sets])`

### FIX-2 — StatsVolumeScreen: guard all-zero BarChart
**Fichier:** `StatsVolumeScreen.tsx:61-106`
**Avant:** BarChart rendu même quand tous les volumes sont 0 (crash potentiel division par zéro)
**Après:** `hasChartData` check + fallback empty state

### FIX-3 — Exercise.deleteAllAssociatedData: inclure sets + déplacer fetches dans write()
**Fichier:** `Exercise.ts:57-83`
**Avant:** Ne supprimait PAS les sets orphelins + fetches hors du write() (race condition)
**Après:** Supprime session_exercises + performance_logs + sets + exercise, tout dans database.write()

### FIX-4 — Filtre deleted_at sur histories (3 écrans stats)
**Fichiers:** `StatsVolumeScreen.tsx`, `StatsRepartitionScreen.tsx`, `StatsExercisesScreen.tsx`
**Avant:** `database.get('histories').query().observe()` — charge les soft-deleted
**Après:** `database.get('histories').query(Q.where('deleted_at', null)).observe()`

## 7b — Warnings 🟡 (corrigés)

### FIX-5 — Imports inutilisés supprimés
- `navigation/index.tsx:2` — Supprimé `useState` de l'import
- `screens/ExercisesScreen.tsx:1` — Supprimé `useMemo` de l'import

## 7c — Suggestions 🔵 (non corrigées)

Les suggestions suivantes n'ont PAS été corrigées car elles sont des améliorations de style/DRY qui ne sont pas critiques et touchent beaucoup de fichiers :
- Extraire `chartConfig` dans un fichier partagé (4 fichiers)
- Extraire `labelToPeriod` / `PERIOD_LABELS` dans statsHelpers (2 fichiers)
- Migrer les couleurs hardcodées INTENSITY_COLORS dans le thème
- Utiliser `useWindowDimensions()` au lieu de `Dimensions.get()` statique
- Migrer les valeurs numériques hardcodées des écrans legacy (ChartsScreen, HomeScreen, ExercisesScreen)
- Exporter et réutiliser `toDateKey()` depuis statsHelpers

## Vérification post-corrections
- `npx tsc --noEmit` : ✅ 0 erreur
- `npm test` : ✅ 789 passed, 0 failed
- Aucune régression
