# REFACTOR(ai) — add ExerciseInfo to DBContext — expose muscle metadata for offline engine
Date : 2026-02-19 HH:mm

## Instruction
Enrichir DBContext avec les métadonnées d'exercices (muscles) pour corriger un bug critique dans
l'offline engine (il ignorait les groupes musculaires du split PPL car exercises était string[]).

## Classification
Type : refactor
Fichiers modifiés :
- mobile/src/services/ai/types.ts
- mobile/src/services/ai/aiService.ts
- mobile/src/services/ai/__tests__/offlineEngine.test.ts (import ExerciseInfo)
- mobile/src/services/ai/__tests__/providers.test.ts (import ExerciseInfo)
- mobile/src/services/ai/__tests__/providerUtils.test.ts (import ExerciseInfo)

## Ce qui a été fait
1. **types.ts** : ajout de `export interface ExerciseInfo { name: string; muscles: string[] }` avant
   `DBContext`. Changé `exercises: string[]` en `exercises: ExerciseInfo[]`.
2. **aiService.ts** : remplacé `exerciseNames` (string[]) par `exerciseInfos` (ExerciseInfo[]) dans
   `buildDBContext()`. Mis à jour le return et le mock de `testProviderConnection()`.
3. **providerUtils.ts / test files** : déjà au bon état dans HEAD — aucun changement nécessaire.

## Vérification
- TypeScript : ✅ (0 erreur — `npx tsc --noEmit`)
- Tests : ✅ 78 passed (aiService + providerUtils + providers + offlineEngine)
- Nouveau test créé : non (couverture existante suffisante)

## Commit
refactor(ai): add ExerciseInfo to DBContext — expose muscle metadata for offline engine
