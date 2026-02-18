# CHANGELOG

## [Non publié] — 2026-02-18

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

## Récapitulatif des Commits

| Hash | Type | Description |
|------|------|-------------|
| `3052d11` | fix | Corrige `Program.duplicate()` et `deleteSession()` manquants |
| `f245daf` | fix | Corrige l'annotation de type de `History.sets` (`Set[]` → `Query<Set>`) |
| `275accf` | fix | Réordonne les JSDoc mal placés dans `databaseHelpers.ts` |
| `7c184e7` | chore | Supprime les styles morts dans `SessionDetailScreen` |
| `ae34bfd` | refactor | Extrait `buildExerciseStatsFromData` pour éliminer la duplication |
| `4de0ed3` | fix | Corrige la fuite mémoire des `setTimeout` dans `RestTimer` |
| `9ed2ff8` | style | Remplace les couleurs hardcodées par les valeurs du thème (navigation) |
