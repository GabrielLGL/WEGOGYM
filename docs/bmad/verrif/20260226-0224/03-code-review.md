# Passe 3 — Code Review — 20260226-0224

## Problèmes identifiés

### 🟡 W1 — ai_api_key encore dans User model (dette architecturale)
- **Fichier :** `model/models/User.ts:27`, `model/schema.ts`
- **Issue :** Le champ `ai_api_key` est défini comme `@text` dans le modèle User (SQLite).
  Une migration dans `secureKeyStore.ts:74-96` copie la valeur vers `expo-secure-store` puis
  la met à null. Le champ reste pour la backward-compat mais représente une surface de risque.
- **Statut :** Acceptable en l'état (migration en place). À supprimer après plusieurs versions
  de migration (minimum 2-3 versions de schema gap).
- **Fix futur :** Supprimer `@text('ai_api_key')` du modèle + retirer la colonne du schema.

### 🟡 W2 — StatsExercisesScreen : ScrollView au lieu de FlatList
- **Fichier :** `screens/StatsExercisesScreen.tsx:73`
- **Issue :** Un `ScrollView` rend TOUS les exercices en mémoire. Avec 500+ exercices,
  cela cause du memory bloat et lag UI.
- **Fix :** Remplacer par `FlatList` avec `getItemLayout`.

### 🔵 S1 — Program.duplicate() : creates séquentiels au lieu de batch
- **Fichier :** `model/models/Program.ts:23-61`
- **Issue :** Les `create()` sont séquentiels à l'intérieur de `database.write()`.
  Fonctionnellement correct (write() est atomique), mais moins performant qu'un
  `prepareCreate + database.batch()`.
- **Fix :** Refactorer avec `prepareCreate()` et un seul `batch()` pour toutes les insertions.

### 🔵 S2 — Magic numbers dans gamificationHelpers.ts
- **Fichier :** `model/utils/gamificationHelpers.ts`
- **Issue :** `86400000` (ms/jour) utilisé directement. Lisibilité réduite.
- **Fix :** `const MS_PER_DAY = 24 * 60 * 60 * 1000`

### 🔵 S3 — useWorkoutState : state set après unmount potentiel
- **Fichier :** `hooks/useWorkoutState.ts:64-68`
- **Issue :** `setInputs()` est appelé après un appel async `getLastSetsForExercises()`.
  Il y a déjà une protection `cancelled` (flag ref). Pas de bug confirmé, mais pattern à risque.
- **Fix :** S'assurer que le flag `cancelled` est vérifié avant TOUS les setState async.

## Verdict
- Aucun problème critique d'architecture détecté
- Console.log : tous correctement gardés par `__DEV__`
- Types `any` : uniquement dans les fichiers de test (acceptable pour mocks WatermelonDB)
- Couleurs hardcodées : uniquement dans des tests (`#FF3B30` dans AlertDialog.test)
