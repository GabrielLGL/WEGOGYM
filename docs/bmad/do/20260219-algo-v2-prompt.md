# feat(ai) — Enrichir le prompt AI avec sport science guidelines

Date : 2026-02-19 17:00

## Instruction
Enrichir le prompt AI de WEGOGYM avec du contexte sport science pour de meilleures générations.
Fichier cible : mobile/src/services/ai/providerUtils.ts

## Classification
Type : feat
Fichiers :
- mobile/src/services/ai/providerUtils.ts
- mobile/src/services/ai/__tests__/providerUtils.test.ts (correction types)
- mobile/src/services/ai/__tests__/offlineEngine.test.ts (correction types)
- mobile/src/services/ai/__tests__/providers.test.ts (correction types)

## Ce qui a été fait

### providerUtils.ts — buildPrompt()
1. **Suppression de `prsText`** (ancien format `JSON.stringify(context.prs)`)
2. **Ajout `recentMusclesText`** : affiche les muscles travaillés ces 7 derniers jours si présents
3. **Ajout `prsDetailedText`** : formate les PRs en `"Exercice: 100kg"` avec instructions de charge (70-80% bodybuilding, 80-90% force)
4. **Section DIRECTIVES SPORT SCIENCE** ajoutée dans le template :
   - Exercices composés en premier (squat, soulevé de terre, etc.)
   - Isolation après
   - Volume MEV/MAV par groupe musculaire
   - Progressive overload basé sur les PRs (75-85%)
   - Muscles récents injectés dynamiquement
5. **CONTRAINTES enrichies** : `weightTarget` basé sur les PRs si disponibles (70-85%)

### Fichiers de test — corrections TypeScript
`DBContext.exercises` est passé de `string[]` à `ExerciseInfo[]` (Vague 1).
Les 3 fichiers de test utilisaient encore `string[]` → corrigés :
- `offlineEngine.test.ts` : `makeContext` convertit maintenant `string[]` → `ExerciseInfo[]` en interne
- `providerUtils.test.ts` : objets ExerciseInfo littéraux dans les fixtures
- `providers.test.ts` : `testContext.exercises` mis à jour

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 70 passed (providerUtils: 23, offlineEngine: 27, providers: 20)
- Nouveau test créé : non (tests existants mis à jour)

## Commit
feat(ai): enrich AI prompt with sport science guidelines and PR-based weights
