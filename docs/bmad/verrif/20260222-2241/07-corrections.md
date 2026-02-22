# Passe 7/8 — Corrections
Run : 20260222-2241

## 7a — Critiques 🔴

### Fix #1 — deleteWorkoutSet: fetch déplacé inside write()
**Fichier :** `model/utils/databaseHelpers.ts:253-272`
**Avant :** query fetch hors `database.write()`, risque de race condition
**Après :** query + destroy dans le même bloc `database.write()`
**Test mis à jour :** `databaseHelpers.test.ts` — assertion adaptée (write est maintenant toujours appelé)

### Fix #2 — deleteProgram: cascade vers Sessions + SessionExercises
**Fichier :** `hooks/useProgramManager.ts:113-127`
**Avant :** `destroyPermanently()` sur le program seul → orphelins
**Après :** `database.batch()` avec `prepareDestroyPermanently()` sur :
  - SessionExercises liés aux sessions du programme
  - Sessions du programme
  - Programme lui-même
**Test mis à jour :** `useProgramManager.test.ts` — mocks + assertions adaptés

### Fix #3 — deleteSession: cascade vers SessionExercises
**Fichier :** `hooks/useProgramManager.ts:218-231`
**Avant :** `destroyPermanently()` sur la session seule → orphelins
**Après :** `database.batch()` avec `prepareDestroyPermanently()` sur :
  - SessionExercises de la session
  - Session elle-même
**Test mis à jour :** `useProgramManager.test.ts` — mocks + assertions adaptés

## 7b — Warnings 🟡

### Fix #4 — CLAUDE.md: schema v16 → v17, ajout BodyMeasurement
**Fichier :** `CLAUDE.md` section 2
**Modif :** Version corrigée, modèle BodyMeasurement documenté, champ name sur User documenté.

## 7c — Suggestions 🔵

Rien de safe à auto-corriger. Les items suivants sont notés mais laissés pour correction manuelle :
- Alert.alert → AlertDialog (4 usages) : risque de régression UI, à faire un par un
- Clé API en clair dans SQLite : refactoring majeur (expo-secure-store)
- `as any` dans tests : effort trop grand, non-critique

## Vérification post-corrections
- TypeScript : ✅ 0 erreur
- Tests : ✅ 840 passed, 0 failed
- Itérations : 3 (2 cycles de fix tests)
