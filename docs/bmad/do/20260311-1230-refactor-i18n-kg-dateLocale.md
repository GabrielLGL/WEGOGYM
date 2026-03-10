# refactor(i18n) — kg placeholder + ChartsScreen dateLocale
Date : 2026-03-11 12:30

## Instruction
i18n templates kg placeholder (charts.setDetail, statsExercises.prValue) + ChartsScreen dateLocale

## Rapport source
Description directe

## Classification
Type : refactor
Fichiers modifiés :
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`
- `mobile/src/screens/ChartsScreen.tsx`
- `mobile/src/screens/StatsExercisesScreen.tsx`

## Ce qui a été fait
1. **i18n templates** : Remplacé les `kg` hardcodés par `{unit}` dans :
   - `charts.setDetail` : `{weight} kg` → `{weight} {unit}`
   - `statsExercises.prValue` : `{weight} kg` → `{weight} {unit}`
   - `statsExercises.prOrm` : `~{orm} kg` → `~{orm} {unit}`
2. **Écrans** : Ajouté `unit = t.statsMeasurements.weightUnit` et passé `{unit}` dans les `.replace()` de ChartsScreen et StatsExercisesScreen.
3. **ChartsScreen dateLocale** : Ajouté `dateLocale` basé sur `language` et remplacé les 3 appels `toLocaleDateString()` / `toLocaleDateString([])` par `toLocaleDateString(dateLocale, ...)`.

## Vérification
- TypeScript : ✅
- Tests : ✅ 17 passed (ChartsScreen + StatsExercisesScreen)
- Nouveau test créé : non

## Documentation mise à jour
Aucune

## Statut
✅ Résolu — 20260311-1230

## Commit
9cfad4d refactor(i18n): replace hardcoded kg with {unit} placeholder + add dateLocale to ChartsScreen
