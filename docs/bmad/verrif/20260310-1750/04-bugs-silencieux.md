# Passe 4/8 — Bugs silencieux

## Issues Found

### 🟡 WARN-1: OnboardingScreen `handleSelectLanguage` async sans try/catch
**Fichier:** `screens/OnboardingScreen.tsx:75-78`
**Problème:** `await setLanguage(lang)` sans try/catch. Si DB write échoue → unhandled rejection.
**Fix:** Ajouter try/catch avec log `__DEV__`.

### 🟡 WARN-2: `sets.created_at` non indexé — full table scan sur HomeScreen
**Fichier:** `screens/HomeScreen.tsx:675`, `model/schema.ts`
**Problème:** `Q.where('created_at', Q.gte(...))` sur table non indexée. Lent avec beaucoup de sets.
**Fix:** Ajouter `isIndexed: true` sur `created_at` dans sets (migration v34).

### 🟡 WARN-3: Program.duplicate() reads hors write transaction
**Fichier:** `model/models/Program.ts:37-54`
**Problème:** Reads outside `database.write()`. Théoriquement, données pourraient changer entre reads et write. Risque faible en single-user mobile.

### 🔵 SUGG-1: `_celebrationQueue` useState → useRef pour éviter re-renders
### 🔵 SUGG-2: AnimatedSplash couleurs en dur (exception documentée)

## Vérifications conformes
- ✅ Toutes mutations DB dans `database.write()`
- ✅ Tous timers ont cleanup
- ✅ Null safety correcte
- ✅ `Q.on('histories')` join valide
- ✅ `Promise.all` recalculateSetPrs safe (WDB sérialise les writes)
- ✅ `Relation.id` accès FK synchrone correct partout

## Résumé
- 🔴 Critiques: 0
- 🟡 Warnings: 3
- 🔵 Suggestions: 2
