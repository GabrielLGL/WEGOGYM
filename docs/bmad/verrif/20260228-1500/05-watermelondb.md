# Passe 5 — WatermelonDB

**Run :** 20260228-1500

---

## Vérification des patterns WatermelonDB

### StatsCalendarScreen.tsx

| Check | Résultat |
|---|---|
| `withObservables` utilisé | ✅ `enhance = withObservables([], () => ({ histories: database.get(...).query(...).observe() }))` |
| Pas de `useState` pour données DB | ✅ Données viennent du HOC observe |
| Mutations dans `database.write()` | ✅ `handleConfirmDelete` : `await database.write(async () => { await target.update(...) })` |
| Soft-delete correct | ✅ `h.deletedAt = new Date()` — pas de `destroyPermanently()` |
| Query filtre `deleted_at` | ✅ `Q.where('deleted_at', null)` dans le query principal |

### gamificationHelpers.ts

| Check | Résultat |
|---|---|
| Pas d'accès DB direct | ✅ Helpers pures (calcul seulement, pas de queries) |
| Types corrects | ✅ `Language`, `MilestoneEvent`, etc. typés strictement |

---

## Schéma v26 — Aucune violation détectée

Aucun `@field`/`@text` orphelin ou désynchronisé détecté dans les fichiers audités.
