# 04 — Bugs silencieux

**Run:** 2026-03-10 23:57
**Résultat:** 0 critique, 3 moyennes, 1 mineure

## Pitfalls vérifiés (CLAUDE.md §3.1)
| Pitfall | Statut |
|---------|--------|
| Mutations hors database.write() | ✅ Conforme |
| setTimeout/setInterval sans cleanup | ✅ Conforme |
| subscribe/observe sans cleanup | ✅ Conforme |
| Schema ↔ Model mismatch | ✅ Conforme |
| `any` en TypeScript | ✅ Conforme |
| console.log sans __DEV__ | ✅ Conforme |
| Modal natif | ✅ Conforme |
| AbortSignal.timeout() | ✅ Conforme |
| Données sensibles en SQLite | ✅ Conforme |

## Issues détectées

### 🟡 Moyennes
1. **SessionDetailScreen:129,144** — `handleCreateGroup`/`handleUngroup` sans `useCallback`, invalide la memoisation de `renderDraggableItem` du DraggableFlatList.
2. **StatsMeasurementsScreen:36-42** — Unités `'kg'`/`'cm'` hardcodées non i18n.
3. **SessionExercise + PerformanceLog** — Pas de champ FK brut `@field('exercise_id')` déclaré. Force l'utilisation de `Relation.id` (indirection).

### 🔵 Mineures
4. **SessionDetailScreen:123,172** — `cancelSelection`/`handleAddExercise` sans `useCallback` (incohérence).

## Score : 18/20
