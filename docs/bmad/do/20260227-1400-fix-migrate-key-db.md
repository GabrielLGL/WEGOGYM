# fix(secureKeyStore) — Vérification appel migrateKeyFromDB() au démarrage
Date : 2026-02-27 14:00

## Instruction
RAPPORT 20260227-1220 — problème #1
Vérifie que migrateKeyFromDB() est bien appelée au démarrage de l'app pour
vider ai_api_key de SQLite vers expo-secure-store. Si non, ajoute l'appel à l'init.

## Rapport source
docs/bmad/verrif/20260227-1220/ — issue C2 (Groupe A)

## Classification
Type : fix (vérification sécurité — données sensibles)
Fichiers modifiés : aucun (problème déjà résolu)

## Ce qui a été fait

### Vérification effectuée

**Fichier inspecté :** `mobile/App.tsx:22`

```tsx
import { migrateKeyFromDB } from './src/services/secureKeyStore';

useEffect(() => {
  seedExercises().then(() => {
    seedExerciseDescriptions(database);
    if (__DEV__) seedDevData();
  });
  migrateKeyFromDB();  // ← Appel présent, non-bloquant
}, []);
```

**Résultat :** `migrateKeyFromDB()` est **déjà appelée** au démarrage de l'app dans le `useEffect` root du composant `App`.

### Comportement confirmé de migrateKeyFromDB() (`mobile/src/services/secureKeyStore.ts:74-96`)

1. Fetch le `User` depuis WatermelonDB
2. Si `user.aiApiKey` est null/vide → early return (rien à migrer)
3. Vérifie si une clé existe déjà dans `expo-secure-store` → évite l'écrasement
4. Si non → `setApiKey(user.aiApiKey)` vers le store sécurisé
5. Clear le champ SQLite via `database.write()` → `u.aiApiKey = null`
6. Catch global non-bloquant (log uniquement en `__DEV__`)

La migration respecte les patterns CLAUDE.md :
- ✅ Mutation DB dans `database.write()`
- ✅ `console.warn` gardé par `__DEV__`
- ✅ Données sensibles dans `expo-secure-store` (jamais en plain SQLite)

## Vérification
- TypeScript : N/A (aucun code modifié)
- Tests : N/A (aucun code modifié)
- Nouveau test créé : non (vérification manuelle suffisante — logique existante déjà testée)

## Documentation mise à jour
- `docs/bmad/verrif/20260227-1220/RAPPORT.md` — C2/Groupe A marqué ✅ Résolu

## Statut
✅ Résolu — 20260227-1400

## Commit
5c12c61 fix(secureKeyStore): verify migrateKeyFromDB() called at startup — C2 resolved
