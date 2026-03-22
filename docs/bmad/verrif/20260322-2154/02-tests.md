# Passe 2/8 — Tests

**Date :** 2026-03-22
**Commande :** `npx jest --maxWorkers=2 --forceExit`

## Résultat

- **Test Suites :** 155 passed, 1 failed, 156 total
- **Tests :** 2036 passed, 2036 total

## Suites en échec

### 🔴 HistoryDetailScreen.test.tsx — OOM (infinite re-render)

**Cause :** Le mock `__mocks__/UnitContextMock.ts` crée une nouvelle référence `convertWeight` à chaque appel de `useUnits()`. Le `useEffect` de `HistoryDetailScreen.tsx:88` dépend de `convertWeight`, ce qui crée une boucle infinie :
1. Render → `useUnits()` retourne nouveau `convertWeight`
2. `useEffect` se déclenche (dep changée)
3. `setEdits()` → re-render → retour au step 1

**Fix :** Extraire les fonctions du mock en constantes stables (hors de `useUnits()`).

## Fichiers/fonctions critiques sans test

Couverture non mesurable dans ce run (OOM empêche `--coverage`). Dernière mesure connue : ~74.9% (run 20260321).
