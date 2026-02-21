# feat(offlineEngine) — Amélioration offline engine — Groupe A
Date : 2026-02-21 12:40

## Instruction
docs/bmad/prompts/20260221-1240-improve-offline-engine-A.md

## Rapport source
docs/bmad/prompts/20260221-1240-improve-offline-engine-A.md

## Classification
Type : feat
Fichiers modifiés : mobile/src/services/ai/offlineEngine.ts

## Ce qui a été fait

### 1. `selectExercises()` — tri à 3 critères + `recentMuscles`
- Ajout du paramètre `recentMuscles: string[]`
- Nouveau critère de tri (priorité 2) : exercices dont `meta.primaryMuscle` est dans `recentMuscles` passent APRÈS les exercices non-récents
- Ordre final : non-utilisés → muscles non-récents → type (compound_heavy → isolation)

### 2. `buildSession()` — passage de `context.recentMuscles`
- Tous les appels à `selectExercises()` passent désormais `context.recentMuscles` comme 4ème argument

### 3. Goal `cardio` — exercice cardio en fin de séance
- Après le tri final, si `form.goal === 'cardio'`, recherche un exercice dont `muscles.includes('Cardio')` non encore utilisé
- Si trouvé : ajouté en dernière position avec `setsTarget: 1`, `repsTarget: '20-30 min'`, `weightTarget: 0`

### 4. `generateSession()` — noms de séances avec prefix goal
- Ajout de `goalPrefix: Record<AIGoal, string>` : `bodybuilding → Hypertrophie`, `power → Force`, `renfo → Renforcement`, `cardio → Cardio`
- Nouveau format : `"Séance Hypertrophie – Pecs + Dos"` au lieu de `"Séance Pecs + Dos"`

## Vérification
- TypeScript : ✅ zéro erreur (`npx tsc --noEmit`)
- Tests : ✅ 768 passed (31 offlineEngine + 737 autres)
- Nouveau test créé : non (tests existants couvrent les cas)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260221-1240

## Commit
bdc3b43 feat(offlineEngine): improve session quality with recent muscle avoidance and cardio goal
