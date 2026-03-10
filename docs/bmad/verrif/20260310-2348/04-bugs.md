# 04 — Bugs

**Run:** 2026-03-10 23:48
**Résultat:** ✅ 0 critique, 0 haute, 2 moyennes, 2 faibles

## Pitfalls vérifiés (CLAUDE.md §3.1)
| Pitfall | Statut |
|---------|--------|
| Mutations hors `database.write()` | ✅ Conforme |
| setTimeout/setInterval sans cleanup | ✅ Conforme |
| subscribe/observe sans cleanup | ✅ Conforme (withObservables partout) |
| Schema ↔ Model mismatch | ✅ Conforme (10 tables, 80+ colonnes sync) |
| `any` en TypeScript | ✅ Conforme (0 any) |
| console.log sans `__DEV__` | ✅ Conforme |
| `<Modal>` natif | ✅ Conforme (0 usage) |
| `AbortSignal.timeout()` | ✅ Conforme (withTimeout utilisé) |
| Données sensibles en SQLite | ✅ Conforme (expo-secure-store) |

## Issues détectées

### 🟡 Moyennes
1. **AnimatedSplash.tsx:20-21** — Couleurs hardcodées `#181b21` et `#00cec9`. Cas légitime (hors ThemeProvider) mais devrait extraire en constantes dans theme.
2. **workoutSetUtils.ts:33** — `as Record<string, unknown>` sur `unsafeFetchRaw()`. Vérifié par type guard ensuite. Acceptable.

### 🔵 Faibles
3-4. Couleurs hardcodées `#1C1C1E` dans les mocks de test (StatsDurationScreen.test.tsx, StatsMeasurementsScreen.test.tsx)

## Score : 19/20
