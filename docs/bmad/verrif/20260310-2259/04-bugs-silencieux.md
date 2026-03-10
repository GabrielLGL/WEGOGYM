# Passe 4/8 — Bugs silencieux

**Date :** 2026-03-10 22:59

## Résumé

- 🔴 Critiques : 0
- 🟡 Warnings : 5
- 🔵 Suggestions : 4

## Points conformes

- Tous les `setTimeout`/`setInterval` ont un cleanup ✅
- Aucun `.subscribe()` direct — tout passe par `withObservables` ✅
- Tous les `addEventListener` ont un cleanup ✅
- Toutes les mutations WDB dans `database.write()` ✅
- Pas de `<Modal>` natif ✅
- Pas de `any` en production ✅
- Refs `isMountedRef` correctement utilisées ✅

## Findings

### 🟡 W1 — RestTimer double closeTimer

**Fichier :** `components/RestTimer.tsx:156`
Si l'utilisateur tap pendant le délai AUTO_CLOSE_DELAY (1s), `closeTimer` est appelé 2 fois → `onClose()` appelé 2 fois.

**Fix :** Annuler `closeTimerRef` dans `closeTimer` ou ajouter un guard `alreadyClosed` ref.

### 🟡 W2 — dataManagementUtils post-write sans try/catch

**Fichier :** `model/utils/dataManagementUtils.ts:79-88`
`cancelAllReminders()`, `deleteApiKey()` et suppression de fichiers ne sont pas dans un try/catch. Si l'un échoue, les suivants ne s'exécutent pas.

**Fix :** Envelopper chaque opération post-write dans un try/catch individuel.

### 🟡 W3 — dataManagementUtils batch spread overflow

**Fichier :** `model/utils/dataManagementUtils.ts:48`
`database.batch(...allRecords.map(...))` utilise spread. Avec des milliers d'enregistrements → potentiel `Maximum call stack size exceeded`.

**Fix :** Passer un tableau au lieu du spread.

### 🟡 W4 — WorkoutScreen useCallback deps manquantes

**Fichier :** `screens/WorkoutScreen.tsx:270,279`
`handleConfirmEnd` et `handleConfirmAbandon` n'incluent pas `confirmEndModal`/`summaryModal`/`abandonModal` dans les deps.

**Fix :** Ajouter aux deps (les fonctions de `useModalState` sont stables, mais c'est fragile).

### 🟡 W5 — exportHelpers cast unsafe _raw

**Fichier :** `model/utils/exportHelpers.ts:71`
Cast `(r as unknown as { _raw: ... })._raw` — accès à l'API interne de WatermelonDB non documentée.

**Fix :** Ajouter un commentaire expliquant l'accès interne.

### 🔵 S1 — ExercisePickerModal handleAdd sans useCallback

**Fichier :** `components/ExercisePickerModal.tsx:109`
Recréé à chaque render.

### 🔵 S2 — aiPlanUtils database.find sans try/catch

**Fichier :** `model/utils/aiPlanUtils.ts:131`
`find(programId)` lance si l'ID n'existe pas. Risque faible (ID vient de l'UI).

### 🔵 S3 — workoutSetUtils orphan history_id

**Fichier :** `model/utils/workoutSetUtils.ts:140`
`historyMap.get(a.history.id)` retourne `undefined` pour des sets orphelins, masqué par `?? 0`.

### 🔵 S4 — RestTimer haptics stale closure théorique

**Fichier :** `components/RestTimer.tsx:128`
`haptics` capturé par closure dans useEffect `[]`. Théorique car `useHaptics()` retourne des fonctions mémoïsées stables.
