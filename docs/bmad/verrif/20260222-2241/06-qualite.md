# Passe 6/8 — Code mort & qualité
Run : 20260222-2241

## Résultat global

| Catégorie | Statut | Issues |
|-----------|--------|--------|
| `any` en production | ✅ CLEAN | 0 (`as any` uniquement dans tests) |
| console.log hors __DEV__ | ✅ CLEAN | 0 (sentry.ts:21 est bien gardé) |
| Couleurs hardcodées | ✅ CLEAN | 0 |
| Imports inutilisés | ✅ CLEAN | 0 |
| Code mort | ✅ CLEAN | 0 |

## Issues trouvées

### 🟡 #1 — Alert.alert() natif au lieu de AlertDialog (4 usages)
CLAUDE.md §3 interdit `<Modal>` natif (crash Fabric). `Alert.alert()` n'est pas le même composant (dialog natif platform) mais crée une incohérence de pattern avec `<AlertDialog>` utilisé partout ailleurs.
- `screens/WorkoutScreen.tsx:103`
- `screens/ProgramsScreen.tsx:218`
- `screens/AssistantScreen.tsx:276, 430`
**Fix :** Remplacer par `<AlertDialog>` pour cohérence. Non-critique car Alert.alert est safe sur Fabric.

### 🟡 #2 — CLAUDE.md désynchronisé (schema v16 → v17, BodyMeasurement manquant)
**Fichier :** `CLAUDE.md` section 2
Le schema est v17 depuis l'ajout de `body_measurements` et du champ `name` sur `users`. CLAUDE.md dit encore v16 et ne mentionne pas le modèle `BodyMeasurement`.

### 🟡 #3 — deleteWorkoutSet: fetch hors write() (dupliqué de passe 3 #4)
**Fichier :** `model/utils/databaseHelpers.ts:253-272`
Race condition potentielle.

### 🔵 #4 — `as any` dans les tests (30+ instances)
Majoritairement dans `useProgramManager.test.ts`, `useSessionManager.test.ts`, `databaseHelpers.test.ts`.
Pattern de mock accepté mais pas idéal pour la type safety.

## Score
Qualité : **18/20** (Alert.alert incohérence + CLAUDE.md désynchronisé)
