# feat(workout) — session comparison delta volume/weight vs previous session

Date : 2026-03-15 12:00

## Instruction
docs/bmad/prompts/20260315-1130-sprint10-E.md

## Rapport source
docs/bmad/prompts/20260315-1130-sprint10-E.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/model/utils/sessionComparisonHelpers.ts (NOUVEAU)
- mobile/src/components/WorkoutSummarySheet.tsx
- mobile/src/types/workout.ts
- mobile/src/model/utils/exerciseStatsUtils.ts
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `sessionComparisonHelpers.ts` avec `computeSessionComparison()` : groupe les sets par exercice, trouve la séance précédente la plus récente pour chaque exercice, calcule les deltas volume/maxWeight
- Ajouté `exerciseId` à `RecapExerciseData` (type + buildRecapExercises)
- Ajouté un `useEffect` dans WorkoutSummarySheet pour charger les sets historiques depuis WatermelonDB (limité à 500, filtrage deleted_at/is_abandoned)
- Ajouté la section UI comparaison après l'intensité : volume global delta + delta par exercice avec couleurs vert/rouge
- Ajouté les traductions FR/EN (`sessionComparison.*`)
- Section masquée si aucun exercice n'a d'historique (`hasComparison === false`)

## Vérification
- TypeScript : ✅ (aucune erreur dans les fichiers modifiés)
- Tests : ✅ 1757 passed (10 failed pré-existants — AsyncStorage mock)
- Nouveau test créé : non (logique pure testable, mais pas de test requis pour cette itération)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260315-1200

## Commit
