# feat(volume-tracker) — Sets par muscle par semaine + évolution
Date : 2026-02-26 13:00

## Stories
- **S01** — Helpers `computeSetsPerMuscleWeek` + `computeSetsPerMuscleHistory` dans `statsHelpers.ts`
- **S02** — Section "Sets par muscle — semaine actuelle" dans `StatsVolumeScreen`
- **S03** — Section "Évolution par muscle" (ChipSelector + LineChart) dans `StatsVolumeScreen`

## Fichiers modifiés
- `mobile/src/model/utils/statsHelpers.ts` (+80 lignes : 2 types, 2 fonctions)
- `mobile/src/screens/StatsVolumeScreen.tsx` (+144 lignes : 2 nouvelles sections)

## Ce qui a été fait

### statsHelpers.ts
- Ajout `MuscleWeekEntry { muscle, sets }` et `MuscleWeekHistoryEntry { weekLabel, weekStart, sets }`
- `computeSetsPerMuscleWeek(sets, exercises, histories)` : filtre les sets de la semaine courante (lun 00:00 → maintenant), groupe par muscle via `exercise.muscles` (getter string[]), retourne top 8 triés par sets décroissants
- `computeSetsPerMuscleHistory(sets, exercises, histories, muscleFilter, weeks)` : génère N semaines glissantes, compte les sets du muscle filtré, retourne 0 pour semaines vides (pas de trou dans le chart)
- Fix notable : `exercise.muscles` est un getter `string[]` (JSON.parse), pas une string CSV — la `parseMuscles()` initiale a été supprimée

### StatsVolumeScreen.tsx
- Import `LineChart` depuis react-native-chart-kit + nouvelles fonctions statsHelpers
- État local `selectedMuscle` pour le sélecteur de muscle
- `muscleList` : muscles uniques extraits des exercices entraînés (via `sets.map(s => s.exercise.id)`)
- `effectiveMuscle` : muscle sélectionné ou fallback sur muscleList[0]
- Section S02 : card avec barres horizontales proportionnelles (View width %) — `react-native-chart-kit` n'a pas de BarChart horizontal
- Section S03 : ChipSelector + LineChart bezier 8 semaines, conditionnel sur `muscleList.length > 0`
- Aucune modification du HOC `enhance` ni des sections existantes (1-3)

## Vérification
- TypeScript (StatsVolumeScreen) : ✅ 0 erreur
- TypeScript (statsHelpers) : ✅ 0 erreur
- Tests : ✅ non impactés (aucun test existant sur ces fichiers)
- Critères d'acceptation : ✅ tous validés

## Commits
- S01 inclus dans `bd903da feat(WorkoutSummarySheet): enriched post-workout recap` (session parallèle)
- S02+S03 : `6ec5ec7 feat(volume-tracker): add sets-per-muscle sections to StatsVolumeScreen`
