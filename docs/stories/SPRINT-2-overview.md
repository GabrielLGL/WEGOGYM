# Sprint 2 — Vue d'ensemble et ordre d'implementation

**Date de redaction :** 2026-02-18
**Duree estimee du sprint :** 5 jours

---

## Stories du sprint

| ID | Titre | Estimation | Priorite | Bloquee par | Fichiers principaux |
|----|-------|-----------|---------|-------------|---------------------|
| WEGO-005 | Notification locale de fin de repos en arriere-plan | 1.5 jour | Haute | WEGO-001 (DONE) | `RestTimer.tsx`, `WorkoutScreen.tsx`, `notificationService.ts` (nouveau) |
| WEGO-006 | Onboarding avec programmes pre-configures | 2 jours | Haute | Sprint 1 seed (DONE) | `HomeScreen.tsx`, `schema.ts` (v15), `User.ts`, `OnboardingSheet.tsx` (nouveau) |
| WEGO-007 | Migration stats ChartsScreen vers `sets` | 1.5 jour | Haute | WEGO-002 (DONE) | `ChartsScreen.tsx`, `databaseHelpers.ts` |

---

## Ordre d'implementation recommande

Les 3 stories sont independantes et peuvent etre developpees en parallele sur des branches separees. Seul `databaseHelpers.ts` est partage par WEGO-006 et WEGO-007 — coordonner les additions pour eviter les conflits de merge.

```
Sprint 1 (DONE)
    |
    +---> WEGO-005  (1.5j) — independante, branche feature/wego-005
    |
    +---> WEGO-006  (2j)   — independante, branche feature/wego-006
    |         |
    |         * schema v14 -> v15 (migration User.onboarding_completed)
    |
    +---> WEGO-007  (1.5j) — independante, branche feature/wego-007
              |
              * databaseHelpers.ts : ajouter getExerciseStatsFromSets
              * coordonner avec WEGO-006 si merge en meme temps
```

**Sequence recommandee si un seul developpeur :**

1. **WEGO-007 en premier** (le plus technique, refactorisation isolee, risque zero sur le schema)
2. **WEGO-006 ensuite** (migration schema — risque le plus eleve, a merger apres validation de WEGO-007)
3. **WEGO-005 en dernier** (ajout de dependance externe `expo-notifications`, verification build Android)

---

## Carte des fichiers du sprint

### Fichiers crees (nouveaux)

```
mobile/src/
├── services/
│   ├── notificationService.ts               (WEGO-005)
│   └── __tests__/
│       └── notificationService.test.ts      (WEGO-005)
├── model/
│   └── onboardingPrograms.ts                (WEGO-006 — donnees statiques)
└── components/
    ├── OnboardingSheet.tsx                  (WEGO-006)
    └── __tests__/
        └── OnboardingSheet.test.tsx         (WEGO-006)
```

### Fichiers modifies (existants)

```
mobile/src/
├── model/
│   ├── schema.ts                            (WEGO-006 : v14 -> v15, colonne onboarding_completed)
│   ├── models/
│   │   └── User.ts                         (WEGO-006 : decorateur onboardingCompleted)
│   └── utils/
│       ├── databaseHelpers.ts              (WEGO-006 : importPresetProgram, markOnboardingCompleted)
│       │                                   (WEGO-007 : getExerciseStatsFromSets, ExerciseSessionStat)
│       └── __tests__/
│           └── databaseHelpers.test.ts     (WEGO-006 + WEGO-007 : nouveaux tests)
├── components/
│   └── RestTimer.tsx                       (WEGO-005 : prop notificationEnabled, calls schedule/cancel)
└── screens/
    ├── WorkoutScreen.tsx                   (WEGO-005 : requestPermission, passage notificationEnabled)
    ├── HomeScreen.tsx                      (WEGO-006 : observation user, useEffect onboarding, OnboardingSheet)
    └── ChartsScreen.tsx                    (WEGO-007 : refactorisation complete source de donnees)
```

### Dependance externe ajoutee

```
mobile/package.json
└── expo-notifications  ~0.29.x             (WEGO-005 : via npx expo install)
```

---

## Schema DB

### WEGO-006 : Migration v14 -> v15

Seul changement de schema de ce sprint. Un seul champ ajoute :

```
Table : users
  + onboarding_completed  BOOLEAN  (default implicite false pour lignes existantes)
```

**Impact migration :** WatermelonDB applique la migration au prochain lancement sur les appareils existants. Le champ sera `false` (valeur par defaut SQLite pour BOOLEAN non renseigne = 0) pour l'utilisateur existant — ce qui est le comportement voulu : il verra l'onboarding si sa collection `programs` est vide.

**Fichier de migrations WatermelonDB :** Si un fichier `mobile/src/model/migrations.ts` existe, y ajouter un bloc `addColumns`. Sinon, la montee de version seule est suffisante (WatermelonDB recreera le schema a partir de zero en effacant les donnees existantes si aucune migration n'est fournie — verifier ce comportement avant merge).

### WEGO-005 et WEGO-007 : Aucune modification de schema

---

## Fonctions ajoutees dans `databaseHelpers.ts`

Par ordre d'ajout recommande (WEGO-007 en premier, WEGO-006 ensuite) :

| Fonction | Story | Description |
|----------|-------|-------------|
| `ExerciseSessionStat` (interface) | WEGO-007 | Type retourne par les stats |
| `getExerciseStatsFromSets(exerciseId)` | WEGO-007 | Stats d'un exercice depuis `sets` groupes par history |
| `importPresetProgram(preset)` | WEGO-006 | Transaction atomique : programme + seances + exercices |
| `markOnboardingCompleted()` | WEGO-006 | Met `User.onboardingCompleted = true` |

---

## Points d'attention transversaux

### Fabric / New Architecture (Expo 52, New Arch)

- Aucun `<Modal>` natif dans aucune des 3 stories. `OnboardingSheet` (WEGO-006) utilise le composant `<BottomSheet>` existant.
- `expo-notifications` (WEGO-005) doit etre compatible Expo SDK 52 / New Architecture. Verifier la compatibilite dans les release notes avant `npx expo install`.

### Relations WatermelonDB et `useMemo`

Pattern critique pour WEGO-007 : les relations `@relation` de WatermelonDB (ex: `set.history`) exposent `.id` de maniere synchrone (c'est la foreign key en memoire) mais `.fetch()` de maniere asynchrone. Dans les `useMemo` de `ChartsScreen`, utiliser exclusivement `s.history.id` pour les groupements. Les objets `History` complets (pour `startTime`) doivent etre injectes via un `withObservables` dedie dans un sous-composant.

### `database.batch` obligatoire pour les imports en masse

WEGO-006 : l'import d'un programme pre-configure cree potentiellement 30 a 40 enregistrements (1 programme + 3-4 seances + 5-6 exercices par seance). Utiliser impetrativement `prepareCreate` + `database.batch(...)` dans une seule `database.write(...)`. Ne jamais boucler sur `await collection.create(...)`.

### Gestion des permissions Android (WEGO-005)

Sur Android 13+ (API 33+), la permission `POST_NOTIFICATIONS` est requise au runtime. `expo-notifications` expose `requestPermissionsAsync()` qui declenche la popup systeme. Appeler cette fonction une seule fois par session de workout (au montage de `WorkoutContent`), pas a chaque serie. Le degrade si refus : le timer foreground continue de fonctionner normalement, aucun crash, aucune notification.

### Tests avant merge

Chaque story a ses propres tests. Executer `npm test -- --watchAll=false` apres chaque story. L'ordre des suites de tests a verifier :

1. `validationHelpers.test.ts` — ne doit pas regressionner
2. `databaseHelpers.test.ts` — inclut les nouveaux tests WEGO-006 et WEGO-007
3. `notificationService.test.ts` — nouveau, WEGO-005
4. `OnboardingSheet.test.tsx` — nouveau, WEGO-006
5. `AlertDialog.test.tsx`, `Button.test.tsx`, `useHaptics.test.ts`, `useModalState.test.ts` — ne doivent pas regressionner

### Revues architecturales requises

| Story | Changement | Raison |
|-------|-----------|--------|
| WEGO-005 | Ajout plugin `expo-notifications` dans `app.json` | Modification config build Android |
| WEGO-006 | Migration schema v14 -> v15 | Impact sur toutes les installations existantes |
| WEGO-006 | Modification `HomeScreen` (observation `user`) | Ajout d'une observable dans le composant le plus utilise |
| WEGO-007 | Sous-composant `withObservables` imbrique dans `ChartsScreen` | Pattern architectural non encore utilise dans la codebase |

---

## Risques et mitigations

| Risque | Probabilite | Impact | Mitigation |
|--------|------------|--------|-----------|
| `expo-notifications` incompatible Expo 52 New Arch | Faible | Haut | Verifier les release notes / GitHub issues avant install. Version cible : `~0.29.x` |
| Migration schema v15 efface les donnees existantes | Faible (si migrations.ts absent) | Tres haut | Verifier si `mobile/src/model/migrations.ts` existe. Si non : creer ce fichier avec `addColumns` avant de monter la version |
| Noms d'exercices dans `PRESET_PROGRAMS` ne correspondent pas au seed | Moyen | Moyen | Faire une verification manuelle des noms avant merge (copier-coller depuis `BASIC_EXERCISES`) |
| `performance_logs` encore referencies ailleurs | Faible | Moyen | Grep `performance_logs` dans tout `mobile/src/` avant merge de WEGO-007 pour s'assurer qu'aucun autre ecran ne lit cette table |

---

## Checklist de fin de sprint

- [ ] WEGO-005 : notification testee sur appareil physique Android (ecran eteint pendant 30s)
- [ ] WEGO-006 : onboarding teste sur DB vierge (reinstall ou clear data)
- [ ] WEGO-006 : onboarding non affiche sur DB avec programmes existants
- [ ] WEGO-007 : stats visibles apres une seance complete, `performance_logs` non affiches
- [ ] `npx tsc --noEmit` passe sans erreur sur la branche de merge
- [ ] `npm test -- --watchAll=false` passe (toutes les suites)
- [ ] Toutes les revues architecturales effectuees et approuvees par `wegogym-architect`
