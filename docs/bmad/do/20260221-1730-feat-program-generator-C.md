# FEAT(programGenerator) — Groupe C : exerciseSelector + sessionBuilder + index

Date : 2026-02-21 17:30

## Instruction
docs/bmad/prompts/20260221-1725-program-generator-C.md

## Rapport source
Description directe (prompt Groupe C du module programGenerator)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/services/ai/programGenerator/exerciseSelector.ts` (créé)
- `mobile/src/services/ai/programGenerator/sessionBuilder.ts` (créé)
- `mobile/src/services/ai/programGenerator/index.ts` (créé)

## Ce qui a été fait

### exerciseSelector.ts
- Fonction `selectExercisesForSession()` : charge tous les exercices WatermelonDB, filtre par equipment/muscles/difficulty/injuries, dérive `nervousDemand` (1|2|3) et `movementPattern`, trie compound avant isolation, limite max 2 exercices par primaryMuscle.
- Correction vs prompt : import de `MUSCLE_TO_PATTERN` depuis `./tables` (absent de `./types`).
- Typage strict : utilise `db.get<Exercise>('exercises')` avec import du modèle Exercise.

### sessionBuilder.ts
- `buildSetParams()` : construit `SetParams` depuis `PARAMS_TABLE` selon goal + isCompound.
- `estimateDuration()` : estime la durée en minutes (tempo × reps + rest).
- `buildSession()` : orchestre `selectExercisesForSession` + attribution des séries, respecte `MAX_TOTAL_SETS_PER_SESSION`.

### index.ts
- `generateProgram()` : point d'entrée principal — détermine split, calcule volume, distribue sur séances, construit chaque session.
- `toDatabasePlan()` : convertit `PGGeneratedProgram` vers `GeneratedPlan` compatible `importGeneratedPlan()`.
- Re-exporte `determineSplit`, `buildWeeklySchedule`, `calcWeeklyVolumeByMuscle`, `distributeVolumeToSessions`.

## Vérification
- TypeScript : ✅ zéro erreur (`npx tsc --noEmit`)
- Tests : ✅ 787 passed (46 suites)
- Nouveau test créé : non (module pur algorithmique, pas de logique métier nouvelle — couvert via volumeCalculator + splitStrategy)

## Documentation mise à jour
aucune (pas de nouveau pattern pitfall, pas de nouveau composant/hook)

## Statut
✅ Résolu — 20260221-1730

## Commit
d2fc658 feat(programGenerator): Groupe C — exerciseSelector + sessionBuilder + index
