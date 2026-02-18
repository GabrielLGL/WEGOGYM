# Story: Saisir et valider une serie en seance

**ID:** WEGO-002
**Priorite:** Haute
**Estimation:** 2 jours

## Contexte

C'est le coeur fonctionnel du Sprint 1. L'utilisateur est dans `WorkoutScreen` et doit pouvoir saisir le poids et les reps reellement realises pour chaque serie de chaque exercice, puis valider cette serie. Chaque validation sauvegarde un enregistrement `Set` en DB, auto-detecte si c'est un nouveau PR (meilleur poids jamais leve sur cet exercice), met a jour le volume total en temps reel, et declenche le timer de repos.

## Acceptance Criteria

- [ ] **AC1:** Pour chaque exercice de la seance, le `WorkoutScreen` affiche autant de rangees de saisie que `setsTarget` (ex: si `setsTarget = 3`, il y a 3 rangees numerotees "Serie 1", "Serie 2", "Serie 3").
- [ ] **AC2:** Chaque rangee contient deux champs numeriques : poids (kg) et reps. Les champs sont pre-remplis avec les valeurs `weightTarget` et `repsTarget` de la `SessionExercise` correspondante.
- [ ] **AC3:** Un bouton "Valider" (ou coche) est present sur chaque rangee. Il est desactive si les deux champs sont vides ou a zero.
- [ ] **AC4:** Appuyer sur "Valider" : (1) declenche `haptics.onSuccess()`, (2) sauvegarde un enregistrement `Set` en DB avec `history_id`, `exercise_id`, `weight`, `reps`, `set_order`, `is_pr`, (3) marque visuellement la rangee comme validee (fond vert `colors.success` avec opacity, champs non editables).
- [ ] **AC5:** La detection de PR : `is_pr = true` si `weight > maxWeightPreviouslySeen` pour cet `exercise_id` parmi tous les `sets` de toutes les `histories` precedentes (hors history en cours). Si PR, afficher un badge "PR !" en `colors.primary` sur la rangee.
- [ ] **AC6:** Le volume total affiche dans `WorkoutHeader` se met a jour apres chaque validation : `volume += weight * reps` du set valide. Ce calcul est fait en local (pas de re-fetch DB).
- [ ] **AC7:** Apres validation d'un set, si `user.timerEnabled === true`, le timer de repos se lance automatiquement pour la duree `user.restDuration` secondes. Le composant `RestTimer` existant est reutilise.
- [ ] **AC8:** Une serie deja validee ne peut plus etre modifiee (champs en lecture seule, bouton "Valider" remplace par la coche verte).
- [ ] **AC9:** Si le poids saisi est non numerique ou negatif, le champ est bordure rouge et le bouton "Valider" reste desactive.
- [ ] **AC10:** Si les reps saisies sont non numeriques ou inferieures a 1, le champ est bordure rouge et le bouton "Valider" reste desactive.

## Taches techniques

### 1. Helper DB — sauvegarde d'un Set

- [ ] Dans `mobile/src/model/utils/databaseHelpers.ts`, ajouter la fonction :
  ```typescript
  saveWorkoutSet(params: {
    historyId: string
    exerciseId: string
    weight: number
    reps: number
    setOrder: number
    isPr: boolean
  }): Promise<Set>
  ```
  Elle effectue un `database.write` et cree un enregistrement dans la collection `sets`.
- [ ] Ajouter la fonction `getMaxWeightForExercise(exerciseId: string, excludeHistoryId: string): Promise<number>` qui query `sets` avec `Q.where('exercise_id', exerciseId)` et `Q.where('history_id', Q.notEq(excludeHistoryId))`, puis retourne `Math.max(...sets.map(s => s.weight))` ou `0` si vide.

### 2. Helper Validation

- [ ] Dans `mobile/src/model/utils/validationHelpers.ts`, ajouter la fonction `validateSetInput(weight: string, reps: string): { valid: boolean; errors: string[] }` qui verifie que `weight` est un nombre >= 0 et que `reps` est un entier >= 1. Reutiliser `isValidNumeric`.

### 3. Hook useWorkoutState

- [ ] Creer `mobile/src/hooks/useWorkoutState.ts`.
- [ ] Ce hook gere l'etat local de la seance en cours. Il recoit `sessionExercises: SessionExercise[]` et `historyId: string`.
- [ ] Il expose :
  - `setInputs: Record<string, { weight: string; reps: string }>` — cle = `${sessionExerciseId}_${setOrder}`.
  - `validatedSets: Record<string, { weight: number; reps: number; isPr: boolean }>` — cle identique.
  - `totalVolume: number` — somme accumulee.
  - `updateSetInput(key: string, field: 'weight' | 'reps', value: string): void`.
  - `validateSet(sessionExercise: SessionExercise, setOrder: number): Promise<void>` — appelle `getMaxWeightForExercise`, determine `isPr`, appelle `saveWorkoutSet`, met a jour `validatedSets` et `totalVolume`.
- [ ] L'initialisation de `setInputs` pre-remplit les valeurs depuis `weightTarget` et `repsTarget` de chaque `SessionExercise`.

### 4. Composant WorkoutExerciseCard

- [ ] Creer `mobile/src/components/WorkoutExerciseCard.tsx`.
- [ ] Props :
  ```typescript
  interface WorkoutExerciseCardProps {
    sessionExercise: SessionExercise
    exercise: Exercise
    setInputs: Record<string, { weight: string; reps: string }>
    validatedSets: Record<string, { weight: number; reps: number; isPr: boolean }>
    onUpdateInput: (key: string, field: 'weight' | 'reps', value: string) => void
    onValidateSet: (sessionExercise: SessionExercise, setOrder: number) => Promise<void>
    lastPerformance: LastPerformance | null  // sera defini dans WEGO-004, passer null pour l'instant
  }
  ```
- [ ] Afficher le nom de l'exercice (`exercise.name`) en titre de la card.
- [ ] Generer `setsTarget` rangees (boucle sur `Array.from({ length: sessionExercise.setsTarget ?? 0 })`).
- [ ] Chaque rangee (`WorkoutSetRow`) : label "Serie N", `TextInput` poids (`keyboardType="numeric"`), `TextInput` reps (`keyboardType="numeric"`), bouton "Valider".
- [ ] Si la serie est dans `validatedSets` : afficher fond vert, champs non editables (`editable={false}`), remplacer le bouton par une coche "Valide" + badge "PR !" si `isPr`.
- [ ] Connecter via `withObservables` pour observer `exercise` depuis `sessionExercise.exercise.observe()`.
- [ ] Utiliser `validateSetInput` de `validationHelpers.ts` pour l'etat desactive du bouton.
- [ ] Haptics : `haptics.onSuccess()` sur validation dans `onValidateSet`.

### 5. Mise a jour WorkoutScreen

- [ ] Dans `mobile/src/screens/WorkoutScreen.tsx`, importer et instancier `useWorkoutState`.
- [ ] Passer `totalVolume` au composant `WorkoutHeader`.
- [ ] Remplacer le placeholder de `FlatList` par `<WorkoutExerciseCard>` avec tous les props requis.
- [ ] Gerer l'affichage du `RestTimer` : state local `showRestTimer`, affiche apres chaque `validateSet` reussi si `user.timerEnabled`.
- [ ] Le `RestTimer` existant (`mobile/src/components/RestTimer.tsx`) est reutilise tel quel avec `duration={user?.restDuration ?? 90}`.

### 6. Mise a jour WorkoutHeader

- [ ] Dans `mobile/src/components/WorkoutHeader.tsx`, afficher le `totalVolume` recu en props au format `{totalVolume.toFixed(1)} kg` sous le chronometre.
- [ ] Le texte "Volume" est libelle "Volume total :".

### 7. Tests

- [ ] Tester `saveWorkoutSet` : verifie la creation en DB avec les bons champs.
- [ ] Tester `getMaxWeightForExercise` : verifie le calcul du max avec et sans exclusion de history.
- [ ] Tester `validateSetInput` : cas valides, poids negatif, reps a zero, valeurs non numeriques.
- [ ] Tester `useWorkoutState` : pre-remplissage, mise a jour des inputs, accumulation du volume, detection PR.

## Contraintes WEGOGYM

- **Modals :** non applicable dans cette story.
- **Donnees :** `withObservables` pour lier `exercise` aux cards. L'etat de saisie (inputs, validated sets) est du state local UI — c'est correct car ce ne sont pas des donnees persistees avant validation.
- **DB :** `saveWorkoutSet` et `getMaxWeightForExercise` exclusivement dans `databaseHelpers.ts`.
- **Validation :** `validateSetInput` dans `validationHelpers.ts`, jamais inline.
- **Haptics :** `haptics.onSuccess()` sur validation de serie, `haptics.onError()` si tentative de validation avec input invalide.
- **UI :** `keyboardType="numeric"` obligatoire sur les champs poids et reps.
- **TypeScript :** exporter l'interface `LastPerformance` dans un fichier de types dedie `mobile/src/types/workout.ts` pour reutilisation dans WEGO-004.

## Fichiers a creer

- [ ] `mobile/src/components/WorkoutExerciseCard.tsx`
- [ ] `mobile/src/hooks/useWorkoutState.ts`
- [ ] `mobile/src/types/workout.ts` (interfaces partagees entre WEGO-002 et WEGO-004)

## Fichiers a modifier

- [ ] `mobile/src/model/utils/databaseHelpers.ts` — ajouter `saveWorkoutSet` et `getMaxWeightForExercise`.
- [ ] `mobile/src/model/utils/validationHelpers.ts` — ajouter `validateSetInput`.
- [ ] `mobile/src/screens/WorkoutScreen.tsx` — integrer `useWorkoutState`, `WorkoutExerciseCard`, `RestTimer`.
- [ ] `mobile/src/components/WorkoutHeader.tsx` — afficher `totalVolume`.

## Dependances

- Bloque : WEGO-003, WEGO-004
- Bloque par : WEGO-001 (l'`historyId` cree dans WEGO-001 est requis pour `saveWorkoutSet`)

## Points de vigilance

- **PR detection :** la query `getMaxWeightForExercise` doit bien exclure l'`historyId` en cours pour ne comparer qu'avec les seances passees. Utiliser `Q.where('history_id', Q.notEq(excludeHistoryId))`.
- **Performance :** ne pas faire de re-fetch complet de tous les sets a chaque validation. Le volume s'accumule en state local.
- **Fabric / New Arch :** les `TextInput` avec `keyboardType="numeric"` fonctionnent correctement. Ne pas utiliser `Modal` natif — les overlays passent par `Portal`.
- **FlatList et keyboard :** utiliser `keyboardShouldPersistTaps="handled"` sur la `FlatList` pour eviter la fermeture intempestive du clavier lors d'un scroll.

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables manuellement.
- [ ] `npx tsc --noEmit` passe sans erreur.
- [ ] `npm test -- --watchAll=false` passe.
- [ ] Un set valide est bien visible dans la table `sets` de la DB.
- [ ] Le badge "PR !" apparait correctement lors du premier set d'un exercice (aucun historique precedent = pas de PR) et lors d'un record.
