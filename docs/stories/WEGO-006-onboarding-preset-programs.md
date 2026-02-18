# Story: Onboarding avec programmes pre-configures au premier lancement

**ID:** WEGO-006
**Priorite:** Haute
**Estimation:** 2 jours

## Contexte

Au premier lancement de l'app, la collection `programs` est vide. L'utilisateur doit creer manuellement un programme, puis ses seances, puis ajouter exercice par exercice — une friction enorme qui provoque l'abandon immediat des nouveaux utilisateurs.

La solution est d'afficher une `BottomSheet` d'onboarding au premier lancement de `HomeScreen` (quand `programs.length === 0`), proposant 3 programmes pre-configures importables en un seul tap. Un bouton "Commencer sans programme" permet de passer l'etape. L'etat d'onboarding est persiste dans le modele `User` via un champ `onboarding_completed` — ce champ n'existe pas dans le schema v14 et necessite une migration vers le schema v15.

Les programmes pre-faits utilisent exclusivement les 51 exercices seedes dans `seed.ts` (`BASIC_EXERCISES`), garantissant que les IDs seront resolus en DB.

---

## Acceptance Criteria

- [ ] **AC1:** Au premier lancement (aucun programme en DB ET `user.onboardingCompleted === false`), la BottomSheet d'onboarding s'affiche automatiquement sur `HomeScreen` dans les 500ms apres le montage.
- [ ] **AC2:** La BottomSheet presente 3 cartes de programme : "PPL 3 jours", "Full Body 3 jours", "Push Pull 4 jours", chacune affichant son nom, le nombre de seances et une description courte (2-3 muscles principaux).
- [ ] **AC3:** Appuyer sur une carte importe le programme complet (programme + seances + exercices par seance avec sets/reps/poids cibles) en une transaction DB atomique. L'utilisateur voit immediatement son programme dans `HomeScreen` apres fermeture de la BottomSheet.
- [ ] **AC4:** Apres un import reussi, `user.onboardingCompleted` est mis a `true` — la BottomSheet ne s'affichera plus jamais, meme si l'utilisateur supprime ensuite son programme.
- [ ] **AC5:** Appuyer sur "Commencer sans programme" met aussi `user.onboardingCompleted = true` et ferme la BottomSheet sans creer de programme.
- [ ] **AC6:** Si l'utilisateur a deja des programmes en DB (retour apres desinstallation partielle, ou utilisateur existant), la BottomSheet n'est jamais affichee meme si `onboardingCompleted` est `false`.
- [ ] **AC7:** Pendant l'import (transaction DB), un indicateur visuel (texte "Importation..." ou opacite reduite de la carte) est affiche. Les boutons sont desactives pour eviter un double-tap.
- [ ] **AC8:** Si la transaction DB echoue (erreur inattendue), un message d'erreur est affiche dans la BottomSheet ("Erreur lors de l'importation, veuillez reessayer.") et `onboardingCompleted` reste `false`.

---

## Taches techniques

### 1. Schema DB — Migration v14 vers v15 (`mobile/src/model/schema.ts`)

- [ ] Incrementer `version` de `14` a `15`
- [ ] Ajouter la colonne `{ name: 'onboarding_completed', type: 'boolean' }` dans `tableSchema({ name: 'users', ... })`
- [ ] Note : WatermelonDB gere la migration automatiquement via la version du schema. Si des migrations incrementales sont configurees (fichier `migrations.ts`), verifier s'il existe et y ajouter la migration `addColumns` pour `users`. Si aucun fichier de migrations n'existe, la montee de version seule suffit (WatermelonDB recree le schema).

### 2. Modele `User` (`mobile/src/model/models/User.ts`)

- [ ] Ajouter le decorateur `@field('onboarding_completed') onboardingCompleted!: boolean`
- [ ] Verifier que le `static table = 'users'` est bien present (deja le cas)

### 3. Donnees des programmes pre-faits (`mobile/src/model/onboardingPrograms.ts`) — fichier a creer

Ce fichier contient uniquement la structure de donnees statique, aucun appel DB.

```typescript
export interface PresetSessionExercise {
  exerciseName: string // correspond exactement a un nom dans BASIC_EXERCISES
  setsTarget: number
  repsTarget: string  // ex: "8-12" ou "10"
  weightTarget: number // poids de depart suggere en kg (0 si poids du corps)
}

export interface PresetSession {
  name: string
  exercises: PresetSessionExercise[]
}

export interface PresetProgram {
  name: string
  description: string   // affichee dans la carte onboarding
  sessions: PresetSession[]
}

export const PRESET_PROGRAMS: PresetProgram[] = [
  {
    name: 'PPL 3 jours',
    description: 'Push / Pull / Legs — Pecs, Dos, Cuisses',
    sessions: [
      {
        name: 'Push',
        exercises: [
          { exerciseName: 'Developpé Couché Barre', setsTarget: 4, repsTarget: '8-10', weightTarget: 60 },
          { exerciseName: 'Developpé Incliné Haltères', setsTarget: 3, repsTarget: '10-12', weightTarget: 20 },
          { exerciseName: 'Developpé Militaire', setsTarget: 3, repsTarget: '8-10', weightTarget: 40 },
          { exerciseName: 'Elevations Latérales', setsTarget: 3, repsTarget: '12-15', weightTarget: 8 },
          { exerciseName: 'Extensions Poulie Haute', setsTarget: 3, repsTarget: '12-15', weightTarget: 20 },
          { exerciseName: 'Dips (Triceps focus)', setsTarget: 3, repsTarget: '10-12', weightTarget: 0 },
        ]
      },
      {
        name: 'Pull',
        exercises: [
          { exerciseName: 'Tractions', setsTarget: 4, repsTarget: '6-8', weightTarget: 0 },
          { exerciseName: 'Rowing Barre', setsTarget: 4, repsTarget: '8-10', weightTarget: 60 },
          { exerciseName: 'Tirage Poitrine', setsTarget: 3, repsTarget: '10-12', weightTarget: 50 },
          { exerciseName: 'Rowing Haltere Unilatéral', setsTarget: 3, repsTarget: '10-12', weightTarget: 25 },
          { exerciseName: 'Curl Haltères', setsTarget: 3, repsTarget: '10-12', weightTarget: 14 },
          { exerciseName: 'Curl Barre EZ', setsTarget: 3, repsTarget: '8-10', weightTarget: 30 },
        ]
      },
      {
        name: 'Legs',
        exercises: [
          { exerciseName: 'Squat Arrière', setsTarget: 4, repsTarget: '8-10', weightTarget: 80 },
          { exerciseName: 'Presse a Cuisses', setsTarget: 3, repsTarget: '10-12', weightTarget: 120 },
          { exerciseName: 'Leg Extension', setsTarget: 3, repsTarget: '12-15', weightTarget: 40 },
          { exerciseName: 'Souleve de Terre Roumain', setsTarget: 3, repsTarget: '10-12', weightTarget: 60 },
          { exerciseName: 'Leg Curl Allonge', setsTarget: 3, repsTarget: '12-15', weightTarget: 35 },
          { exerciseName: 'Extensions Mollets Debout', setsTarget: 4, repsTarget: '15-20', weightTarget: 60 },
        ]
      }
    ]
  },
  {
    name: 'Full Body 3 jours',
    description: 'Corps entier — Polyvalent pour debutants',
    sessions: [
      {
        name: 'Full Body A',
        exercises: [
          { exerciseName: 'Squat Arrière', setsTarget: 3, repsTarget: '8-10', weightTarget: 60 },
          { exerciseName: 'Developpé Couché Barre', setsTarget: 3, repsTarget: '8-10', weightTarget: 50 },
          { exerciseName: 'Rowing Barre', setsTarget: 3, repsTarget: '8-10', weightTarget: 50 },
          { exerciseName: 'Developpé Militaire', setsTarget: 3, repsTarget: '10-12', weightTarget: 30 },
          { exerciseName: 'Curl Haltères', setsTarget: 2, repsTarget: '12', weightTarget: 12 },
          { exerciseName: 'Extensions Poulie Haute', setsTarget: 2, repsTarget: '12', weightTarget: 15 },
        ]
      },
      {
        name: 'Full Body B',
        exercises: [
          { exerciseName: 'Souleve de Terre Roumain', setsTarget: 3, repsTarget: '8-10', weightTarget: 60 },
          { exerciseName: 'Developpé Incliné Haltères', setsTarget: 3, repsTarget: '10-12', weightTarget: 16 },
          { exerciseName: 'Tirage Poitrine', setsTarget: 3, repsTarget: '10-12', weightTarget: 45 },
          { exerciseName: 'Elevations Latérales', setsTarget: 3, repsTarget: '12-15', weightTarget: 7 },
          { exerciseName: 'Curl Barre EZ', setsTarget: 2, repsTarget: '10-12', weightTarget: 25 },
          { exerciseName: 'Barre au front', setsTarget: 2, repsTarget: '12', weightTarget: 20 },
        ]
      },
      {
        name: 'Full Body C',
        exercises: [
          { exerciseName: 'Hack Squat', setsTarget: 3, repsTarget: '10-12', weightTarget: 80 },
          { exerciseName: 'Dips (Bas des pecs)', setsTarget: 3, repsTarget: '10-12', weightTarget: 0 },
          { exerciseName: 'Tractions', setsTarget: 3, repsTarget: '6-8', weightTarget: 0 },
          { exerciseName: 'Developpé Haltères Assis', setsTarget: 3, repsTarget: '10-12', weightTarget: 16 },
          { exerciseName: 'Curl Marteau', setsTarget: 2, repsTarget: '12', weightTarget: 12 },
          { exerciseName: 'Extensions Nuque Haltere', setsTarget: 2, repsTarget: '12', weightTarget: 14 },
        ]
      }
    ]
  },
  {
    name: 'Push Pull 4 jours',
    description: 'Push x2 / Pull x2 — Volume intermediaire',
    sessions: [
      {
        name: 'Push A',
        exercises: [
          { exerciseName: 'Developpé Couché Barre', setsTarget: 4, repsTarget: '6-8', weightTarget: 70 },
          { exerciseName: 'Developpé Incliné Haltères', setsTarget: 3, repsTarget: '10-12', weightTarget: 22 },
          { exerciseName: 'Developpé Militaire', setsTarget: 3, repsTarget: '8-10', weightTarget: 45 },
          { exerciseName: 'Elevations Latérales', setsTarget: 4, repsTarget: '12-15', weightTarget: 9 },
          { exerciseName: 'Extensions Poulie Haute', setsTarget: 3, repsTarget: '12-15', weightTarget: 22 },
        ]
      },
      {
        name: 'Pull A',
        exercises: [
          { exerciseName: 'Tractions', setsTarget: 4, repsTarget: '6-8', weightTarget: 0 },
          { exerciseName: 'Rowing Barre', setsTarget: 4, repsTarget: '8-10', weightTarget: 65 },
          { exerciseName: 'Tirage Horizontal', setsTarget: 3, repsTarget: '10-12', weightTarget: 55 },
          { exerciseName: 'Face Pull', setsTarget: 3, repsTarget: '15', weightTarget: 20 },
          { exerciseName: 'Curl Haltères', setsTarget: 3, repsTarget: '10-12', weightTarget: 14 },
        ]
      },
      {
        name: 'Push B',
        exercises: [
          { exerciseName: 'Developpé Couché Haltères', setsTarget: 4, repsTarget: '8-10', weightTarget: 28 },
          { exerciseName: 'Pec Deck (Machine)', setsTarget: 3, repsTarget: '12-15', weightTarget: 40 },
          { exerciseName: 'Developpé Haltères Assis', setsTarget: 3, repsTarget: '10-12', weightTarget: 18 },
          { exerciseName: 'Dips (Triceps focus)', setsTarget: 3, repsTarget: '10-12', weightTarget: 0 },
          { exerciseName: 'Barre au front', setsTarget: 3, repsTarget: '10-12', weightTarget: 25 },
        ]
      },
      {
        name: 'Pull B',
        exercises: [
          { exerciseName: 'Tirage Poitrine', setsTarget: 4, repsTarget: '8-10', weightTarget: 55 },
          { exerciseName: 'Rowing Haltere Unilatéral', setsTarget: 3, repsTarget: '10-12', weightTarget: 28 },
          { exerciseName: 'Pull Over Poulie', setsTarget: 3, repsTarget: '12-15', weightTarget: 25 },
          { exerciseName: 'Shrugs Haltères', setsTarget: 3, repsTarget: '12-15', weightTarget: 30 },
          { exerciseName: 'Curl Barre EZ', setsTarget: 3, repsTarget: '8-10', weightTarget: 35 },
        ]
      }
    ]
  }
]
```

- [ ] Les `exerciseName` doivent correspondre EXACTEMENT aux noms dans `BASIC_EXERCISES` de `seed.ts`. Faire une passe de verification a la creation du fichier.

### 4. Helper d'import dans `databaseHelpers.ts` (`mobile/src/model/utils/databaseHelpers.ts`)

- [ ] Ajouter la fonction `importPresetProgram(preset: PresetProgram): Promise<void>` qui :
  1. Recoit un objet `PresetProgram` (depuis `onboardingPrograms.ts`)
  2. Ouvre une transaction `database.write(async () => { ... })`
  3. Recupere les exercices existants via `database.get<Exercise>('exercises').query().fetch()`
  4. Cree un `Map<string, Exercise>` indexe par `exercise.name` pour les lookups O(1)
  5. Cree le `Program` avec `getNextPosition('programs')` pour la position
  6. Pour chaque session du preset : cree la `Session` avec `getNextPosition('sessions', Q.where('program_id', newProgram.id))`
  7. Pour chaque exercice de la session : recherche dans le `Map` par `exerciseName`, cree le `SessionExercise` avec `setsTarget`, `repsTarget`, `weightTarget`, `position`
  8. Si un exercice du preset n'est pas trouve dans le `Map` : ignorer silencieusement (log console.warn), ne pas faire echouer toute la transaction
  9. Utiliser `database.batch(...)` pour toutes les creations en un seul appel apres avoir prepare tous les records avec `prepareCreate`
- [ ] Ajouter la fonction `markOnboardingCompleted(): Promise<void>` qui recupere le premier `User` et le met a jour : `u.onboardingCompleted = true`
- [ ] Typer strictement avec l'interface `PresetProgram` importee depuis `onboardingPrograms.ts`

### 5. Composant `OnboardingSheet` (`mobile/src/components/OnboardingSheet.tsx`) — fichier a creer

- [ ] Props : `visible: boolean`, `onClose: () => void`, `onProgramSelected: (preset: PresetProgram) => Promise<void>`, `onSkip: () => void`
- [ ] Utiliser `<BottomSheet visible={visible} onClose={onClose} title="Choisissez votre programme">` (composant existant)
- [ ] Afficher les 3 cartes depuis `PRESET_PROGRAMS` via `FlatList` ou map
- [ ] Chaque carte affiche : `preset.name` (titre bold), `preset.description` (sous-titre gris), `${preset.sessions.length} seances` (badge)
- [ ] Etat local `isImporting: boolean` (gere le disabled + indicateur "Importation...")
- [ ] `onPress` d'une carte : `setIsImporting(true)`, appel `onProgramSelected(preset)`, `setIsImporting(false)`
- [ ] Bouton "Commencer sans programme" en bas de sheet, style ghost, appelle `onSkip()`
- [ ] Haptics : `haptics.onSelect()` sur tap carte, `haptics.onSuccess()` apres import reussi, `haptics.onPress()` sur "Commencer sans programme"
- [ ] Si `isImporting`, toutes les cartes et le bouton skip sont `disabled` (style opacite 0.5)

### 6. Modification de `HomeScreen` (`mobile/src/screens/HomeScreen.tsx`)

- [ ] Ajouter `user: User | null` aux props de `HomeScreen` (deja observee via `withObservables`)
- [ ] Dans `withObservables` en bas du fichier : ajouter `user: database.get<User>('users').query().observe().pipe(map(list => list[0] || null))` (pattern existant dans `WorkoutScreen`)
- [ ] Importer `map` depuis `rxjs/operators`
- [ ] Ajouter l'etat `const [isOnboardingVisible, setIsOnboardingVisible] = useState(false)`
- [ ] Ajouter dans `useMultiModalSync` : `isOnboardingVisible`
- [ ] Ajouter un `useEffect` sur `[programs, user]` : si `programs.length === 0 && user && !user.onboardingCompleted`, appeler `setIsOnboardingVisible(true)` apres un timeout de 400ms (laisser le temps au mount de se stabiliser). Nettoyer le timeout au cleanup.
- [ ] Handler `handleProgramSelected(preset: PresetProgram)` : appelle `importPresetProgram(preset)`, puis `markOnboardingCompleted()`, puis `setIsOnboardingVisible(false)`, puis `haptics.onSuccess()`
- [ ] Handler `handleSkipOnboarding()` : appelle `markOnboardingCompleted()`, puis `setIsOnboardingVisible(false)`
- [ ] Ajouter `<OnboardingSheet visible={isOnboardingVisible} onClose={() => setIsOnboardingVisible(false)} onProgramSelected={handleProgramSelected} onSkip={handleSkipOnboarding} />` dans le JSX (avant `</GestureHandlerRootView>`)
- [ ] Gerer les erreurs dans `handleProgramSelected` avec un `try/catch` — en cas d'erreur, ne pas appeler `markOnboardingCompleted()`

### 7. Tests

#### `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` (fichier existant)

- [ ] Ajouter tests pour `importPresetProgram` :
  - Tester qu'un programme PPL est cree avec 3 sessions et les exercices correspondants
  - Tester le cas ou un exercice du preset n'est pas trouve (log warn, pas de crash)
- [ ] Ajouter test pour `markOnboardingCompleted` : le champ passe a `true`

#### `mobile/src/components/__tests__/OnboardingSheet.test.tsx` — fichier a creer

- [ ] Tester le rendu des 3 cartes de preset
- [ ] Tester que le tap sur une carte appelle `onProgramSelected` avec le bon preset
- [ ] Tester que le bouton "Commencer sans programme" appelle `onSkip`
- [ ] Tester que `isImporting` desactive les interactions

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

- **Transaction atomique :** Tout l'import (programme + seances + exercices) doit etre dans un seul `database.write(...)`. Si une creation echoue, rien n'est persiste.
- **`database.batch` obligatoire :** Preparer tous les records avec `prepareCreate` puis les passer en un seul `database.batch(...)`. Ne jamais faire de `await collection.create(...)` en boucle.
- **Migration schema :** Le champ `onboarding_completed` n'existe pas dans le schema v14. La montee en v15 est obligatoire. Sur un appareil existant, WatermelonDB appliquera la migration au prochain lancement.
- **Exercices seedes :** Les noms dans `PRESET_PROGRAMS` doivent etre identiques aux noms dans `BASIC_EXERCISES`. Une divergence de nom (accent, casse) rend l'exercice introuvable. Faire une verification manuelle avant merge.
- **Condition d'affichage double :** La BottomSheet ne s'affiche que si `programs.length === 0` ET `user.onboardingCompleted === false`. Les deux conditions sont necessaires pour eviter d'empecher un utilisateur avance qui aurait supprime tous ses programmes.

---

## Fichiers a creer

- [ ] `mobile/src/model/onboardingPrograms.ts` (donnees statiques des presets)
- [ ] `mobile/src/components/OnboardingSheet.tsx` (composant BottomSheet onboarding)
- [ ] `mobile/src/components/__tests__/OnboardingSheet.test.tsx` (tests composant)

## Fichiers a modifier

- [ ] `mobile/src/model/schema.ts` — Version 14 -> 15, ajout colonne `onboarding_completed` dans `users`
- [ ] `mobile/src/model/models/User.ts` — Ajout du decorateur `@field('onboarding_completed') onboardingCompleted!: boolean`
- [ ] `mobile/src/model/utils/databaseHelpers.ts` — Ajout de `importPresetProgram` et `markOnboardingCompleted`
- [ ] `mobile/src/screens/HomeScreen.tsx` — Ajout de l'observation `user`, du `useEffect` de detection, des handlers, et du composant `<OnboardingSheet>`
- [ ] `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` — Nouveaux tests

---

## Dependances

- Bloque : rien
- Bloquee par : Sprint 1 (seed des exercices doit etre effectue — DONE), schema v14 existant

---

## Definition of Done

- [ ] Tous les AC sont satisfaits et verifiables
- [ ] Sur appareil vierge (ou apres `npx expo run:android` avec DB effacee) : la BottomSheet s'affiche au premier lancement
- [ ] Tap sur "PPL 3 jours" : le programme apparait immediatement dans HomeScreen avec ses 3 seances
- [ ] Relancer l'app : la BottomSheet ne s'affiche plus
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm test -- --watchAll=false` passe
- [ ] Revue par `wegogym-architect` : changement de schema (migration v15) et modification de `HomeScreen`
