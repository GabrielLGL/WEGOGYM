# fix(security,workout) — Corrections restantes rapport verrif 20260222-2241
Date : 2026-02-23 01:00

## Instruction
docs/bmad/verrif/20260222-2241/RAPPORT.md

## Rapport source
docs/bmad/verrif/20260222-2241/RAPPORT.md — 4 problèmes restants après la passe de corrections

## Classification
Type : fix
Fichiers modifiés :
- mobile/src/screens/WorkoutScreen.tsx
- mobile/src/services/ai/aiService.ts
- mobile/src/services/secureKeyStore.ts (nouveau)
- mobile/App.tsx
- mobile/src/screens/__tests__/WorkoutScreen.test.tsx
- mobile/src/services/ai/__tests__/aiService.test.ts
- CLAUDE.md

## Ce qui a été fait

### Analyse des 4 problèmes listés
| # | Problème | Statut |
|---|----------|--------|
| 1 | API key en clair dans SQLite | ✅ Corrigé → expo-secure-store |
| 2 | Alert.alert → AlertDialog (4 usages) | ✅ Déjà résolu (0 occurrences trouvées) |
| 3 | WorkoutExerciseCard from() one-shot | ✅ Corrigé → render conditionnel |
| 4 | SessionDetailScreen fetch impératif | ✅ Déjà résolu (exercises dans withObservables) |

### Fix #1 — API key migrée vers expo-secure-store
- Installé `expo-secure-store`
- Créé `services/secureKeyStore.ts` avec `getApiKey()`, `setApiKey()`, `deleteApiKey()`, `migrateKeyFromDB()`
- Modifié `aiService.ts` : `generatePlan()` lit la clé depuis le secure store au lieu de `user.aiApiKey`
- Ajouté appel `migrateKeyFromDB()` dans `App.tsx` au démarrage (migration one-time)
- Mis à jour les tests aiService pour mocker `secureKeyStore`

### Fix #3 — WorkoutExerciseCard render conditionnel
- Ajouté condition `{historyId ? <FlatList.../> : <View>Chargement...</View>}` dans WorkoutScreen
- Évite le render des cards avec historyId vide (appel inutile à getLastPerformanceForExercise)
- Mis à jour 2 tests qui attendaient un contenu immédiat → ajouté `waitFor()`

### Issues 2 & 4 — Déjà résolues
- Alert.alert : aucune occurrence trouvée (grep vide), tous les écrans utilisent AlertDialog
- SessionDetailScreen : `exercises` est déjà dans le `withObservables` (réactif)

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 840 passed, 0 failed (47 suites)
- Nouveau test créé : non (tests existants mis à jour)

## Documentation mise à jour
- CLAUDE.md : ajout pitfall "Données sensibles — JAMAIS en SQLite" (section 3.1)
- CLAUDE.md : correction référence schema v16 → v17 dans la structure projet

## Statut
✅ Résolu — 20260223-0100

## Commit
36656e6 fix(security,workout): migrate API key to expo-secure-store + conditional render WorkoutExerciseCard
