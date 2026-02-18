# Story: Migration des statistiques — ChartsScreen lit depuis `sets` au lieu de `performance_logs`

**ID:** WEGO-007
**Priorite:** Haute
**Estimation:** 1.5 jour(s)

## Contexte

Depuis le Sprint 1, la vraie source de verite des performances est la table `sets` (enregistree en temps reel pendant les seances via `WorkoutScreen`). Or `ChartsScreen` lit encore depuis `performance_logs` — une ancienne table qui n'est plus alimentee depuis le Sprint 1. Resultat : les statistiques affichent des donnees perimees et les nouvelles seances n'apparaissent pas dans les graphiques.

La migration consiste a refactoriser entierement la source de donnees de `ChartsScreen` : lire depuis `sets` groupes par `exercise_id`, en calculant le poids max par seance (`max(set.weight)` pour un `history_id` donne), tries par `history.startTime`. Les `performance_logs` sont conserves en DB mais ne sont plus lus.

L'historique brut sous la courbe affichera desormais les vraies series (toutes les lignes de `sets` pour une seance donnee) avec leur date.

---

## Acceptance Criteria

- [ ] **AC1:** Le selecteur d'exercices en haut de `ChartsScreen` n'affiche que les exercices ayant au moins un `Set` enregistre en DB (table `sets`), pas les exercices ayant uniquement des `performance_logs`.
- [ ] **AC2:** La courbe de progression affiche le poids maximum (`max(set.weight)`) par seance, un point par seance (`History`), tries par `history.startTime` chronologique (du plus ancien au plus recent). La limite reste 15 points maximum.
- [ ] **AC3:** L'axe X de la courbe affiche la date de la `History` (`startTime`) formatee en `JJ/MM`, pas la date de creation du `Set`.
- [ ] **AC4:** L'historique brut sous la courbe affiche la liste des seances, chaque seance etant groupee par `history_id` et affichant : date (`startTime`), nom de la session, et la liste des series individuelles (`weight x reps` pour chaque set).
- [ ] **AC5:** La courbe necessite au moins 2 points (2 seances distinctes pour l'exercice) pour s'afficher. Sous ce seuil, le message "Enregistrez au moins une autre session pour voir votre progression." est affiche.
- [ ] **AC6:** Les filtres muscle et equipement (`ChipSelector`) continuent de fonctionner pour filtrer la liste des exercices dans le selecteur.
- [ ] **AC7:** La suppression d'un point de l'historique (ancienne fonctionnalite) est adaptee : supprimer un groupe de sets (toute la seance pour cet exercice) plutot qu'un `PerformanceLog`. L'`AlertDialog` de confirmation est conserve avec le titre "Supprimer cette seance ?" et le message incluant la date.
- [ ] **AC8:** Les `performance_logs` existants en DB ne sont pas touches (pas de suppression, pas de modification). La table reste en schema mais n'est plus lue par `ChartsScreen`.

---

## Taches techniques

### 1. Helpers DB pour les stats (`mobile/src/model/utils/databaseHelpers.ts`)

- [ ] Ajouter l'interface `ExerciseSessionStat` dans un fichier de types ou directement dans `databaseHelpers.ts` :
  ```typescript
  export interface ExerciseSessionStat {
    historyId: string
    sessionName: string
    startTime: Date
    maxWeight: number       // max(set.weight) pour cet exercise dans cette history
    sets: Array<{ weight: number; reps: number; setOrder: number }>
  }
  ```
- [ ] Ajouter la fonction `getExerciseStatsFromSets(exerciseId: string): Promise<ExerciseSessionStat[]>` qui :
  1. Fetch tous les `Set` ou `exercise_id = exerciseId` depuis `database.get<WorkoutSet>('sets').query(Q.where('exercise_id', exerciseId)).fetch()`
  2. Groupe les sets par `history_id` en utilisant un `Map<string, WorkoutSet[]>`
  3. Pour chaque `history_id` unique : fetch la `History` correspondante (`database.get<History>('histories').find(historyId)`)
  4. Fetch la `Session` de la `History` pour recuperer le `session.name`
  5. Calcule `maxWeight = Math.max(...groupSets.map(s => s.weight))`
  6. Retourne un tableau de `ExerciseSessionStat` trie par `startTime` ASC
  7. Exclut les `History` dont `deletedAt` est non null (seances soft-deleted)
  - Note : Limiter aux 15 derniers points se fait dans le composant, pas dans ce helper (separation des responsabilites)
- [ ] Ajouter la fonction `getExerciseIdsWithSets(): Promise<Set<string>>` qui fetch tous les `Set` distincts par `exercise_id` et retourne un `Set<string>` des IDs. Utiliser `Q.unsafeSqlQuery` ou grouper en JS apres fetch selon les capacites WatermelonDB.
  - Alternative plus simple : fetch `database.get<WorkoutSet>('sets').query().fetch()` et `.reduce()` en Set — acceptable si le volume de sets reste < 10 000.

### 2. Refactorisation de `ChartsScreen` (`mobile/src/screens/ChartsScreen.tsx`)

La refactorisation est complete. Le fichier sera presque entierement recrit dans ses parties logique et types.

#### 2a. Nouvelles interfaces Props

- [ ] Remplacer `allLogs: PerformanceLog[]` par `allSets: WorkoutSet[]` dans l'interface `Props`
- [ ] Supprimer l'import de `PerformanceLog` et de `PerformanceLog` model
- [ ] Ajouter l'import de `Set` model (aliase `WorkoutSet` comme dans `databaseHelpers.ts`), `History` model

#### 2b. `withObservables` en bas du fichier

- [ ] Remplacer :
  ```typescript
  allLogs: database.get<PerformanceLog>('performance_logs').query().observe()
  ```
  par :
  ```typescript
  allSets: database.get<WorkoutSet>('sets').query().observe()
  ```
- [ ] Garder `exercises: database.get<Exercise>('exercises').query(Q.sortBy('name', Q.asc)).observe()` inchange

#### 2c. Calcul de `availableExercises`

- [ ] Remplacer le filtre base sur `allLogs` :
  ```typescript
  const loggedExoIds = new Set(allLogs.map(l => l.exercise.id))
  ```
  par un filtre base sur `allSets` :
  ```typescript
  const exerciseIdsWithSets = useMemo(
    () => new Set(allSets.map(s => s.exercise.id)),
    [allSets]
  )
  ```
- [ ] `availableExercises` filtre avec `exerciseIdsWithSets.has(exo.id)`

#### 2d. Calcul des stats pour l'exercice selectionne

- [ ] Remplacer `logsForSelectedExo` (tableau de `PerformanceLog`) par `statsForSelectedExo` calcule en `useMemo` :
  ```typescript
  const statsForSelectedExo = useMemo((): ExerciseSessionStat[] => {
    if (!selectedExoId) return []
    const setsForExo = allSets.filter(s => s.exercise.id === selectedExoId)

    // Grouper par history_id
    const byHistory = new Map<string, typeof setsForExo>()
    setsForExo.forEach(s => {
      const existing = byHistory.get(s.history.id) ?? []
      existing.push(s)
      byHistory.set(s.history.id, existing)
    })

    // NOTE : les objets `History` et `Session` ne sont pas disponibles ici via les props reactive.
    // Utiliser uniquement les donnees disponibles dans les `Set` observes.
    // Pour les dates et noms de session, il faut les recuperer via une observable supplementaire
    // — voir tache 2e.
  }, [allSets, selectedExoId])
  ```

#### 2e. Observation des `History` et `Session` pour l'exercice selectionne

Le probleme architectural : les `Set` observes via `withObservables` n'embarquent pas les objets `History` associes (juste `history_id` en string). Pour obtenir les `startTime` et `sessionName` de maniere reactive, il faut observer les `History` concernees.

- [ ] Ajouter une observable dans `withObservables` pour les histories ayant des sets pour l'exercice selectionne. Cependant, `selectedExoId` est un etat local — `withObservables` ne peut pas dependre d'un etat local React.
- [ ] **Approche recommandee :** Creer un sous-composant `ExerciseStatsContent` qui recoit `exerciseId: string` et est wrappe dans son propre `withObservables` observant les `History` filtrees :
  ```typescript
  const ObservableExerciseStats = withObservables(['exerciseId'], ({ exerciseId }) => ({
    histories: database.get<History>('histories')
      .query(Q.where('deleted_at', null))
      .observe(),
    setsForExercise: database.get<WorkoutSet>('sets')
      .query(Q.where('exercise_id', exerciseId))
      .observe(),
  }))(ExerciseStatsContent)
  ```
- [ ] Ce composant calcule en interne `statsForSelectedExo` (groupement, maxWeight, tri par date) et rend le graphique + la liste
- [ ] `ChartsContent` principal ne passe que `exerciseId={selectedExoId}` a ce composant quand `selectedExoId !== null`

#### 2f. Donnees du graphique (`chartData`)

- [ ] Remplacer le calcul base sur `logsForSelectedExo` :
  ```typescript
  // AVANT
  const chartLogs = [...logsForSelectedExo].reverse().slice(-15)
  labels: chartLogs.map(log => new Date(log.createdAt).toLocaleDateString(...))
  datasets: [{ data: chartLogs.map(l => l.weight) }]
  ```
  par :
  ```typescript
  // APRES
  const chartStats = statsForSelectedExo.slice(-15) // deja trie ASC
  labels: chartStats.map(s => s.startTime.toLocaleDateString([], { day: '2-digit', month: '2-digit' }))
  datasets: [{ data: chartStats.map(s => s.maxWeight) }]
  ```
- [ ] La condition de rendu du graphique : `chartStats.length >= 2` (au lieu de `logsForSelectedExo.length < 2`)

#### 2g. Historique brut sous le graphique

- [ ] Remplacer `renderLogItem` (affichage d'un `PerformanceLog` : sets x reps x weight) par `renderSessionItem` (affichage d'une `ExerciseSessionStat`) :
  - En-tete : `sessionName` + date formatee (`s.startTime.toLocaleDateString()`)
  - Corps : liste des series individuelles `s.sets` triees par `setOrder` : `Serie N : Xkg x Y reps`
  - Bouton poubelle reste present (suppression de la seance pour cet exercice — voir AC7)
- [ ] La `FlatList` a `data={statsForSelectedExo.slice().reverse()}` (du plus recent au plus ancien)

#### 2h. Suppression d'une entree de l'historique (AC7)

- [ ] L'etat local `selectedLog: PerformanceLog | null` devient `selectedStat: ExerciseSessionStat | null`
- [ ] Le handler `handleDeleteStat` effectue la suppression des sets de la seance :
  ```typescript
  const handleDeleteStat = async () => {
    if (!selectedStat || !selectedExoId) return
    await database.write(async () => {
      const setsToDelete = await database.get<WorkoutSet>('sets')
        .query(
          Q.where('exercise_id', selectedExoId),
          Q.where('history_id', selectedStat.historyId)
        )
        .fetch()
      await database.batch(...setsToDelete.map(s => s.prepareDestroyPermanently()))
    })
    setIsAlertVisible(false)
    setSelectedStat(null)
  }
  ```
- [ ] `AlertDialog` : titre "Supprimer cette seance ?", message `${selectedStat?.sessionName} — ${selectedStat?.startTime.toLocaleDateString()}`

### 3. Tests

#### `mobile/src/model/utils/__tests__/databaseHelpers.test.ts`

- [ ] Ajouter test pour `getExerciseStatsFromSets` :
  - Cas nominal : 2 sets dans 2 histories differentes → 2 stats retournees, triees par date
  - Cas poids max : 3 sets dans la meme history (60kg, 70kg, 65kg) → maxWeight = 70
  - Cas history soft-deleted : une history avec `deleted_at` non null → exclue des resultats
  - Cas aucun set : tableau vide retourne

---

## Contraintes WEGOGYM (rappel pour wegogym-dev)

- **Modals :** `<AlertDialog>` ou `<BottomSheet>` via `<Portal>` — jamais `<Modal>` natif
- **Donnees :** `withObservables` uniquement — pas de Redux/Context
- **Validation :** `validationHelpers.ts` — jamais inline
- **DB :** `databaseHelpers.ts` — jamais inline
- **Haptics :** `useHaptics()` — `onPress`, `onDelete`, `onSuccess`, `onSelect`
- **UI :** Dark mode, textes en francais, valeurs depuis `theme/index.ts`
- **TypeScript :** strict, pas de `any`, interfaces pour les props

### Contraintes specifiques a cette story

- **`performance_logs` intouches :** Ne pas supprimer la table, ne pas modifier le modele `PerformanceLog`, ne pas toucher `schema.ts`. La table reste en DB, le modele reste dans `model/index.ts`. Seule la lecture depuis `ChartsScreen` est supprimee.
- **Pas de `useEffect` pour fetcher les donnees :** Toutes les donnees doivent passer par `withObservables`. Le calcul des stats (groupement, maxWeight, tri) se fait en `useMemo` a partir des observables injectees en props, jamais dans un `useEffect` avec `setState`.
- **Probleme des relations lazy de WatermelonDB :** Les relations `@relation` (ex: `set.history`) sont des `Relation<History>` — l'acces a `.id` est synchrone (c'est juste la FK stockee) mais `.fetch()` est asynchrone. Dans les `useMemo`, utiliser `s.history.id` (synchrone, pas de `await`) pour grouper par history. Les objets `History` complets (pour `startTime`) doivent etre observes separement via le sous-composant `ObservableExerciseStats` (tache 2e).
- **Suppression de sets, pas de history :** La suppression depuis `ChartsScreen` supprime uniquement les `Set` de l'exercice pour la seance concernee. Elle ne supprime PAS la `History` entiere (qui peut contenir des sets d'autres exercices).
- **Coherence de la courbe :** Le poids max (`maxWeight`) est calcule sur tous les sets de l'exercice pour cette seance, pas uniquement la premiere serie.

---

## Fichiers a creer

- [ ] Aucun nouveau fichier (tout est dans l'existant)

## Fichiers a modifier

- [ ] `mobile/src/screens/ChartsScreen.tsx` — Refactorisation complete de la source de donnees (PerformanceLogs -> Sets), nouveau sous-composant `ObservableExerciseStats`, nouveau `renderSessionItem`, nouveau handler de suppression
- [ ] `mobile/src/model/utils/databaseHelpers.ts` — Ajout de `getExerciseStatsFromSets`, `ExerciseSessionStat` interface
- [ ] `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` — Nouveaux tests pour `getExerciseStatsFromSets`

---

## Dependances

- Bloque : rien
- Bloquee par : WEGO-002 (sets doivent exister en DB pour que les stats soient non-vides — DONE Sprint 1)
- Peut etre developpee en parallele de WEGO-005 et WEGO-006 (aucun fichier partage sauf `databaseHelpers.ts` — coordonner les additions)

---

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables
- [ ] Apres une seance complete (Sprint 1), les stats de l'exercice s'affichent dans `ChartsScreen`
- [ ] Les `performance_logs` existants ne sont plus affichees (l'exercice n'apparait dans le selecteur que s'il a des `sets`)
- [ ] La suppression d'une seance dans les stats supprime les `sets` correspondants, pas la `History`
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm test -- --watchAll=false` passe
- [ ] Revue par `wegogym-architect` pour valider le pattern `ObservableExerciseStats` (sous-composant `withObservables` imbrique)
