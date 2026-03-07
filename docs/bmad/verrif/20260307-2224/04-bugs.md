# Passe 4/8 — Silent Bugs

**Date :** 2026-03-07 22:24

## Scans effectués

| Catégorie | Statut |
|-----------|--------|
| setTimeout/setInterval sans cleanup | ✅ CLEAN |
| .subscribe/.observe sans unsubscribe | ✅ CLEAN |
| DB mutations hors database.write() | ✅ CLEAN |
| AbortSignal.timeout() (Hermes) | ✅ CLEAN |

## Notes mineures (non-critiques)

### 1. AI Providers — timeout clear timing (🟡 Faible risque)
- `geminiProvider.ts` et `openaiProvider.ts` : le `clear()` du timeout est appelé dans `finally()` avant que le body de la response soit entièrement lu.
- **Impact réel :** Faible — le timeout de 30s est largement suffisant pour le fetch + parse. Le `clear()` empêche le signal d'abort de se déclencher après que le fetch est terminé.
- **Action :** Non requis pour l'instant.

### 2. WorkoutScreen — setState après async (🟡 Mitigé)
- `handleConfirmEnd` appelle `completeWorkout()` puis fait des `setState`. Le `isMountedRef` est vérifié dans `completeWorkout()` qui retourne `null` si unmounted.
- **Impact réel :** Mitigé par le pattern existant.

## Conclusion

**0 bugs critiques** ✅ — 2 notes mineures, aucune action requise.
