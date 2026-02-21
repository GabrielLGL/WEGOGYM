<!-- v1.0 — 2026-02-21 -->
# Rapport — Amélioration offline engine — Groupe A — 20260221-1240

## Objectif
Améliorer la qualité des séances et programmes générés par l'offline engine (`offlineEngine.ts`).
L'engine est déjà bien structuré. Les améliorations ciblées sont :

1. **Utiliser `context.recentMuscles`** — reçu mais ignoré. Doit déprioritiser les exercices des muscles récemment travaillés (7 derniers jours) pour éviter le surentraînement.
2. **Goal `cardio`** — quand `form.goal === 'cardio'`, ajouter au moins 1 exercice cardio dans la sélection finale (exercices dont `primaryMuscle === 'Cardio'` dans le context, ex: Tapis de Course, Vélo, HIIT).
3. **Meilleurs noms de séances** — en mode `session`, le nom doit inclure une indication du goal (ex: "Séance Bodybuilding – Pecs + Dos" au lieu de "Séance Pecs + Dos").
4. **Déprioritisation intelligente dans `selectExercises()`** — actuellement tri sur 2 critères (usedNames, typeOrder). Ajouter un 3ème critère : exercices dont le `primaryMuscle` est dans `recentMuscles` passent APRÈS les exercices non-récents.

## Fichiers concernés
1. `mobile/src/services/ai/offlineEngine.ts` — seul fichier à modifier

## Contexte technique
- CLAUDE.md §3.1 : zéro `any`, TypeScript strict
- CLAUDE.md §5 : DRY principle — pas de duplication de logique
- L'interface `DBContext` (dans `types.ts`) :
  ```typescript
  interface DBContext {
    exercises: ExerciseInfo[]
    recentMuscles: string[]   // ← muscles travaillés les 7 derniers jours
    prs: Record<string, number>
  }
  ```
- `ExerciseInfo` :
  ```typescript
  interface ExerciseInfo { name: string; muscles: string[] }
  ```
- `ExerciseMetadata` :
  ```typescript
  interface ExerciseMetadata {
    type: ExerciseType
    minLevel: AILevel
    isUnilateral: boolean
    primaryMuscle: string
    secondaryMuscles: string[]
  }
  ```
- `CandidateExercise = ExerciseInfo & { meta: ExerciseMetadata | undefined }` — type local à `offlineEngine.ts`
- `AIGoal` : `'bodybuilding' | 'power' | 'renfo' | 'cardio'`

## Étapes

### 1. Modifier `selectExercises()` (ligne ~184) — ajouter `recentMuscles` + tri à 3 critères

**Signature actuelle :**
```typescript
function selectExercises(
  candidates: CandidateExercise[],
  count: number,
  usedNames: Set<string>,
): CandidateExercise[]
```

**Nouvelle signature :**
```typescript
function selectExercises(
  candidates: CandidateExercise[],
  count: number,
  usedNames: Set<string>,
  recentMuscles: string[],
): CandidateExercise[]
```

**Tri à mettre à jour** — critères dans cet ordre de priorité (tri stable, les ex æquo shufflés) :
1. `usedNames.has(name)` → non-utilisés en premier (0 < 1)
2. `recentMuscles.includes(meta?.primaryMuscle)` → muscles non-récents en premier (0 < 1)
3. `TYPE_ORDER[meta.type]` → compound_heavy → compound → accessory → isolation (0 → 3)

```typescript
const sorted = shuffled.sort((a, b) => {
  const aUsed = usedNames.has(a.name) ? 1 : 0
  const bUsed = usedNames.has(b.name) ? 1 : 0
  if (aUsed !== bUsed) return aUsed - bUsed

  const aRecent = (a.meta && recentMuscles.includes(a.meta.primaryMuscle)) ? 1 : 0
  const bRecent = (b.meta && recentMuscles.includes(b.meta.primaryMuscle)) ? 1 : 0
  if (aRecent !== bRecent) return aRecent - bRecent

  const aOrder = a.meta ? TYPE_ORDER[a.meta.type] : 2
  const bOrder = b.meta ? TYPE_ORDER[b.meta.type] : 2
  return aOrder - bOrder
})
```

### 2. Passer `recentMuscles` dans `buildSession()` (ligne ~202)

**Signature actuelle :**
```typescript
function buildSession(
  name: string,
  muscles: string[],
  form: AIFormData,
  context: DBContext,
  usedNames: Set<string>,
): GeneratedSession
```

Dans le corps de `buildSession()`, remplacer les appels à `selectExercises(candidates, count, usedNames)` par `selectExercises(candidates, count, usedNames, context.recentMuscles)`.

### 3. Goal `cardio` — ajouter un exercice cardio dans `buildSession()`

Après la boucle `for (const muscle of muscles)`, avant le tri final :
- Si `form.goal === 'cardio'`
- Et si `allExercises.length > 0`
- Et si `allExercises.length < total` (il reste de la place) — OU remplacer le dernier exercice isolation par un exercice cardio
- Chercher dans `context.exercises` un exercice dont `muscles` contient 'Cardio' (ou dont le nom est dans les exercices cardio connus) qui n'est pas déjà dans `usedNames`
- L'ajouter avec : `setsTarget: 1`, `repsTarget: '20-30 min'`, `weightTarget: 0`
- L'ajouter en dernière position (après le tri)

**Implémentation :**
```typescript
if (form.goal === 'cardio') {
  const cardioEx = context.exercises.find(
    ex => ex.muscles.includes('Cardio') && !usedNames.has(ex.name)
  )
  if (cardioEx) {
    usedNames.add(cardioEx.name)
    allExercises.push({
      exerciseName: cardioEx.name,
      setsTarget: 1,
      repsTarget: '20-30 min',
      weightTarget: 0,
    })
  }
}
```
Placer ce bloc APRÈS le tri final (le cardio reste en dernière position, pas besoin de le trier).

### 4. Meilleur nom de séance en mode `session` (dans `generateSession()`)

**Actuel :**
```typescript
return {
  name: `Séance ${muscleLabel}`,
  sessions: [session],
}
```

**Nouveau :**
```typescript
const goalPrefix: Record<AIGoal, string> = {
  bodybuilding: 'Hypertrophie',
  power:        'Force',
  renfo:        'Renforcement',
  cardio:       'Cardio',
}
return {
  name: `Séance ${goalPrefix[form.goal]} – ${muscleLabel}`,
  sessions: [session],
}
```

### 5. Vérifier TypeScript

Après les modifications, s'assurer que :
- Tous les appels à `selectExercises()` passent le 4ème argument `recentMuscles`
- Le type de `recentMuscles` est `string[]` (compatible avec `context.recentMuscles`)
- Aucun `any` introduit

## Contraintes
- Ne pas modifier : `types.ts`, `exerciseMetadata.ts`, `aiService.ts`, `providerUtils.ts`
- Ne pas modifier : l'interface publique `offlineEngine` (export)
- Ne pas modifier : les constantes `SPLITS`, `SESSION_NAMES`, `SPLIT_LABELS`, `SETS_BY_TYPE_GOAL`, `REPS_BY_TYPE_GOAL`
- Respecter : TypeScript strict, zéro `any`
- Ne pas ajouter de dépendances externes

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- L'engine génère des séances avec des exercices NON-répétés sur muscles récents en priorité
- Mode `cardio` : la séance générée contient au moins 1 exercice cardio (si disponible dans le contexte)
- Nom de séance : "Séance Hypertrophie – Pecs + Dos" au lieu de "Séance Pecs + Dos"
- Tests unitaires existants de l'offlineEngine doivent passer (vérifier s'il y en a dans `__tests__/`)

## Dépendances
Aucune dépendance externe.

## Statut
✅ Résolu — 20260221-1240

## Résolution
Rapport do : docs/bmad/do/20260221-1240-feat-offline-engine-improvements.md
