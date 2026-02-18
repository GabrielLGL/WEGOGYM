# CHANGELOG

## [Non publié] — 2026-02-18 — Passe 3

### Bug Corrigé

#### `importPresetProgram()` — `database.batch()` hors `database.write()` (commit `d17bfba`)
**Fichier :** `mobile/src/model/utils/databaseHelpers.ts`

La fonction `importPresetProgram()` appelait `await database.batch(...batch)` directement,
sans l'envelopper dans un bloc `database.write()`. WatermelonDB en mode JSI/SQLite
exige que toutes les opérations d'écriture (y compris `batch`) se produisent dans un
contexte `write()` ; sans cela, une erreur `Illegal call (batch) outside of a database.write() context`
est levée à l'exécution. Même classe de bug que le `deleteSession()` corrigé en Passe 1.

**Correction :** Ajout de `await database.write(async () => { await database.batch(...batch) })`.
Les lectures préalables (`fetch`, `fetchCount`) restent hors de `write()` pour l'efficacité.

---

### Code Mort Supprimé (commit `8c5673a`)

**`HistoryList.tsx`** et **`HistoryItem.tsx`** — Ces deux composants n'étaient importés
nulle part dans l'application. `HistoryList` n'était référencé dans aucun écran ni
composant parent ; `HistoryItem` n'était importé que par `HistoryList`. Les deux fichiers
constituaient du code mort inaccessible. `HistoryList` contenait de surcroît un bug de
navigation (passage de `history.id` comme `sessionId`) et des couleurs hardcodées
(`'white'`, `'gray'`) jamais nettoyées.

---

### Log Production Supprimé (commit `e391fdb`)

**Fichier :** `mobile/src/services/sentry.ts`

`console.log('[Sentry] Initialized successfully')` (ligne 70) s'exécutait
inconditionnellement en production. Tous les autres appels `console.*` du fichier
étaient déjà gardés par `if (__DEV__)` ou `beforeSend`, mais ce log de succès avait
été oublié.

**Correction :** Ajout du guard `if (__DEV__)` avant l'appel.

---

### Amélioration TypeScript (commit `9705776`)

**Fichier :** `mobile/src/screens/HomeScreen.tsx`

Le code de drag-and-drop utilisait `(updates as any)` pour contourner un problème
de typage du tableau après `.filter(Boolean)` (TypeScript ne sait pas que `Boolean`
exclut les `null`). Le cast `as any` désactivait silencieusement la vérification de type
sur l'appel `database.batch()`.

**Correction :** Remplacement par un type predicate explicite :
`.filter((x): x is Program => x !== null)`, ce qui supprime l'`as any` et conserve
la sécurité de type.

---

### Dépendance Inutile Supprimée (commit `5d0c090`)

**Fichier :** `mobile/package.json`

`lokijs` était listé comme dépendance de production. C'est l'adaptateur WatermelonDB
pour les environnements web/Node (in-memory). Ce projet utilise exclusivement
l'adaptateur SQLite/JSI (`jsi: true`). `lokijs` n'est importé nulle part dans le code
source et les tests mockent directement la base de données.

---

### Couleur Hardcodée Restante Corrigée (commit `8adcaf8`)

**Fichier :** `mobile/src/components/ProgramSection.tsx`

Le style `emptyButton` contenait `borderRadius: 10` — valeur brute non présente dans le
thème centralisé. Reliquat de la Passe 2 qui n'avait corrigé que les couleurs de ce fichier.

**Correction :** Remplacement par `borderRadius.md` (12), cohérent avec les autres
éléments boutons de l'application.

---

### Accessibilité — Gap Systématique Identifié (non corrigé)

Aucun composant interactif de la codebase ne possède d'attributs `accessibilityLabel`,
`accessibilityHint` ou `accessibilityRole`. Tous les `<TouchableOpacity>` et `<TextInput>`
de l'application sont inaccessibles aux utilisateurs de lecteurs d'écran (TalkBack Android).
Gap systématique noté — correction hors périmètre d'une passe chirurgicale (> 30 fichiers).

---

### Schéma WatermelonDB — Cohérence Vérifiée

Toutes les tables du schéma (v15) ont été comparées à leurs modèles :
`programs`, `sessions`, `session_exercises`, `exercises`, `performance_logs`,
`users`, `histories`, `sets`. Aucune colonne orpheline ni champ modèle manquant
détecté (les colonnes `created_at`/`updated_at`/`deleted_at` non exposées dans certains
modèles sont gérées par WatermelonDB en interne et ne constituent pas des bugs).

---

## Récapitulatif des Commits — Passe 3

| Hash | Type | Description |
|------|------|-------------|
| `d17bfba` | fix | `importPresetProgram()` : enveloppe `database.batch()` dans `database.write()` |
| `8c5673a` | chore | Supprime les composants morts `HistoryList` et `HistoryItem` |
| `e391fdb` | fix | Guard le `console.log` de `initSentry()` derrière `__DEV__` |
| `9705776` | refactor | Remplace `as any` par un type predicate dans le batch drag-and-drop de `HomeScreen` |
| `5d0c090` | chore | Supprime la dépendance de production inutilisée `lokijs` |
| `8adcaf8` | style | Remplace `borderRadius: 10` par `borderRadius.md` dans `ProgramSection` |

---

## [Non publié] — 2026-02-18 — Passe 2

### Bugs Corrigés

#### `User.ts` — Champ `username` orphelin absent du schéma (commit `88f37c1`)
**Fichier :** `mobile/src/model/models/User.ts`

Le modèle déclarait `@text('username') username?: string` mais la table
`users` dans le schéma (v15) ne possède aucune colonne `username`. Toute
écriture sur ce champ aurait levé une erreur WatermelonDB. Le champ n'était
utilisé nulle part dans la codebase.

**Correction :** Suppression du décorateur et de la propriété orphelins.

---

#### `duplicateSession()` — Position absente sur la séance dupliquée (commit `0effd1a`)
**Fichier :** `mobile/src/hooks/useProgramManager.ts`

La fonction `duplicateSession()` créait la nouvelle séance sans lui assigner
de `position`. Toutes les autres créations de séances (`saveSession`,
`moveSession`) appellent `getNextPosition()`. Une séance sans position aurait
un ordre indéfini dans la liste.

**Correction :** Ajout de `getNextPosition('sessions', Q.where('program_id', ...))`
avant la création et assignation de `s.position = position`.

---

### Fuites Mémoire Corrigées

#### `GlobalBackHandler` — `setTimeout` non annulé au démontage (commit `5a16ed1`)
**Fichier :** `mobile/src/navigation/index.tsx`

`setTimeout(() => { backPressRef.current = 0 }, 2000)` était créé mais son
identifiant était jeté. Si le composant se démontait dans les 2 secondes après
un premier appui, le timer continuait à tourner.

**Correction :** Ajout de `resetTimerRef` (`useRef<NodeJS.Timeout | null>`)
et `clearTimeout(resetTimerRef.current)` dans le return du `useEffect`.

---

#### `WorkoutSummarySheet` — Timer de debounce non nettoyé (commit `5a16ed1`)
**Fichier :** `mobile/src/components/WorkoutSummarySheet.tsx`

Le timer de debounce dans `handleNoteChange` était annulé dans `handleClose()`
mais pas lors d'un démontage par une autre voie. Si le composant était démonté
pendant que le debounce était en attente, `updateHistoryNote` s'exécutait sur
un composant mort.

**Correction :** Ajout de `useEffect(() => () => clearTimeout(debounceRef.current), [])`.

---

### Code Mort Supprimé (commit `bb7ec64`)

- **`AlertDialog.tsx`** — Bloc `useEffect` dont le corps ne contenait qu'un
  commentaire expliquant pourquoi rien n'y est fait.
- **`ExercisesScreen.tsx`** — Style `modalButton` présent dans `StyleSheet.create()`
  mais jamais référencé dans le JSX (les boutons utilisent `cancelBtn`/`confirmBtn`).
- **`HistoryList.tsx`** — Cast redondant `(session.histories as unknown as Query<History>)`
  devenu inutile après la correction de `History.sets` en Passe 1 ; import `Query`
  associé supprimé.

---

### Couleurs Hardcodées Remplacées (commit `99b72b0`)

**Fichiers :** `HistoryItem.tsx`, `SessionItem.tsx`, `ProgramSection.tsx`,
`SetItem.tsx`, `navigation/index.tsx` (objet `MyDarkTheme`)

Ces composants legacy utilisaient des valeurs hexadécimales brutes (`'#1C1C1E'`,
`'white'`, `'#007AFF'`, `'#888'`, `'#2C2C2E'`…) au lieu des tokens du thème
centralisé. `HistoryItem.tsx` était particulièrement critique : il utilisait
des couleurs de **mode clair** (`backgroundColor: 'white'`, `color: '#333'`)
dans une application dark-mode uniquement, rendant la carte illisible.

**Correction :** Remplacement systématique par `colors.*` et `borderRadius.*`
depuis `theme/index.ts`.

---

### Améliorations TypeScript (commit `d7fd06d`)

- **`ChipSelector.tsx`** — Prop `style?: any` → `StyleProp<ViewStyle>`.
- **`Exercise.ts`** — Double import de `@nozbe/watermelondb` (`Model` ligne 2
  et `Q` ligne 6) fusionné en un seul `import { Model, Q }`.
- **`sentry.ts`** — `captureError` et `addBreadcrumb` : paramètre contextuel
  `Record<string, any>` → `Record<string, unknown>`.
- **`useProgramManager.ts`** — `database.get('programs').create((p: any) => …)`
  → `database.get<Program>('programs').create((p) => …)`.
- **`navigation/index.tsx`** — `GlobalBackHandler` : `navigationRef: any` →
  `NavigationContainerRef<RootStackParamList>` ; `TabNavigator` : `{ navigation }: any`
  (prop inutilisée) → `_props: NativeStackScreenProps<RootStackParamList, 'MainTabs'>`.
- **`SessionDetailScreen.tsx`** / **`WorkoutScreen.tsx`** — `navigation: any`
  → `NativeStackNavigationProp<RootStackParamList>`.

---

## Récapitulatif des Commits — Passe 2

| Hash | Type | Description |
|------|------|-------------|
| `88f37c1` | fix | Supprime le champ `username` orphelin absent du schéma dans `User` |
| `0effd1a` | fix | `duplicateSession()` omettait la position sur la nouvelle séance |
| `5a16ed1` | fix | Corrige les fuites de `setTimeout` dans `GlobalBackHandler` et `WorkoutSummarySheet` |
| `bb7ec64` | chore | Supprime le code mort dans `AlertDialog`, `ExercisesScreen`, `HistoryList` |
| `99b72b0` | style | Remplace les couleurs hardcodées par les tokens du thème dans les composants legacy |
| `d7fd06d` | refactor | Remplace les types `any` par des types TypeScript explicites |

---

## [Non publié] — 2026-02-18 — Passe 1

### Bugs Critiques Corrigés

#### `Program.duplicate()` — Séances non copiées (commit `3052d11`)
**Fichier :** `mobile/src/model/models/Program.ts`

La méthode `duplicate()` était incomplète : elle créait un nouveau programme
et récupérait les séances originales, mais le corps de la boucle de copie
était remplacé par un commentaire `// ... (Tu peux copier ta logique de boucle
for ici)`. Résultat : dupliquer un programme créait une copie **vide** sans
aucune séance ni exercice.

**Correction :** Implémentation complète de la boucle de duplication —
pour chaque séance, création d'une nouvelle séance liée au nouveau programme,
puis pour chaque `SessionExercise`, création d'un enregistrement copié avec
tous les champs (`setsTarget`, `repsTarget`, `weightTarget`, `position`).

---

#### `deleteSession()` — Mutation hors `database.write()` (commit `3052d11`)
**Fichier :** `mobile/src/hooks/useProgramManager.ts`

`deleteSession()` appelait `selectedSession.destroyPermanently()` directement,
sans l'envelopper dans un bloc `database.write()`. WatermelonDB exige que
toutes les mutations (create, update, delete) se produisent dans un write,
faute de quoi une erreur est levée ou le comportement est indéfini.

**Correction :** Ajout du wrapper `await database.write(async () => { ... })`.

---

### Bugs Fonctionnels Corrigés

#### `History.sets` — Mauvaise annotation de type (commit `f245daf`)
**Fichier :** `mobile/src/model/models/History.ts`

Le décorateur `@children('sets')` était typé `Set[]` alors qu'il retourne
en réalité un `Query<Set>` (comme tous les autres modèles : `Program.sessions`,
`Session.histories`, `Session.sessionExercises` utilisent déjà `Query<T>`).

**Correction :** `sets!: Set[]` → `sets!: Query<Set>` + ajout de l'import
`Query` depuis `@nozbe/watermelondb`.

---

#### `RestTimer` — Fuite mémoire des `setTimeout` au démontage (commit `4de0ed3`)
**Fichier :** `mobile/src/components/RestTimer.tsx`

`finishTimer()` créait trois `setTimeout` (haptics à 400 ms, 800 ms, et
fermeture automatique à 1000 ms) sans stocker leurs identifiants. Si le
composant se démontait avant l'expiration de ces timers, ils continuaient
à s'exécuter sur un composant mort, provoquant des warnings React et des
effets de bord indésirables.

**Correction :** Ajout de `hapticTimer1Ref`, `hapticTimer2Ref` et
`closeTimerRef` ; nettoyage de tous les timers dans le `return` du `useEffect`.

---

### Code Mort Supprimé

#### Styles inutilisés dans `SessionDetailScreen` (commit `7c184e7`)
**Fichier :** `mobile/src/screens/SessionDetailScreen.tsx`

Deux entrées de `StyleSheet.create()` n'étaient référencées nulle part dans
le JSX :
- `modalButton` (les boutons du modal utilisent `cancelBtn` et `confirmBtn`)
- `alertMessage` (l'`AlertDialog` gère son propre rendu)

**Correction :** Suppression des deux styles morts.

---

### Qualité du Code

#### JSDoc mal ordonnés dans `databaseHelpers.ts` (commit `275accf`)
**Fichier :** `mobile/src/model/utils/databaseHelpers.ts`

Deux blocs JSDoc étaient mal positionnés :
1. Le JSDoc de `filterAndSearchExercises` était un commentaire orphelin à la
   ligne 130, alors que la fonction se trouve en fin de fichier (ligne 461+).
2. Le JSDoc de `createWorkoutHistory` précédait `completeWorkoutHistory` au
   lieu d'être juste avant sa propre fonction.

**Correction :** Déplacement de chaque JSDoc immédiatement avant la fonction
qu'il documente. Aucun changement fonctionnel.

---

#### Refactoring DRY — `buildExerciseStatsFromData` (commit `ae34bfd`)
**Fichiers :** `mobile/src/model/utils/databaseHelpers.ts`,
`mobile/src/screens/ChartsScreen.tsx`

La logique de construction des statistiques d'exercice par séance (groupement
des sets par `history_id`, calcul du `maxWeight`, tri par `setOrder`) était
dupliquée entre :
- `getExerciseStatsFromSets()` dans `databaseHelpers.ts` (contexte async)
- Le `useMemo` de `ExerciseStatsContent` dans `ChartsScreen.tsx` (contexte
  observable/synchrone)

**Correction :** Extraction d'une fonction pure `buildExerciseStatsFromData()`
dans `databaseHelpers.ts`, réutilisée dans les deux contextes. La fonction
prend des tableaux déjà chargés en paramètres, ce qui la rend utilisable
aussi bien en async qu'en mode réactif.

---

#### Couleurs hardcodées dans `navigation/index.tsx` (commit `9ed2ff8`)
**Fichier :** `mobile/src/navigation/index.tsx`

Les valeurs `'#121212'`, `'#1C1C1E'`, `'#007AFF'`, `'white'` et `'#888'`
étaient codées en dur dans le composant de navigation, contournant le système
de thème centralisé défini dans `theme/index.ts`.

**Correction :** Remplacement par les tokens du thème :
- `'#121212'` → `colors.background`
- `'#1C1C1E'` → `colors.card`
- `'#007AFF'` → `colors.primary`
- `'white'` → `colors.text`
- `'#888'` → `colors.textSecondary`

---

## Récapitulatif des Commits — Passe 1

| Hash | Type | Description |
|------|------|-------------|
| `3052d11` | fix | Corrige `Program.duplicate()` et `deleteSession()` manquants |
| `f245daf` | fix | Corrige l'annotation de type de `History.sets` (`Set[]` → `Query<Set>`) |
| `275accf` | fix | Réordonne les JSDoc mal placés dans `databaseHelpers.ts` |
| `7c184e7` | chore | Supprime les styles morts dans `SessionDetailScreen` |
| `ae34bfd` | refactor | Extrait `buildExerciseStatsFromData` pour éliminer la duplication |
| `4de0ed3` | fix | Corrige la fuite mémoire des `setTimeout` dans `RestTimer` |
| `9ed2ff8` | style | Remplace les couleurs hardcodées par les valeurs du thème (navigation) |
