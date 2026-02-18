# Story: Terminer la seance et afficher le resume

**ID:** WEGO-003
**Priorite:** Haute
**Estimation:** 1.5 jours

## Contexte

Quand l'utilisateur a fini de saisir ses series, il doit pouvoir clore la seance. Cette story couvre le bouton "Terminer", la sauvegarde de `History.end_time`, et l'affichage d'un ecran de resume (BottomSheet) recapitulant les performances : duree, volume, nombre de PR, et possibilite d'ajouter une note texte libre.

## Acceptance Criteria

- [ ] **AC1:** Un bouton "Terminer la seance" est affiche en bas de `WorkoutScreen` (dans un footer fixe, hors `FlatList`). Il est toujours visible.
- [ ] **AC2:** Un appui sur "Terminer la seance" : declenche `haptics.onPress()` et ouvre une `AlertDialog` de confirmation avec titre "Terminer la seance ?" et message "Les series non validees ne seront pas enregistrees.", bouton confirmer "Terminer" (`colors.primary`), bouton annuler "Continuer".
- [ ] **AC3:** Apres confirmation, l'app : (1) met a jour `History.end_time = Date.now()`, (2) ouvre le `BottomSheet` de resume (`WorkoutSummarySheet`), (3) declenche `haptics.onMajorSuccess()`.
- [ ] **AC4:** Le `WorkoutSummarySheet` affiche : duree totale (format MM:SS depuis `end_time - start_time`), volume total (en kg), nombre de sets valides, nombre de PR (count des sets avec `is_pr = true`).
- [ ] **AC5:** Un champ texte multi-lignes "Ajouter une note (optionnel)" est present dans le `WorkoutSummarySheet`. La saisie met a jour `History.note` en DB en temps reel (debounce 500ms) ou a la fermeture.
- [ ] **AC6:** Un bouton "Fermer" en bas du `WorkoutSummarySheet` appelle `navigation.navigate('MainTabs', { screen: 'Home' })` et declenche `haptics.onPress()`. Le `WorkoutScreen` est retire de la pile (l'utilisateur ne peut pas revenir en arriere sur une seance terminee).
- [ ] **AC7:** Si l'utilisateur appuie sur le bouton retour hardware Android pendant que le `WorkoutSummarySheet` est ouvert, le comportement est identique au bouton "Fermer" (navigation vers Home).
- [ ] **AC8:** Si l'utilisateur appuie sur le bouton retour hardware Android pendant la seance (avant de terminer), une `AlertDialog` "Abandonner la seance ?" s'affiche avec message "Les series deja validees seront conservees." et bouton confirmer "Abandonner" (`colors.danger`).
- [ ] **AC9:** Si "Abandonner" est confirme, `History.end_time` est mis a la date actuelle, puis navigation vers Home.

## Taches techniques

### 1. Helpers DB — cloture de History et mise a jour note

- [ ] Dans `mobile/src/model/utils/databaseHelpers.ts`, ajouter :
  ```typescript
  completeWorkoutHistory(historyId: string, endTime: number): Promise<void>
  ```
  Effectue `database.write` + `history.update(h => { h.endTime = new Date(endTime) })`.
- [ ] Ajouter :
  ```typescript
  updateHistoryNote(historyId: string, note: string): Promise<void>
  ```
  Effectue `database.write` + `history.update(h => { h.note = note })`.
- [ ] Note : `History` utilise le decorateur `@date('end_time')` donc la valeur doit etre assignee comme `new Date(timestamp)` ou directement en timestamp selon le decorateur. Verifier dans `mobile/src/model/models/History.ts` — le decorateur `@date` accepte les deux.

### 2. Composant WorkoutSummarySheet

- [ ] Creer `mobile/src/components/WorkoutSummarySheet.tsx`.
- [ ] Props :
  ```typescript
  interface WorkoutSummarySheetProps {
    visible: boolean
    onClose: () => void
    durationSeconds: number
    totalVolume: number
    totalSets: number
    totalPrs: number
    historyId: string
  }
  ```
- [ ] Utiliser `<BottomSheet>` (composant existant dans `mobile/src/components/BottomSheet.tsx`) avec `title="Seance terminee !"`.
- [ ] Afficher 4 blocs de stats en grille 2x2 :
  - "Duree" : `MM:SS` calcule depuis `durationSeconds`.
  - "Volume" : `{totalVolume.toFixed(1)} kg`.
  - "Series" : `{totalSets} validees`.
  - "Records" : `{totalPrs} PR`.
- [ ] Chaque bloc est une card (`colors.cardSecondary`, `borderRadius.sm`) avec valeur en grand et label en petit.
- [ ] `TextInput` multi-lignes (`multiline={true}`, `numberOfLines={3}`) pour la note, placeholder "Ajouter une note...".
  - A chaque modification, appeler `updateHistoryNote(historyId, note)` avec un debounce de 500ms (utiliser `useRef` + `setTimeout`/`clearTimeout`).
- [ ] Bouton "Fermer" (`<Button variant="primary" size="lg">`) en bas.
- [ ] Le `BottomSheet` n'est pas fermable par un swipe ou un appui sur l'overlay (passer `onClose` a une fonction vide pour bloquer) — l'utilisateur doit obligatoirement appuyer sur "Fermer".

### 3. Gestion du bouton "Terminer" dans WorkoutScreen

- [ ] Dans `mobile/src/screens/WorkoutScreen.tsx`, ajouter en bas de l'ecran (hors `FlatList`) un footer fixe avec le bouton "Terminer la seance".
- [ ] State : `const confirmEndModal = useModalState()` et `const summarySheet = useModalState()`.
- [ ] Appuyer sur "Terminer" : `haptics.onPress()` + `confirmEndModal.open()`.
- [ ] Apres confirmation : appeler `completeWorkoutHistory(historyId, Date.now())`, calculer `totalPrs` (count de `validatedSets` avec `isPr: true`), puis `summarySheet.open()`, `haptics.onMajorSuccess()`.
- [ ] Le `totalVolume` et le `totalSets` (count des sets valides) sont issus de `useWorkoutState` (deja disponible depuis WEGO-002).
- [ ] `useMultiModalSync([confirmEndModal.isOpen, summarySheet.isOpen])` pour synchroniser la tab bar.

### 4. Gestion du bouton retour Android

- [ ] Dans `mobile/src/screens/WorkoutScreen.tsx`, ajouter un `useEffect` qui s'abonne a `BackHandler.addEventListener('hardwareBackPress', ...)`.
- [ ] Si `summarySheet.isOpen` : intercepter et appeler `handleClose()` (navigation vers Home). Retourner `true`.
- [ ] Si `summarySheet.isOpen === false` (seance en cours) : intercepter, ouvrir une `AlertDialog` "Abandonner la seance ?". Retourner `true`.
- [ ] Nettoyer l'event listener dans le cleanup du `useEffect`.
- [ ] State : `const abandonAlert = useModalState()` pour cette alerte.

### 5. Handler de navigation post-seance

- [ ] Creer la fonction `handleClose()` dans `WorkoutScreen` :
  ```typescript
  const handleClose = () => {
    haptics.onPress()
    navigation.navigate('MainTabs', { screen: 'Home' })
  }
  ```
- [ ] Cette fonction est appelee depuis le bouton "Fermer" du `WorkoutSummarySheet` et depuis le back handler quand le sheet est ouvert.

### 6. Tests

- [ ] Tester `completeWorkoutHistory` : verifie que `end_time` est bien mis a jour.
- [ ] Tester `updateHistoryNote` : verifie la mise a jour de `note`.
- [ ] Tester `WorkoutSummarySheet` : verifie l'affichage des stats, le debounce de la note, le bouton Fermer.
- [ ] Tester le back handler : comportement si summary ouvert vs seance en cours.

## Contraintes WEGOGYM

- **Modals :** `<AlertDialog>` pour les confirmations, `<BottomSheet>` pour le resume — jamais `<Modal>` natif.
- **Donnees :** `completeWorkoutHistory` et `updateHistoryNote` dans `databaseHelpers.ts`.
- **Haptics :** `haptics.onPress()` sur "Terminer" et "Fermer", `haptics.onMajorSuccess()` apres cloture, `haptics.onDelete()` sur "Abandonner".
- **UI :** le `BottomSheet` de resume n'est pas fermable par l'overlay — l'intention est explicite.
- **Navigation :** utiliser `navigation.navigate` vers `MainTabs` plutot que `navigation.goBack()` pour vider la pile.

## Fichiers a creer

- [ ] `mobile/src/components/WorkoutSummarySheet.tsx`

## Fichiers a modifier

- [ ] `mobile/src/model/utils/databaseHelpers.ts` — ajouter `completeWorkoutHistory` et `updateHistoryNote`.
- [ ] `mobile/src/screens/WorkoutScreen.tsx` — ajouter footer, `AlertDialog` confirmation, `AlertDialog` abandon, integration `WorkoutSummarySheet`, back handler.

## Dependances

- Bloque : aucune (story terminale du flux principal)
- Bloque par : WEGO-001 (historyId), WEGO-002 (totalVolume, validatedSets, totalPrs)

## Points de vigilance

- **`@date` decorator et assignation :** le modele `History` utilise `@date('end_time')`. WatermelonDB avec ce decorateur accepte une `Date` en assignation dans `.update()`. Assigner `new Date(endTime)` plutot que le timestamp brut.
- **BottomSheet non fermable :** le composant `BottomSheet.tsx` existant passe `onClose` a l'overlay. Pour bloquer la fermeture, passer `onClose={() => {}}` (pas de fermeture) et ne proposer que le bouton interne.
- **Debounce de la note :** ne pas oublier de flush le debounce dans le `onClose` pour s'assurer que la derniere saisie est bien sauvegardee avant la navigation.
- **Back handler et ordre de priorite :** le `GlobalBackHandler` dans `navigation/index.tsx` intercepte aussi le back Android. Le back handler local de `WorkoutScreen` doit retourner `true` en premier pour court-circuiter le global. La priorite est LIFO sur la pile des listeners.

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables manuellement.
- [ ] `npx tsc --noEmit` passe sans erreur.
- [ ] `npm test -- --watchAll=false` passe.
- [ ] Apres cloture, l'enregistrement `History` en DB a `end_time` non null.
- [ ] La note saisie est persistee en DB apres fermeture.
- [ ] L'utilisateur ne peut pas revenir sur le `WorkoutScreen` avec le bouton retour apres la fermeture.
