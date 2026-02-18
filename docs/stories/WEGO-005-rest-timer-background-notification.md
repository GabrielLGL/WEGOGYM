# Story: Notification locale de fin de repos en arriere-plan

**ID:** WEGO-005
**Priorite:** Haute
**Estimation:** 1.5 jour(s)

## Contexte

Le composant `RestTimer` (`components/RestTimer.tsx`) gere un decompte de repos apres chaque serie validee dans `WorkoutScreen`. Il fonctionne uniquement en foreground : si l'utilisateur eteint l'ecran ou bascule vers une autre app, le timer continue de tourner silencieusement et l'athlete ne sait pas que son temps de repos est ecoule.

La solution consiste a programmer une notification locale via `expo-notifications` au moment ou le timer demarre. Cette notification se declenchera a l'heure de fin calculee (timestamp exact), meme si l'app est en arriere-plan. Si l'utilisateur ignore le timer manuellement avant la fin, la notification programmee est annulee.

`expo-notifications` n'est pas encore dans `package.json` — il devra etre installe.

---

## Acceptance Criteria

- [ ] **AC1:** Quand le `RestTimer` demarre (montage du composant), une notification locale est programmee pour se declencher a `Date.now() + duration * 1000`.
- [ ] **AC2:** La notification affiche le titre "Fin du repos !" et le corps "Retournez a votre entrainement.".
- [ ] **AC3:** Si l'utilisateur appuie sur "Ignorer" dans le `RestTimer` avant la fin du decompte, la notification programmee est annulee (pas de notification fantome).
- [ ] **AC4:** Quand le timer atteint zero naturellement (fin normale), la notification programmee est egalement annulee — c'est l'haptic qui prend le relais, pas la notification.
- [ ] **AC5:** Sur Android 13+ (API 33+), si la permission `POST_NOTIFICATIONS` n'est pas accordee, le timer fonctionne normalement sans notification (degrade silencieux, aucun crash).
- [ ] **AC6:** Si le timer est redemarre (nouvelle serie validee) alors qu'une notification precedente est deja programmee, l'ancienne est annulee avant d'en programmer une nouvelle (pas de doublon).
- [ ] **AC7:** La fonctionnalite est conditionnee a `user.timerEnabled === true` — si le timer est desactive dans les reglages, aucune notification n'est programmee.

---

## Taches techniques

### 1. Installation de la dependance

- [ ] Ajouter `expo-notifications` : `npx expo install expo-notifications`
- [ ] Verifier que la version installee est compatible Expo SDK 52 (verifier `expo-notifications` >= 0.29.x dans le `package.json` resultant)
- [ ] Verifier que le plugin est declare dans `app.json` / `app.config.js` sous `expo.plugins` si necessaire pour le build natif

### 2. Service de notifications (`mobile/src/services/notificationService.ts`) — fichier a creer

- [ ] Creer la fonction `requestNotificationPermission(): Promise<boolean>` qui appelle `Notifications.requestPermissionsAsync()` et retourne `true` si accordee
- [ ] Creer la fonction `scheduleRestEndNotification(durationSeconds: number): Promise<string | null>` qui :
  - Programme un trigger `{ type: 'date', date: new Date(Date.now() + durationSeconds * 1000) }`
  - Retourne l'`identifier` de la notification programmee (string) ou `null` si la permission est absente
  - Utilise le canal Android `rest-timer` (voir tache suivante)
- [ ] Creer la fonction `cancelNotification(identifier: string): Promise<void>` qui appelle `Notifications.cancelScheduledNotificationAsync(identifier)`
- [ ] Creer la fonction `setupNotificationChannel(): void` qui appelle `Notifications.setNotificationChannelAsync('rest-timer', { name: 'Timer de repos', importance: Notifications.AndroidImportance.HIGH, sound: 'default', vibrationPattern: [0, 250, 250, 250] })` — a appeler une seule fois au demarrage (Android uniquement)
- [ ] Typer strictement toutes les fonctions, pas de `any`

### 3. Initialisation au demarrage (`mobile/src/model/index.ts` ou point d'entree)

- [ ] Appeler `setupNotificationChannel()` au demarrage de l'app (dans `model/index.ts` apres l'init DB, ou dans `App.tsx` / `navigation/index.tsx`)
- [ ] Envelopper l'appel dans `Platform.OS === 'android'` pour le canal

### 4. Modification du composant `RestTimer` (`mobile/src/components/RestTimer.tsx`)

- [ ] Ajouter la prop optionnelle `notificationEnabled?: boolean` a l'interface `Props` (transmise depuis `WorkoutScreen` selon `user.timerEnabled`)
- [ ] Dans le `useEffect` initial (au montage) : appeler `scheduleRestEndNotification(duration)` si `notificationEnabled` est `true`, stocker l'`identifier` retourne dans un `useRef<string | null>`
- [ ] Dans `closeTimer` (bouton "Ignorer") : si `notificationIdRef.current` est non null, appeler `cancelNotification(notificationIdRef.current)` avant l'animation de fermeture
- [ ] Dans `finishTimer` (fin naturelle du decompte) : si `notificationIdRef.current` est non null, appeler `cancelNotification(notificationIdRef.current)` — la notification ne doit pas s'afficher puisque l'app est en foreground et l'haptic suffit
- [ ] Le composant ne demande PAS la permission lui-meme — c'est `notificationService.ts` qui gere le cas "permission absente" en retournant `null`

### 5. Modification de `WorkoutScreen` (`mobile/src/screens/WorkoutScreen.tsx`)

- [ ] Dans `handleValidateSet` : passer `notificationEnabled={user?.timerEnabled ?? false}` au composant `<RestTimer>`
- [ ] Appeler `requestNotificationPermission()` dans un `useEffect` au montage du `WorkoutContent` (une seule demande par session), stocker le resultat dans un `useRef<boolean>` local
- [ ] Passer ce resultat booleen comme `notificationEnabled` au `RestTimer`

### 6. Tests (`mobile/src/services/__tests__/notificationService.test.ts`) — fichier a creer

- [ ] Mocker `expo-notifications` (`jest.mock('expo-notifications', ...)`)
- [ ] Tester que `scheduleRestEndNotification(90)` appelle `Notifications.scheduleNotificationAsync` avec un trigger date a environ `Date.now() + 90000`
- [ ] Tester que `cancelNotification('some-id')` appelle `Notifications.cancelScheduledNotificationAsync('some-id')`
- [ ] Tester que si la permission est refusee, `scheduleRestEndNotification` retourne `null` sans lever d'erreur

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

- **Expo Managed Workflow :** Ne pas utiliser de modules natifs custom. `expo-notifications` est l'unique solution autorisee.
- **Pas de background task :** L'approche est une notification programmee (`scheduleNotificationAsync` avec trigger `date`), pas un service de fond. Aucun `TaskManager` ou `BackgroundFetch` n'est necessaire.
- **Android uniquement prioritaire :** Le canal `setNotificationChannelAsync` est requis sur Android 8+. Sur iOS, le comportement est gere automatiquement par `expo-notifications`.
- **Degrade gracieux :** Si `expo-notifications` n'est pas encore installe dans l'environnement de dev, les imports doivent etre dans un `try/catch` ou conditionnes — le timer foreground doit continuer a fonctionner.
- **Pas de double notification :** Toujours annuler l'identifiant precedent avant d'en programmer un nouveau (le `useRef` dans `RestTimer` sert a ca).

---

## Fichiers a creer

- [ ] `mobile/src/services/notificationService.ts` (nouveau service)
- [ ] `mobile/src/services/__tests__/notificationService.test.ts` (tests unitaires)

## Fichiers a modifier

- [ ] `mobile/src/components/RestTimer.tsx` — Ajouter prop `notificationEnabled`, appels schedule/cancel dans les hooks existants
- [ ] `mobile/src/screens/WorkoutScreen.tsx` — Demande de permission au montage, passage de `notificationEnabled` au `RestTimer`
- [ ] `mobile/package.json` — Ajout de `expo-notifications` via `npx expo install`
- [ ] `app.json` ou `app.config.js` (racine ou `mobile/`) — Ajouter le plugin `expo-notifications` si requis par le build

---

## Dependances

- Bloque : rien (story independante)
- Bloquee par : WEGO-001 (WorkoutScreen doit exister — DONE Sprint 1)

---

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables
- [ ] Sur Android physique : poser le telephone pendant un repos de 30s — la notification apparait dans le tiroir de notifications
- [ ] Sur Android physique : appuyer sur "Ignorer" avant la fin — aucune notification ne s'affiche ensuite
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm test -- --watchAll=false` passe (tests `notificationService.test.ts`)
- [ ] Revue par `wegogym-architect` si le plugin `expo-notifications` modifie `app.json`
