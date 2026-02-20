# FIX(databaseHelpers, WorkoutScreen, useWorkoutState) — bugs silencieux 20260220-2230
Date : 2026-02-20 22:40

## Instruction
docs/bmad/verrif/bugs-20260220-2230.md

## Rapport source
docs/bmad/verrif/bugs-20260220-2230.md

## Classification
Type : fix
Fichiers modifiés :
- `mobile/src/model/utils/databaseHelpers.ts`
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/hooks/useWorkoutState.ts`
- `mobile/src/model/utils/__tests__/databaseHelpers.test.ts` (mocks mis à jour)

## Ce qui a été fait

### 1. CRITIQUE — databaseHelpers.ts (lignes 304-308)
Remplacé `Promise.all(historyIds.map(id => database.get('histories').find(id)))` par une query filtrée :
```typescript
const histories = await database
  .get<History>('histories')
  .query(Q.where('id', Q.oneOf(historyIds)))
  .fetch()

if (histories.length === 0) return null
```
- Élimine le risque `RecordNotFound` si une history est `destroyPermanently()`.
- Élimine le crash `undefined.id` si l'array est vide.
- Mise à jour des mocks des 2 tests concernés (`.find()` → `query().fetch()`).

### 2. WARNING — WorkoutScreen.tsx (lignes 103-108)
Ajout d'un `Alert.alert` dans le `.catch` de `createWorkoutHistory` pour informer l'utilisateur en production si la création échoue (+ navigation `.goBack()`). Ajout de `Alert` aux imports React Native.

### 3. WARNING — useWorkoutState.ts (lignes 68-70)
Ajout d'un commentaire explicite documentant l'intention du `// eslint-disable-next-line react-hooks/exhaustive-deps` avec `[]` : initialisation unique au mount, les saisies en cours ne sont pas réinitialisées si le HOC re-render avec de nouveaux exercises.

## Vérification
- TypeScript : ✅ 0 erreur (`npx tsc --noEmit`)
- Tests : ✅ 102 passed, 0 failed
- Nouveau test créé : non (mocks existants mis à jour)

## Documentation mise à jour
Aucune modification de CLAUDE.md nécessaire (patterns déjà documentés).

## Statut
✅ Résolu — 20260220-2240

## Commit
9ce97aa fix(databaseHelpers,WorkoutScreen): silent crash + prod error feedback
