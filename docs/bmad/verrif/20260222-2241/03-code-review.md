# Passe 3/8 — Code Review
Run : 20260222-2241

## 7 problèmes identifiés

### 🔴 #1 — Program deletion ne cascade pas aux Sessions/SessionExercises
**Fichier :** `hooks/useProgramManager.ts:118`
Quand un Program est supprimé, ses Sessions et SessionExercises deviennent orphelins. Le `destroyPermanently()` ne cascade pas. Risque de `RecordNotFound` si du code tente de résoudre `session.program.fetch()`.
**Fix :** Cascade batch delete (fetch sessions + sessionExercises, puis batch prepareDestroyPermanently).

### 🔴 #2 — Clé API stockée en clair dans SQLite
**Fichier :** `model/models/User.ts:23`, `model/schema.ts:69`
Le champ `ai_api_key` est en texte brut dans la DB. Sur device rooté/backup, la clé est extractible. Implications financières si fuite.
**Fix :** Migrer vers `expo-secure-store` pour le stockage de clés API. Garder un flag `has_api_key` dans le schema si nécessaire pour l'UI.
**Note :** Fix complexe, hors scope corrections auto.

### 🟡 #3 — WorkoutExerciseCard: observable one-shot via from()
**Fichier :** `components/WorkoutExerciseCard.tsx:243-244`
`from()` convertit un Promise en Observable qui émet une seule fois. Le `lastPerformance` ne se met pas à jour si `historyId` change après le premier rendu.
**Fix :** Rendre les WorkoutExerciseCards conditionnellement après que `historyId` est défini.

### 🟡 #4 — deleteWorkoutSet: fetch hors write() (race condition)
**Fichier :** `model/utils/databaseHelpers.ts:258-272`
La query est exécutée hors `database.write()`, puis le résultat est utilisé dedans. Race condition possible.
**Fix :** Déplacer le fetch à l'intérieur du `database.write()`.

### 🟡 #5 — CLAUDE.md documente schema v16, réel est v17
**Fichier :** `CLAUDE.md` section 2
Schema.ts déclare `version: 17` mais CLAUDE.md dit v16. Le modèle `BodyMeasurement` n'est pas documenté.
**Fix :** Mettre à jour CLAUDE.md.

### 🟡 #6 — SessionDetailScreen: fetch impératif au lieu de réactif
**Fichier :** `screens/SessionDetailScreen.tsx:69-82`
Liste d'exercices chargée via `fetch()` impératif au lieu de `withObservables`. La liste sera stale si un exercice est créé entre-temps.
**Fix :** Ajouter exercises dans le `withObservables` du composant.

### 🟡 #7 — useWorkoutState: deps vides = pas de re-init pour nouveaux exercices
**Fichier :** `hooks/useWorkoutState.ts:58-77`
Le `useEffect` a `[]` comme deps. Si des exercices sont ajoutés pendant le workout, ils n'auront pas de `setInputs`. Intentionnel (protège saisies en cours) mais risque d'inputs undefined.
**Fix :** Merge avec existant au lieu de remplacer.
