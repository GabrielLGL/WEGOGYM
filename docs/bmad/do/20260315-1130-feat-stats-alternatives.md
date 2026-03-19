# FEAT(stats) — Exercise alternatives — similar exercises suggestions in history screen
Date : 2026-03-15 11:30

## Instruction
docs/bmad/prompts/20260315-1130-sprint10-B.md

## Rapport source
docs/bmad/prompts/20260315-1130-sprint10-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/exerciseAlternativesHelpers.ts` (NOUVEAU)
- `mobile/src/screens/ExerciseHistoryScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `exerciseAlternativesHelpers.ts` avec l'interface `AlternativeExercise` et la fonction `findAlternatives()` :
  - Filtre les exercices avec muscles en commun (> 0)
  - N'inclut que les exercices déjà pratiqués (présents dans allSets)
  - Calcule `matchScore` = sharedMuscles / max(current.muscles, ex.muscles)
  - Calcule `totalSets` et `lastUsed` depuis allSets
  - Trie par matchScore desc, puis totalSets desc, max 5 résultats
- Ajouté `allSets: WorkoutSet[]` à l'interface Props et au `withObservables`
- Ajouté le calcul `alternatives` via `useMemo` dans `ExerciseHistoryContent`
- Ajouté la section UI alternatives après la section overload, avant l'historique :
  - Invisible si 0 alternatives
  - Chaque ligne cliquable → `navigation.push('ExerciseHistory', { exerciseId })`
  - Affiche nom, muscles communs, nb de sets
- Corrigé `colors.textMuted` → `colors.textSecondary` (couleur inexistante dans le thème)
- Ajouté clés `exerciseHistory.alternatives.*` dans fr.ts et en.ts

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés
- Tests : ✅ 8 passed (ExerciseHistoryScreen.test.tsx)
- Nouveau test créé : non (tests existants couvrent le composant)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260315-1130

## Commit
6590b77 feat(stats): exercise alternatives — similar exercises suggestions in history screen
