# Passe 4/8 — Bugs silencieux

## Scan results

### Pattern 1: Async sans try/catch
| # | Fichier:ligne | Severity | Description |
|---|---------------|----------|-------------|
| 1 | `claudeProvider.ts:37` | WARNING | `response.json()` hors try/catch. Mitigé par fallback offline dans aiService.ts |
| 2 | `openaiProvider.ts:60` | WARNING | Même pattern. Mitigé par fallback offline |
| 3 | `exerciseStatsUtils.ts:221` | WARNING | `se.exercise.fetch()` sans try/catch local. Mitigé par try/catch dans useWorkoutCompletion.ts |

### Pattern 2: WDB mutations hors write()
**Aucun problème.** Toutes les mutations vérifées sont dans `database.write()`.

### Pattern 3: Null safety
| # | Fichier:ligne | Severity | Description |
|---|---------------|----------|-------------|
| 1 | `statsContext.ts:16` + 8 occurrences | WARNING | `h.deletedAt === null` (strict). WDB `@date` peut retourner `undefined` pour colonnes non définies. `== null` (loose) serait plus défensif. Affecte: statsKPIs.ts:19,29,95 · statsMuscle.ts:45,92 · statsVolume.ts:23,102,157 |

### Pattern 4: Memory leaks
**Aucun problème.** Tous setTimeout/setInterval ont un cleanup. Tous .subscribe()/.observe() sont gérés par withObservables.

### Pattern 5: Stale closures
**Aucun problème réel.** `useWorkoutCompletion` utilise un pattern ref intentionnel avec deps `[]`.

### Pattern 6: Race conditions
**Bien géré.** `isMountedRef.current` vérifié après chaque async dans useWorkoutCompletion.

## Résumé
- **0 CRITICAL**
- **5 WARNING** (tous faible-à-moyen, aucun crash runtime)
- **4 faux positifs écartés**
