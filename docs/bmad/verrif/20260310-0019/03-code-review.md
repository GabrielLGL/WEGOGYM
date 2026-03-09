# Passe 3/8 — Code Review

**Date :** 2026-03-10 00:19

## Points conformes
- Aucun `<Modal>` natif — tout passe par Portal + AlertDialog/BottomSheet
- `withObservables` HOC partout pour les données réactives DB
- Toutes les mutations DB dans `database.write()`
- `useHaptics()` partout pour le feedback tactile
- setTimeout/setInterval avec cleanup
- Clés API via `secureKeyStore.ts` (expo-secure-store)
- Thème centralisé — pas de couleurs en dur

## Violations

| # | Sévérité | Fichier | Ligne | Problème |
|---|----------|---------|-------|----------|
| 1 | 🟡 WARN | SettingsScreen.tsx | 45-62 | 8 champs useState re-synchronisés via useEffect alors que `user` est réactif via withObservables. Risque de désync. |
| 2 | 🟡 WARN | useWorkoutCompletion.test.ts | 86-333 | 10 occurrences de `let output: any` dans les tests |
| 3 | 🟡 WARN | HomeScreen.tsx | 200 | Cast `as never` pour navigation — contourne le type-safety |
| 4 | 🟡 WARN | ExerciseCatalogScreen.tsx | 148 | Query utilisateur non échappée dans filtre PostgREST ilike |
| 5 | 🟡 WARN | ProgramsScreen.tsx | 296 | Handler inline trop long (3 opérations chaînées) |
| 6 | 🔵 SUGG | WorkoutSummarySheet.tsx | 44 | `createStyles(colors)` sans useMemo dans StatBlock |
| 7 | 🔵 SUGG | exerciseCatalog.ts | 16 | Pas de guard si SUPABASE_URL est vide |
| 8 | 🔵 SUGG | sentry.ts | 21 | Style guards __DEV__ inconsistant |

## Bilan
- 🔴 CRIT : 0
- 🟡 WARN : 5
- 🔵 SUGG : 3
