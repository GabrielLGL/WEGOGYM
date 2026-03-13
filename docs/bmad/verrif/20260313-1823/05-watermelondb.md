# Passe 5 — Cohérence WatermelonDB — 20260313-1823

## Résultat global : ✅ QUASI-CLEAN

### Schéma v38 → migrations ✅
- Toutes les migrations présentes v27 → v38
- `progress_photos` : migration v36 ✅
- `friend_snapshots` : migration v37 ✅
- `wearable_sync_logs` : migration v38 ✅

### Modèles vs schéma ✅
- `FriendSnapshot` : tous les champs matchent ✅
- `ProgressPhoto` : tous les champs matchent ✅
- `WearableSyncLog` : présent en v38 ✅

### Tous les modèles enregistrés dans model/index.ts ✅
`FriendSnapshot`, `ProgressPhoto`, `WearableSyncLog` → tous présents

## 🔵 Suggestion mineure

### DB1 — `ProgressPhoto` : `@field` au lieu de `@text` pour colonnes string
**Fichier**: `mobile/src/model/models/ProgressPhoto.ts:13-15`
```typescript
@field('photo_uri') photoUri!: string      // devrait être @text
@field('category') category!: string | null // devrait être @text
@field('note') note!: string | null         // devrait être @text
```
Par convention WatermelonDB, `@text` est pour les colonnes string, `@field` pour les types numériques/booléens. Fonctionnellement équivalent mais incohérent avec le reste du projet.

---
**Score WatermelonDB** : cohérent, 0 critique, 1 suggestion mineure
