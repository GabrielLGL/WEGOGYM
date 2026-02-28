# Fix — Durée des séances : nouvelles séances manquantes

**Date :** 2026-02-28 14:00
**Type :** fix
**Statut :** ✅ Terminé

---

## Problème

Les nouvelles séances n'apparaissaient pas dans `StatsDurationScreen` ("Durée des séances") après avoir appuyé sur "Terminer".

**Cause :** Race condition React 18 entre `useState` et `useRef`. Dans `createWorkoutHistory().then()`, `historyRef.current` est mis à jour immédiatement mais `historyId` (state) peut ne pas encore avoir propagé quand l'utilisateur appuie sur "Terminer". Résultat : `completeWorkoutHistory` n'était jamais appelé → `end_time = null` en DB → séance filtrée hors des stats.

---

## Fixes appliqués

### Fix 1 — WorkoutScreen.tsx : priorité au ref
`handleConfirmEnd` (ligne 179) et `handleConfirmAbandon` (ligne 334).

```typescript
// AVANT
if (historyId) {
  await completeWorkoutHistory(historyId, now)...
}

// APRÈS
const activeHistoryId = historyRef.current?.id || historyId
if (activeHistoryId) {
  await completeWorkoutHistory(activeHistoryId, now)...
}
```

Le `useRef` est mis à jour synchroniquement dans le `.then()`, garantissant une valeur même si le re-render React n'a pas encore eu lieu.

### Fix 2 — StatsDurationScreen.tsx : filtre DB sur end_time
```typescript
// AVANT
.query(Q.where('deleted_at', null))

// APRÈS
.query(
  Q.where('deleted_at', null),
  Q.where('end_time', Q.notEq(null)),
)
```

Filtre au niveau DB pour n'observer que les séances terminées — plus prévisible pour WatermelonDB.

### Fix 3 — statsDuration.ts : suppression filtre JS redondant
```typescript
// AVANT
.filter(h => h.deletedAt === null && h.endTime != null)

// APRÈS
.filter(h => h.endTime != null)  // deletedAt garanti par la query
```

---

## Vérification

- `npx tsc --noEmit` → **0 erreur**
- `npm test` (WorkoutScreen + StatsDuration) → **37 tests passés, 0 fail**

---

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `mobile/src/screens/WorkoutScreen.tsx` | Fix 1 — `historyRef.current?.id \|\| historyId` dans `handleConfirmEnd` et `handleConfirmAbandon` |
| `mobile/src/screens/StatsDurationScreen.tsx` | Fix 2 — `Q.where('end_time', Q.notEq(null))` dans la query observable |
| `mobile/src/model/utils/statsDuration.ts` | Fix 3 — Suppression du filtre `deletedAt === null` redondant |
