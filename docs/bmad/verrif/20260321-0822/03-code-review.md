# Passe 3/8 — Code Review

## Issues trouvees

### 🔴 CRITICAL

| # | Fichier | Ligne | Probleme | Fix |
|---|---------|-------|----------|-----|
| 1 | `model/utils/dataManagementUtils.ts` | 23-35 | Reads inside `database.write()` — deadlock WatermelonDB | Deplace reads avant write() |
| 2 | `model/utils/dataManagementUtils.ts` | 54-79 | Reset incomplet — friendCode, wearable* non reinitialises | Ajoute les 4 champs manquants |

### 🟡 WARNING

| # | Fichier | Ligne | Probleme | Recommandation |
|---|---------|-------|----------|----------------|
| 1 | `screens/StatsDurationScreen.tsx` | 148,190,197,201,203 | 5x `as any` sur records WDB | Typer via generics `database.get<T>()` |
| 2 | `screens/ExerciseCatalogScreen.tsx` | 336-361 | `loadMore` AbortController jamais aborte sur unmount | Stocker dans ref + abort dans cleanup |
| 3 | `screens/WorkoutScreen.tsx` | 270 | Resume workout : race condition si sessionExercises pas encore disponible | Deplacer logique dans useEffect avec deps |

### 🔵 SUGGESTION

| # | Fichier | Probleme |
|---|---------|----------|
| 1 | `screens/ExerciseCatalogScreen.tsx:289` | State `_hasMore` inutile — seul `hasMoreRef` est consulte |
| 2 | `screens/ProgramDetailScreen.tsx:58` | `alertConfig` initial recree a chaque render |
| 3 | 5+ ecrans | FlatLists sans `getItemLayout` pour items a hauteur fixe |

## Points positifs

- 0 `<Modal>` natif — Portal pattern partout
- Mutations DB toutes dans `database.write()`
- `useHaptics/useColors/useLanguage` systematiques
- console.log gardes par `__DEV__` partout
- Theme centralise, pas de couleurs hardcodees

## Verdict : 2 CRITICAL + 3 WARNING + 3 SUGGESTION
