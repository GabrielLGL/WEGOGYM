# Sprint 1 — Vue d'ensemble et ordre d'implementation

**Date de redaction :** 2026-02-18
**Duree estimee du sprint :** 5.5 jours

## Stories du sprint

| ID | Titre | Estimation | Priorite | Bloque par |
|----|-------|-----------|---------|------------|
| WEGO-001 | Lancer une seance et initialiser le WorkoutScreen | 1 jour | Haute | rien |
| WEGO-002 | Saisir et valider une serie en seance | 2 jours | Haute | WEGO-001 |
| WEGO-003 | Terminer la seance et afficher le resume | 1.5 jours | Haute | WEGO-001, WEGO-002 |
| WEGO-004 | Afficher la derniere performance par exercice | 1 jour | Moyenne | WEGO-001, WEGO-002 |

## Ordre d'implementation recommande

```
WEGO-001
    |
    +---> WEGO-002
    |         |
    |         +---> WEGO-003  (peut demarrer des que useWorkoutState est pret)
    |         |
    |         +---> WEGO-004  (peut demarrer en parallele de WEGO-003)
```

WEGO-003 et WEGO-004 peuvent etre developpees en parallele par deux developpeurs une fois WEGO-002 terminee, puisqu'elles touchent des fichiers distincts (WEGO-003 touche le bas de `WorkoutScreen` et cree `WorkoutSummarySheet`, WEGO-004 touche les cards et cree `LastPerformanceBadge`).

## Carte des fichiers du sprint

### Fichiers crees (nouveaux)

```
mobile/src/
├── screens/
│   └── WorkoutScreen.tsx                    (WEGO-001)
├── components/
│   ├── WorkoutHeader.tsx                    (WEGO-001)
│   ├── WorkoutExerciseCard.tsx              (WEGO-002)
│   ├── WorkoutSummarySheet.tsx              (WEGO-003)
│   └── LastPerformanceBadge.tsx             (WEGO-004)
├── hooks/
│   ├── useWorkoutTimer.ts                   (WEGO-001)
│   └── useWorkoutState.ts                   (WEGO-002)
└── types/
    └── workout.ts                           (WEGO-002, complete par WEGO-004)
```

### Fichiers modifies (existants)

```
mobile/src/
├── navigation/index.tsx                     (WEGO-001 : route Workout)
├── screens/
│   └── SessionDetailScreen.tsx             (WEGO-001 : bouton Lancer)
└── model/utils/
    ├── databaseHelpers.ts                   (WEGO-001, 002, 003, 004)
    └── validationHelpers.ts                 (WEGO-002)
```

## Fonctions ajoutees dans databaseHelpers.ts

Par ordre d'ajout (a implementer dans cet ordre pour eviter les conflits) :

1. `createWorkoutHistory(sessionId)` — WEGO-001
2. `saveWorkoutSet(params)` — WEGO-002
3. `getMaxWeightForExercise(exerciseId, excludeHistoryId)` — WEGO-002
4. `completeWorkoutHistory(historyId, endTime)` — WEGO-003
5. `updateHistoryNote(historyId, note)` — WEGO-003
6. `getLastPerformanceForExercise(exerciseId, excludeHistoryId)` — WEGO-004
7. `formatRelativeDate(date)` — WEGO-004

## Schema DB

Aucune modification du schema pour ce sprint. Le schema v14 contient deja :
- `histories` avec `start_time`, `end_time`, `note`, `session_id`, `deleted_at`.
- `sets` avec `history_id`, `exercise_id`, `weight`, `reps`, `set_order`, `is_pr`.

## Points d'attention transversaux

### Fabric / New Architecture
- Aucun `<Modal>` natif. Toutes les modales passent par `<AlertDialog>` ou `<BottomSheet>` avec `<Portal>` de `@gorhom/portal`.
- Le `PortalProvider` est deja en place dans `mobile/src/navigation/index.tsx`.

### Gestion du historyId
Le `historyId` est cree au montage de `WorkoutScreen` (WEGO-001) via `createWorkoutHistory`. Il est stocke dans un `useRef` pour etre disponible tout au long du cycle de vie de l'ecran sans provoquer de re-render. Il est passe en prop explicite aux composants qui en ont besoin (`WorkoutExerciseCard` pour WEGO-004, fonctions de cloture pour WEGO-003).

### Source de verite des performances
Pour ce sprint, les stats "derniere fois" lisent depuis la table `sets` (liee a `histories`). La table `performance_logs` est encore utilisee par `SessionExerciseItem` dans `SessionDetailScreen` — cette migration sera faite apres Sprint 1 et n'est pas dans le perimetre de ces stories.

### Tests
Chaque story inclut ses propres tests unitaires. Executer `npm test -- --watchAll=false` apres chaque story avant de passer a la suivante.

### Revue architecturale
La route `Workout` ajoutee dans `navigation/index.tsx` (WEGO-001) doit etre revue par `wegogym-architect` avant merge, car elle modifie `RootStackParamList` qui impacte toute la navigation.
