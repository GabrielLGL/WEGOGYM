# Passe 3/8 — Code Review — 20260222-1519

## Issue #1 — 🔴 Critical — KPIs + phrase d'accroche sans `useMemo`
**File:** `StatsScreen.tsx:75-76`
**Catégorie:** Performance
**Description:** `computeGlobalKPIs()` et `computeMotivationalPhrase()` sont appelés dans le render body sans `useMemo`. Ces fonctions itèrent sur toutes les histories et sets, calculant des sommes, filtrant, triant. Chaque re-render recalcule tout.
**Fix:** Wrapper dans `useMemo(…, [histories, sets])`

## Issue #2 — 🔴 Critical — Full `sets` table chargée sans filtre
**File:** `StatsScreen.tsx:209`, `StatsVolumeScreen.tsx:208`, `StatsRepartitionScreen.tsx:165`, `StatsExercisesScreen.tsx:192`
**Catégorie:** WatermelonDB
**Description:** La query observe TOUS les sets sans filtre. La table grossit au fil du temps. Les helpers filtrent côté JS mais toute la table est chargée en mémoire.
**Fix:** Acceptable pour small-to-medium datasets. La complexité d'un filtre WatermelonDB (pas de JOIN natif) ne justifie pas le changement. Documenter la contrainte.

## Issue #3 — 🟡 Warning — Couleurs hardcodées dans StatsCalendarScreen
**File:** `StatsCalendarScreen.tsx:28`
**Catégorie:** Architecture
**Description:** `INTENSITY_COLORS` utilise des hex hardcodés (`#1E4D2B`, `#2D7A47`) non définis dans le thème.
**Fix:** Ajouter les couleurs dans `theme/index.ts` et les référencer.

## Issue #4 — 🟡 Warning — `fontSize: 32` hardcodé
**File:** `StatsVolumeScreen.tsx:150`
**Catégorie:** Architecture
**Description:** `fontSize: 32` ne correspond à aucun token du thème.
**Fix:** Utiliser `fontSize.xxxl` (28) ou ajouter un token.

## Issue #5 — 🟡 Warning — `labelToPeriod` + `PERIOD_LABELS` dupliqués
**File:** `StatsVolumeScreen.tsx:40-44`, `StatsRepartitionScreen.tsx:24-28`
**Catégorie:** DRY
**Description:** Fonction et constante identiques copiées dans 2 écrans.
**Fix:** Déplacer dans `statsHelpers.ts`.

## Issue #6 — 🟡 Warning — `chartConfig` / `PRIMARY_RGB` / `TEXT_RGB` dupliqués
**File:** `StatsDurationScreen.tsx:19-31`, `StatsVolumeScreen.tsx:25-36`, `StatsMeasurementsScreen.tsx:30-42`, `ChartsScreen.tsx`
**Catégorie:** DRY
**Description:** Configuration chart-kit identique copiée dans 4 fichiers.
**Fix:** Créer `theme/chartConfig.ts` partagé.

## Issue #7 — 🟡 Warning — `Dimensions.get('window').width` capturé au load
**File:** `StatsDurationScreen.tsx:18`, `StatsVolumeScreen.tsx:24`, `StatsMeasurementsScreen.tsx:29`
**Catégorie:** Performance/UX
**Description:** Largeur figée au premier chargement, pas mise à jour à la rotation.
**Fix:** Utiliser `useWindowDimensions()` hook dans le composant.

## Issue #8 — 🔵 Suggestion — API key en clair dans SQLite
**File:** `User.ts:23`, `schema.ts:69`
**Catégorie:** Sécurité
**Description:** `ai_api_key` stocké en plaintext dans WatermelonDB (accessible sur device rooté).
**Fix:** Utiliser `expo-secure-store` quand la feature cloud sera implémentée.

## Issue #9 — 🔵 Suggestion — Filtrage soft-delete incohérent
**File:** `StatsScreen.tsx:208` vs helpers
**Catégorie:** Performance
**Description:** StatsScreen filtre avec `Q.where('deleted_at', null)` mais les helpers refiltrent en JS. StatsVolumeScreen/RepartitionScreen/ExercisesScreen ne filtrent PAS dans la query. Incohérence.
**Fix:** Filtrer systématiquement au niveau query (`Q.where('deleted_at', null)`) + retirer le filtre redondant des helpers.

## Résumé

| # | Sévérité | Issue |
|---|----------|-------|
| 1 | 🔴 | KPIs sans useMemo |
| 2 | 🔴 | Sets table non filtrée (acceptable, documenter) |
| 3 | 🟡 | Couleurs hardcodées calendrier |
| 4 | 🟡 | fontSize:32 hardcodé |
| 5 | 🟡 | labelToPeriod dupliqué |
| 6 | 🟡 | chartConfig dupliqué |
| 7 | 🟡 | Dimensions statique |
| 8 | 🔵 | API key plaintext |
| 9 | 🔵 | Filtrage soft-delete incohérent |
