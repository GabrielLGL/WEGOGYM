# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-22

## Résultat

### 🔴 CRIT-1 — Boucle infinie useEffect (HistoryDetailScreen)
- **Cause racine :** Mock `UnitContextMock.ts` retourne des fonctions instables → useEffect dep change → setState → re-render → boucle infinie.
- **Impact :** OOM en test. Pas d'impact en production (UnitContext.useMemo stabilise les refs).
- **Fix :** Constantes stables extraites hors de `useUnits()` dans le mock.

## Scans effectués
- ✅ Async sans try/catch — Toutes les fonctions async critiques ont des try/catch
- ✅ Mutations WDB hors write() — Toutes les mutations sont dans database.write()
- ✅ Null safety — Pas de problème détecté
- ✅ Fuites mémoire — Tous les setTimeout/setInterval ont des cleanups
- ✅ Race conditions — Pas de setState après unmount détecté
