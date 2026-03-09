# Passe 7/8 — Corrections

## 7a — Critiques 🔴 (1 corrigé, 1 faux positif)

### ✅ C1 — AssistantPreviewScreen `isSaving` bloqué sur succès
- **Fichier:** `screens/AssistantPreviewScreen.tsx:54-57`
- **Problème:** `setIsSaving(false)` uniquement dans `catch`. Sur succès ou early return (ligne 50), le bouton reste bloqué.
- **Fix:** Remplacé `catch { setIsSaving(false) }` par `finally { setIsSaving(false) }`.

### ❌ C2 — useExerciseManager deleteExercise hors write() → FAUX POSITIF
- **Fichier:** `hooks/useExerciseManager.ts:118-127`
- **Analyse:** `deleteAllAssociatedData()` dans `Exercise.ts` wrappe déjà dans `this.database.write()` (ligne 69). Pas de bug.

## 7b — Warnings 🟡 (3 corrigés)

### ✅ W1 — WorkoutScreen handleClose missing dep
- **Fichier:** `screens/WorkoutScreen.tsx:215`
- **Fix:** Ajouté `summaryModal` au tableau de dépendances de `useCallback`.

### ✅ W2 — useWorkoutCompletion unsafe SQL cast
- **Fichier:** `hooks/useWorkoutCompletion.ts:156`
- **Fix:** Remplacé `as Record<string, number>` par `as Record<string, unknown>` avec validation `typeof` runtime.

### ✅ W3 — HeatmapCalendar i18n hardcodé
- **Fichier:** `components/HeatmapCalendar.tsx:12-15, 129, 136`
- **Fix:** Ajouté clés `heatmap.monthLabels`, `heatmap.less`, `heatmap.more` dans fr.ts/en.ts. Composant utilise `useLanguage()` et passe les labels localisés.
- **Test:** Mis à jour `HeatmapCalendar.test.tsx` pour 'Fév' (accent correct).

## 7c — Suggestions 🔵 (1 corrigée)

### ✅ S1 — Dead exports dans theme/index.ts
- **Fichier:** `theme/index.ts:108, 110, 250-261`
- **Fix:** Supprimé `export const intensityColors` standalone (doublon de `colors.intensityColors`). Supprimé `export const neuShadowParams` (jamais importé). Déplacé `import { Platform }` en tête de fichier.

## Vérification post-corrections

- TypeScript : ✅ `npx tsc --noEmit` — 0 erreur
- Tests : ✅ 1737 passed, 0 failed, 112 suites
