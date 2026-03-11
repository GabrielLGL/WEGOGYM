# Rapport — fetch() inside write() — 2026-03-11

## Problème
5 fonctions effectuent des `fetch()` ou `find()` à l'intérieur de `database.write()`. WatermelonDB recommande de séparer les lectures (hors write) des mutations (dans write) pour éviter les deadlocks et améliorer les performances.

## Fichiers concernés
- `mobile/src/model/utils/workoutSessionUtils.ts` — 5 fonctions
- `mobile/src/model/models/Exercise.ts` — `deleteAllAssociatedData`
- `mobile/src/model/utils/workoutSetUtils.ts` — `deleteWorkoutSet`

## Commande à lancer
/do docs/bmad/morning/20260311-1900-fetch-outside-write.md

## Contexte
Pattern à appliquer : déplacer les `collection.find()`, `query().fetch()` AVANT le `database.write()`, puis passer les résultats dans le callback write. Ne pas changer la logique métier, seulement restructurer l'ordre lecture/écriture.

Exemple :
```typescript
// AVANT (mauvais)
await database.write(async () => {
  const item = await collection.find(id);
  await item.update(...);
});

// APRÈS (correct)
const item = await collection.find(id);
await database.write(async () => {
  await item.update(...);
});
```

## Critères de validation
- `npx tsc --noEmit` — 0 erreurs
- `npm test` — 1694 tests passent
- Aucun `fetch()` / `find()` / `query().fetch()` à l'intérieur d'un `database.write()` dans ces 3 fichiers

## Statut
✅ Résolu — 20260311-1930

## Résolution
Rapport do : docs/bmad/do/20260311-1930-fix-fetch-outside-write.md
