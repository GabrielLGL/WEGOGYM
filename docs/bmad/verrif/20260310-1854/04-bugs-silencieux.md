# Passe 4/8 — Bugs Silencieux

**Date :** 2026-03-10 18:54

## Résumé : 0 CRIT, 1 WARN, 1 SUGG

### Points positifs ✅
- Tous les `database.write()` corrects
- Zéro `any` en production
- Tous les `console.*` gardés par `__DEV__`
- Tous les timers ont cleanup
- Pas de `.subscribe()` manuels
- Schema-model sync OK
- Données sensibles via `expo-secure-store`
- Handlers async avec try/catch
- Known pitfalls non réintroduits

### 🟡 B-1 — `recalculateSetPrsBatch` : pas de déduplication des exerciseIds
**Fichier :** `model/utils/workoutSetUtils.ts:193`
Si le même `exerciseId` est passé deux fois, les recalculs concurrents pourraient lire des données stale.
**Fix :** `const uniqueIds = [...new Set(exerciseIds)]`

### 🔵 B-2 — `deleteAllData` ne reset pas `disclaimerAccepted`/`cguVersionAccepted`
**Fichier :** `model/utils/dataManagementUtils.ts:49-73`
Après un wipe complet, l'utilisateur ne repasse pas par l'écran disclaimer/CGU.
