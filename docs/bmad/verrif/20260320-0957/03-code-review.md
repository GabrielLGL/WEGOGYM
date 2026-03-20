# Passe 3/8 — Code Review

## Issues trouvées

### 🔴 CRITICAL

| # | Fichier | Ligne | Problème | Recommandation |
|---|---------|-------|----------|----------------|
| 1 | `components/WorkoutExerciseCard.tsx` | 66-67 | `localWeight`/`localReps` useState ne se resync pas quand `input` prop change. Les suggestions de progression ne se reflètent pas dans l'UI. | Ajouter useEffect de sync sur `input.weight` et `input.reps` |

### 🟡 WARNING

| # | Fichier | Ligne | Problème | Recommandation |
|---|---------|-------|----------|----------------|
| 1 | `screens/SessionDetailScreen.tsx` | 90-91 | Query histories sans filtre soft-delete `deleted_at === null` | Ajouter `Q.where('deleted_at', null)` |
| 2 | `model/utils/exportHelpers.ts` | 6-17 | TABLE_NAMES manque 3 tables (progress_photos, friend_snapshots, wearable_sync_logs) | Ajouter les tables manquantes |

### 🔵 SUGGESTION

| # | Catégorie | Observation |
|---|-----------|-------------|
| 1 | Architecture | `AnimatedSplash.tsx` utilise 2 couleurs hardcodées — acceptable car le splash s'affiche avant le chargement du thème |
| 2 | DRY | Les patterns alertConfig dans ProgramDetailScreen et ProgramsScreen sont identiques mais fonctionnels — pas de refactor nécessaire |

## Points positifs

- **0 usage de `any`** dans tout le codebase
- **Tous les console.log/warn/error** protégés par `__DEV__`
- **0 couleur hardcodée** dans le code de production (hors tests et splash)
- **Portal pattern** correctement utilisé partout (pas de `<Modal>` natif)
- **withObservables** correctement utilisé pour les données DB
- **Mutations WDB** toutes dans `database.write()`
- **useHaptics/useColors/useLanguage** hooks systématiquement utilisés

## Verdict : 1 CRITICAL + 2 WARNING — tous corrigés en passe 7
