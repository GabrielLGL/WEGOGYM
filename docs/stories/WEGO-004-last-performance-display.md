# Story: Afficher la derniere performance par exercice en seance

**ID:** WEGO-004
**Priorite:** Moyenne
**Estimation:** 1 jour

## Contexte

Pendant une seance, l'utilisateur a besoin d'une reference pour savoir ce qu'il a fait "la derniere fois" sur chaque exercice, afin de se fixer un objectif realiste. Cette story ajoute, sous le titre de chaque `WorkoutExerciseCard`, une ligne "Derniere fois : 3x10 @ 80 kg — il y a 3 jours" basee sur les `sets` de la derniere `History` completee pour cet exercice.

## Acceptance Criteria

- [ ] **AC1:** Sous le nom de l'exercice dans chaque `WorkoutExerciseCard`, une ligne de texte affiche la derniere performance enregistree pour cet exercice.
- [ ] **AC2:** Le format est : "Derniere fois : {maxSets}x{reps} @ {maxWeight} kg — il y a {N} jours" (ex: "Derniere fois : 3x10 @ 80 kg — il y a 3 jours").
- [ ] **AC3:** "il y a N jours" utilise des valeurs arrondies : "aujourd'hui" si < 24h, "hier" si < 48h, "il y a N jours" sinon.
- [ ] **AC4:** Si aucun historique n'existe pour cet exercice (premiere fois), la ligne affiche "Premiere fois sur cet exercice".
- [ ] **AC5:** Les donnees sont chargees de maniere reactive via `withObservables` (pas de `useEffect` + `fetch`).
- [ ] **AC6:** La ligne est en `colors.textSecondary`, `fontSize.xs` (12px), italique, sous le titre et au-dessus des rangees de series.

## Taches techniques

### 1. Helper DB — derniere performance

- [ ] Dans `mobile/src/model/utils/databaseHelpers.ts`, ajouter :
  ```typescript
  getLastPerformanceForExercise(exerciseId: string, excludeHistoryId: string): Observable<LastPerformance | null>
  ```
  - Cette fonction retourne un `Observable` (pas une `Promise`) pour s'integrer dans `withObservables`.
  - Elle query : `database.get<Set>('sets').query(Q.where('exercise_id', exerciseId), Q.where('history_id', Q.notEq(excludeHistoryId))).observe()`.
  - Elle utilise `pipe(switchMap(...))` ou `map(...)` sur le stream pour retrouver la History la plus recente parmi les sets, puis calcule `maxWeight`, `totalReps`, `setsCount`, et `date` de cette History.
  - Strategie : grouper les sets par `history_id`, trouver le groupe avec la `History.start_time` la plus recente, extraire les stats.

  **Note d'implementation :** cette approche necessite une etape intermediaire. L'alternative plus simple et recommandee est de garder la fonction comme `Promise` et de la wrapper dans `withObservables` via `from(getLastPerformanceForExercise(...))`. Dans ce cas, la signature est :
  ```typescript
  getLastPerformanceForExercise(exerciseId: string, excludeHistoryId: string): Promise<LastPerformance | null>
  ```
  Et dans le `withObservables` de `WorkoutExerciseCard`, on utilise `from(getLastPerformanceForExercise(...))` pour le convertir en Observable.

- [ ] L'algorithme :
  1. Fetch tous les sets pour cet `exercise_id` avec `history_id != excludeHistoryId`.
  2. Si vide, retourner `null`.
  3. Extraire les `history_id` uniques.
  4. Fetch chacune des `History` pour obtenir leur `start_time`.
  5. Trier par `start_time` descending, garder la plus recente.
  6. Filtrer les sets de cette History, calculer `maxWeight = Math.max(...sets.map(s => s.weight))`, `avgReps = Math.round(sets.reduce(...) / sets.length)`, `setsCount = sets.length`, `date = history.startTime`.
  7. Retourner `{ maxWeight, avgReps, setsCount, date }`.

### 2. Type LastPerformance

- [ ] Dans `mobile/src/types/workout.ts` (cree dans WEGO-002), ajouter ou completer :
  ```typescript
  export interface LastPerformance {
    maxWeight: number
    avgReps: number
    setsCount: number
    date: Date
  }
  ```

### 3. Helper de formatage — temps relatif

- [ ] Dans `mobile/src/model/utils/databaseHelpers.ts`, ajouter :
  ```typescript
  formatRelativeDate(date: Date): string
  ```
  - Calcule `diffMs = Date.now() - date.getTime()`.
  - Si `diffMs < 24 * 3600 * 1000` : retourner `"aujourd'hui"`.
  - Si `diffMs < 48 * 3600 * 1000` : retourner `"hier"`.
  - Sinon : retourner `"il y a ${Math.floor(diffMs / (24 * 3600 * 1000))} jours"`.

### 4. Composant LastPerformanceBadge

- [ ] Creer `mobile/src/components/LastPerformanceBadge.tsx`.
- [ ] Props :
  ```typescript
  interface LastPerformanceBadgeProps {
    lastPerformance: LastPerformance | null
  }
  ```
- [ ] Si `lastPerformance === null` : afficher "Premiere fois sur cet exercice" en `colors.textSecondary`, `fontSize.xs`, italic.
- [ ] Sinon : afficher "Derniere fois : {setsCount}x{avgReps} @ {maxWeight} kg — {formatRelativeDate(date)}" avec le meme style.
- [ ] Composant pur, pas de logique DB, pas de `withObservables`.

### 5. Integration dans WorkoutExerciseCard

- [ ] Dans `mobile/src/components/WorkoutExerciseCard.tsx` (cree dans WEGO-002) :
  - Ajouter la prop `lastPerformance: LastPerformance | null` (elle etait deja prevue en placeholder dans WEGO-002).
  - Afficher `<LastPerformanceBadge lastPerformance={lastPerformance} />` entre le nom de l'exercice et la liste des series.
  - Dans le `withObservables` de `WorkoutExerciseCard`, ajouter l'observable `lastPerformance` :
    ```typescript
    lastPerformance: from(getLastPerformanceForExercise(item.exercise.id, historyId))
    ```
  - La prop `historyId` doit etre passee depuis `WorkoutScreen` jusqu'a `WorkoutExerciseCard`.

### 6. Passage de historyId dans WorkoutScreen

- [ ] Dans `mobile/src/screens/WorkoutScreen.tsx`, verifier que `historyId` (stocke dans `historyRef.current.id` depuis WEGO-001) est bien accessible et passe en prop a chaque `WorkoutExerciseCard` dans le `renderItem` de la `FlatList`.

### 7. Tests

- [ ] Tester `getLastPerformanceForExercise` : cas sans historique (retourne null), cas avec un historique, cas avec plusieurs historiques (retourne bien le plus recent).
- [ ] Tester `formatRelativeDate` : "aujourd'hui", "hier", "il y a N jours".
- [ ] Tester `LastPerformanceBadge` : affichage null vs donnees.

## Contraintes WEGOGYM

- **Donnees :** `getLastPerformanceForExercise` dans `databaseHelpers.ts`, pas de logique DB dans le composant.
- **Reactive :** utiliser `from(Promise)` dans `withObservables` pour convertir la Promise en Observable — c'est le pattern correct pour une query one-shot dans ce contexte.
- **Performance :** cette query est executee une fois par exercice au chargement du `WorkoutScreen`. Avec 5-10 exercices, c'est acceptable. Ne pas faire de polling.
- **TypeScript :** `LastPerformance | null` — gerer explicitement le cas null dans le composant.
- **UI :** texte secondaire, non intrusif, ne pas alourdir visuellement la card.

## Fichiers a creer

- [ ] `mobile/src/components/LastPerformanceBadge.tsx`

## Fichiers a modifier

- [ ] `mobile/src/model/utils/databaseHelpers.ts` — ajouter `getLastPerformanceForExercise` et `formatRelativeDate`.
- [ ] `mobile/src/types/workout.ts` — ajouter ou completer l'interface `LastPerformance`.
- [ ] `mobile/src/components/WorkoutExerciseCard.tsx` — integrer `LastPerformanceBadge` et enrichir `withObservables`.
- [ ] `mobile/src/screens/WorkoutScreen.tsx` — passer `historyId` en prop a `WorkoutExerciseCard`.

## Dependances

- Bloque : aucune (story independante fonctionnellement)
- Bloque par : WEGO-001 (historyId disponible), WEGO-002 (WorkoutExerciseCard existe avec le slot `lastPerformance`)

## Points de vigilance

- **Requete sur `sets` vs `performance_logs` :** la source de verite pour "derniere fois" est desormais la table `sets` (liee a `histories`), PAS `performance_logs`. Le `SessionExerciseItem` existant lit encore `performance_logs` — ce n'est pas l'objet de cette story (ce sera migre apres Sprint 1), mais ne pas confondre les deux dans le `WorkoutScreen`.
- **`from()` et `withObservables` :** `from(Promise)` cree un Observable cold qui complete apres la resolution. Cela signifie que si de nouveaux sets sont ajoutes en cours de seance, la `lastPerformance` ne se mettra pas a jour automatiquement — c'est le comportement attendu (la reference "derniere fois" doit rester fixe pendant la seance pour ne pas perturber l'utilisateur).
- **Exclusion de la history en cours :** le parametre `excludeHistoryId` est critique pour ne pas comparer l'utilisateur avec lui-meme pendant la seance active.
- **Cas ou maxWeight = 0 :** peut arriver si des sets ont ete enregistres avec poids = 0 (exercices au poids de corps). Afficher "0 kg" est correct dans ce cas.

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables manuellement.
- [ ] `npx tsc --noEmit` passe sans erreur.
- [ ] `npm test -- --watchAll=false` passe.
- [ ] "Premiere fois sur cet exercice" s'affiche bien sur un exercice sans historique.
- [ ] La date relative est correcte (tester en modifiant manuellement la `start_time` d'une History en DB pour simuler J-1, J-5, etc.).
