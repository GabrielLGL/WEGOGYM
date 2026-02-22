# Passe 4/8 — Bugs silencieux — 20260222-1519

## 🔴 Critiques

### BUG-1 — BarChart crash all-zero dataset
**File:** `StatsVolumeScreen.tsx:62-63`
**Description:** Quand `stats.perWeek` a tous les volumes à 0, `react-native-chart-kit` BarChart peut crasher (division par zéro). Pas de guard.
**Fix:** Ajouter `if (stats.perWeek.every(w => w.volume === 0)) return null` ou utiliser `Math.max(w.volume, 0.001)`.

### BUG-2 — Exercise.deleteAllAssociatedData() ne supprime pas les sets
**File:** `Exercise.ts:57-83`
**Description:** Quand un exercice est supprimé, ses `sets` restent orphelins dans la DB. Ces sets apparaissent dans les calculs stats (volume, PRs), polluant les données.
**Fix:** Ajouter la query et suppression des sets associés dans le batch destroy.

### BUG-3 — WorkoutScreen createWorkoutHistory sans cancellation
**File:** `WorkoutScreen.tsx:98-111`
**Description:** Si l'utilisateur navigue rapidement avant que la promesse resolve, un History sans `end_time` est créé et reste dangling dans la DB. Pollue les stats.
**Fix:** Ajouter `let cancelled = false` pattern. Note: ce bug préexiste à la feature stats-dashboard.

## 🟡 Warnings

### BUG-4 — handleSkipOnboarding sans try/catch
**File:** `HomeScreen.tsx:146-149`
**Description:** `markOnboardingCompleted()` peut échouer silencieusement.
**Fix:** Wrapper dans try/catch.

### BUG-5 — cancelNotification sans try/catch
**File:** `notificationService.ts:62-66`
**Description:** Erreurs propagées aux callers qui ne les catchent pas.
**Fix:** Ajouter try/catch.

### BUG-6 — handleClose sans await sur updateHistoryNote
**File:** `WorkoutSummarySheet.tsx:63-71`
**Description:** La note peut ne pas être sauvegardée avant la navigation.
**Fix:** Ajouter `await` avant `onClose()`.

### BUG-7 — Histories sans filtre deleted_at dans 3 écrans stats
**File:** `StatsVolumeScreen.tsx:210`, `StatsRepartitionScreen.tsx:167`, `StatsExercisesScreen.tsx:194`
**Description:** Histories soft-deleted chargées inutilement (filtrées ensuite côté JS par les helpers).
**Fix:** Ajouter `Q.where('deleted_at', null)` dans la query withObservables.

## ✅ Catégories sans problème
- Mutations WatermelonDB hors `write()` : aucune trouvée ✅
- Fuites mémoire (setTimeout/subscribe) : pattern correct ✅
- Accès array non-vérifié : tous protégés avec `?? null` ou guard ✅
