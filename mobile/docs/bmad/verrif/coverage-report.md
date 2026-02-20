# Coverage Report — 2026-02-20

## Avant / Après

| Métrique   | Avant  | Après  | Delta  |
|------------|--------|--------|--------|
| Statements | 66.33% | 68.75% | +2.42% |
| Branches   | 57.63% | 60.61% | +2.98% |
| Functions  | 58.90% | 61.56% | +2.66% |
| Lines      | 68.14% | 70.47% | +2.33% |

**Tests : 642 → 664 (+22 nouveaux tests)**

---

## État avant ce run

> Note : La description initiale mentionnait 11.6% de couverture. Des sessions précédentes
> avaient déjà significativement amélioré la couverture (66.33% au démarrage de ce run).
> Les tests des hooks critiques (P1) et utils (P2) étaient déjà en place.

---

## Améliorations par fichier

### P1 — aiService.ts (60% → 98.33% statements, 100% functions)

| Fichier | Avant | Après |
|---------|-------|-------|
| `services/ai/aiService.ts` | 60% stmts / 48% branches / 28% functions | **98.3% / 90.4% / 100%** |

**Tests ajoutés** (12 nouveaux) dans `aiService.test.ts` :
- Couverture de `buildDBContext` : filtrage par équipement (`mappedEquipment.length > 0`)
- Couverture du filtre `muscleGroups` (branch `form.muscleGroups.length > 0`)
- Couverture des histories récentes (branch `recentHistoryIds.length > 0`)
- Couverture des exercices récents (branch `recentExerciseIds.length > 0`)
- Couverture de la construction des PRs depuis `performance_logs`
- Couverture des providers `openai` et `gemini` via `generatePlan`
- Couverture du fallback `offline` pour provider inconnu
- Tests des guards de `testProviderConnection` (apiKey vide, providerName vide)

### P2 — Program.ts (8% → 100%)

| Fichier | Avant | Après |
|---------|-------|-------|
| `model/models/Program.ts` | 8% stmts / 0% branches / 0% functions | **100% / 100% / 100%** |

**Tests ajoutés** (6 nouveaux) dans `models.test.ts` :
- `duplicate()` sans sessions (programme vide)
- `duplicate()` avec plusieurs sessions
- `duplicate()` avec exercices par session
- `duplicate()` avec `exercise.fetch()` retournant null (branche ignorée)
- Vérification du nom `[Nom] (Copie)` et de la position
- Vérification des champs copiés (`setsTarget`, `repsTarget`, `weightTarget`, `position`)

### P3 — sentry.ts (36.8% → 78.9% statements, 100% functions)

| Fichier | Avant | Après |
|---------|-------|-------|
| `services/sentry.ts` | 36.8% stmts / 31.8% branches / 66.6% functions | **78.9% / 68.2% / 100%** |

**Tests ajoutés** (4 nouveaux) dans `sentry.test.ts` :
- `initSentry()` avec `EXPO_PUBLIC_SENTRY_DSN` fourni → appel `Sentry.init()`
- Vérification des paramètres `Sentry.init` (environment, tracesSampleRate, debug)
- Test du callback `beforeSend` → retourne `null` en développement
- Utilisation de `jest.isolateModules()` pour recharger le module avec le DSN

---

## Tests ajoutés : 22 nouveaux tests dans 3 fichiers

| Fichier | Nouveaux tests |
|---------|---------------|
| `services/ai/__tests__/aiService.test.ts` | 12 |
| `model/models/__tests__/models.test.ts`   | 6  |
| `services/__tests__/sentry.test.ts`       | 4  |

---

## Fichiers restants sous 70% (non couverts ce run)

Ces fichiers nécessitent une navigation complète ou sont des HOC WatermelonDB :

| Fichier | Coverage |
|---------|----------|
| `components/AssistantPreviewSheet.tsx` | 0% (HOC + AI, complex) |
| `components/ExercisePickerModal.tsx` | 0% (HOC + navigation) |
| `components/SessionItem.tsx` | 0% (withObservables HOC) |
| `screens/AssistantScreen.tsx` | 0% (navigation complète) |
| `screens/ChartsScreen.tsx` | 0% (navigation complète) |
| `screens/HomeScreen.tsx` | 33.3% (navigation complète) |
