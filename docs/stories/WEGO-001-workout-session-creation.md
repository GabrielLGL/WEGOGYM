# Story: Lancer une seance et initialiser le WorkoutScreen

**ID:** WEGO-001
**Priorite:** Haute
**Estimation:** 1 jour

## Contexte

Actuellement, `SessionDetailScreen` sert uniquement a planifier une seance (objectifs sets/reps/poids). Il n'existe aucun moyen pour l'utilisateur d'executer concretement cette seance. Cette story cree le point d'entree du mode seance en direct : le bouton "Lancer l'entrainement" et la mise en place du squelette du `WorkoutScreen` avec son chronometre et son acces aux donnees reactives.

## Acceptance Criteria

- [ ] **AC1:** Un bouton "Lancer l'entrainement" est visible en bas de `SessionDetailScreen`, sous le bouton "Ajouter un exercice". Il est desactive (opacity 0.4) si la session ne contient aucun exercice.
- [ ] **AC2:** Un appui sur ce bouton declenche `haptics.onPress()`, puis navigue vers `WorkoutScreen` en passant le `sessionId` en parametre.
- [ ] **AC3:** `WorkoutScreen` s'affiche avec le nom de la session en titre du header (via `navigation.setOptions`).
- [ ] **AC4:** Un chronometre visible en haut de l'ecran demarre automatiquement des l'ouverture et affiche la duree ecoulee au format `MM:SS`.
- [ ] **AC5:** Le chronometre continue de tourner correctement apres un changement d'onglet ou un retour sur l'ecran (pas de reset).
- [ ] **AC6:** La liste des exercices de la session (depuis `session_exercises`) est affichee dans l'ordre croissant de `position`, liee par `withObservables`.
- [ ] **AC7:** Si la session n'a pas d'exercices, un message "Aucun exercice dans cette seance." est affiche.
- [ ] **AC8:** Une entree `History` est creee en base au moment de l'ouverture du `WorkoutScreen` avec `start_time = Date.now()`, `session_id`, et `end_time = null`.

## Taches techniques

### 1. Navigation

- [ ] Dans `mobile/src/navigation/index.tsx`, ajouter `Workout: { sessionId: string }` dans `RootStackParamList`.
- [ ] Enregistrer `<Stack.Screen name="Workout" component={WorkoutScreen} />` dans le `Stack.Navigator`, avec `headerShown: true` et `options={{ title: '' }}` (le titre sera pose par le screen via `setOptions`).

### 2. Modele History — verification

- [ ] Verifier que `mobile/src/model/models/History.ts` expose bien `startTime`, `endTime` (optionnel) et la relation `session`. Aucune modification du schema (v14 est deja correct).
- [ ] Verifier que le champ `deleted_at` est bien dans le schema `histories` (il y est en v14) — pas de modification.

### 3. Helper DB — creation de l'entree History

- [ ] Dans `mobile/src/model/utils/databaseHelpers.ts`, ajouter la fonction `createWorkoutHistory(sessionId: string): Promise<History>` qui effectue un `database.write` pour creer un enregistrement `History` avec `start_time = Date.now()`, `session_id = sessionId`, `end_time` non renseigne.
- [ ] Cette fonction retourne l'instance `History` cree afin que le `WorkoutScreen` puisse stocker son `id` en state local (utile pour WEGO-002).

### 4. Hook useWorkoutTimer

- [ ] Creer `mobile/src/hooks/useWorkoutTimer.ts`.
- [ ] Le hook demarre un `setInterval` de 1 seconde des le montage.
- [ ] Il expose `{ elapsedSeconds: number, formattedTime: string }` ou `formattedTime` est au format `MM:SS`.
- [ ] Le calcul est base sur `Date.now() - startTimestamp` pour eviter le drift (meme pattern que `RestTimer.tsx`).
- [ ] Le hook accepte un parametre `startTimestamp: number` (valeur de `Date.now()` a l'ouverture de la seance).
- [ ] Nettoyer le `setInterval` dans le `useEffect` de cleanup.

### 5. Modification SessionDetailScreen

- [ ] Dans `mobile/src/screens/SessionDetailScreen.tsx`, ajouter le bouton "Lancer l'entrainement" dans `footerContainer`, **au-dessus** du bouton "Ajouter un exercice".
- [ ] Le bouton est desactive si `sessionExercises.length === 0`.
- [ ] Le style suit le theme : `backgroundColor: colors.primary`, texte en blanc, `borderRadius: borderRadius.md`, padding identique au bouton existant.
- [ ] `onPress` : appeler `haptics.onPress()` puis `navigation.navigate('Workout', { sessionId: session.id })`.

### 6. Creation WorkoutScreen — squelette

- [ ] Creer `mobile/src/screens/WorkoutScreen.tsx`.
- [ ] Le composant interne (avant `withObservables`) recoit les props : `history: History`, `session: Session`, `sessionExercises: SessionExercise[]`, `user: User | null`, `navigation: any`.
- [ ] Dans un `useEffect` au montage : appeler `createWorkoutHistory(sessionId)` pour creer l'entree History, stocker l'instance retournee dans un `useRef` (`historyRef`), et stocker `Date.now()` dans un `useRef` (`startTimestampRef`) pour le passer a `useWorkoutTimer`.
- [ ] Appeler `useWorkoutTimer(startTimestampRef.current)` pour le chronometre.
- [ ] `useLayoutEffect` pour poser le titre : `navigation.setOptions({ title: session.name })`.
- [ ] Afficher le chronometre en haut via un composant `<WorkoutHeader />` (voir tache 7).
- [ ] Afficher un `FlatList` des `sessionExercises` avec un composant `<WorkoutExerciseCard />` en placeholder (texte simple avec le nom de l'exercice — sera complete dans WEGO-002).
- [ ] Afficher l'etat vide si `sessionExercises.length === 0`.
- [ ] `withObservables` observe : `session` via `findAndObserve`, `sessionExercises` via `query + observe`, `user` via `query + observe + map(list => list[0])`.

### 7. Composant WorkoutHeader

- [ ] Creer `mobile/src/components/WorkoutHeader.tsx`.
- [ ] Props : `{ formattedTime: string, totalVolume: number }` (le `totalVolume` sera passe depuis le parent, calcule en WEGO-002, ici il vaudra toujours 0).
- [ ] Affiche le temps ecoule en grand (monospace, style identique au timer dans `RestTimer.tsx`).
- [ ] Affiche "Volume : 0 kg" sous le chronometre (sera mis a jour en WEGO-002).
- [ ] Style : `backgroundColor: colors.card`, `borderRadius: borderRadius.md`, `padding: spacing.md`, marge horizontale et verticale.

### 8. Tests

- [ ] Tester `useWorkoutTimer` : verifier que `elapsedSeconds` s'incremente, que `formattedTime` est bien formate, et que le cleanup fonctionne.
- [ ] Tester `createWorkoutHistory` : verifier qu'elle cree bien un enregistrement avec les bons champs (mock WatermelonDB).

## Contraintes WEGOGYM

- **Modals :** non applicable dans cette story.
- **Donnees :** `withObservables` uniquement, pas de state local pour les donnees DB.
- **DB :** la creation de `History` passe obligatoirement par `databaseHelpers.ts`.
- **Haptics :** `haptics.onPress()` sur le bouton "Lancer l'entrainement".
- **UI :** dark mode, textes en francais, valeurs depuis `theme/index.ts`.
- **TypeScript :** strict, interfaces pour toutes les props.

## Fichiers a creer

- [ ] `mobile/src/screens/WorkoutScreen.tsx`
- [ ] `mobile/src/components/WorkoutHeader.tsx`
- [ ] `mobile/src/hooks/useWorkoutTimer.ts`

## Fichiers a modifier

- [ ] `mobile/src/navigation/index.tsx` — ajouter la route `Workout` dans `RootStackParamList` et le `Stack.Screen`.
- [ ] `mobile/src/screens/SessionDetailScreen.tsx` — ajouter le bouton "Lancer l'entrainement" dans le footer.
- [ ] `mobile/src/model/utils/databaseHelpers.ts` — ajouter `createWorkoutHistory`.

## Dependances

- Bloque : WEGO-002, WEGO-003, WEGO-004
- Bloque par : aucune

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables manuellement.
- [ ] `npx tsc --noEmit` passe sans erreur.
- [ ] `npm test -- --watchAll=false` passe.
- [ ] Le chronometre ne se remet pas a zero lors d'un changement de route.
- [ ] Revue par `wegogym-architect` pour la creation de la route et du schema History.
