# feat(stats) — computeWeeklySetsChart + WeeklySetsChartResult
Date : 2026-02-27 22:20

## Instruction
/do docs/bmad/prompts/20260227-2215-muscles-volume-A.md

## Rapport source
docs/bmad/prompts/20260227-2215-muscles-volume-A.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/statsTypes.ts`
- `mobile/src/model/utils/statsMuscle.ts`

## Ce qui a été fait
- Ajout de l'interface `WeeklySetsChartResult` dans `statsTypes.ts` : `labels`, `data`, `weekRangeLabel`, `hasPrev`, `hasNext`
- Ajout de la fonction pure `computeWeeklySetsChart(sets, exercises, histories, options)` dans `statsMuscle.ts` :
  - Fenêtre de 4 semaines (configurable via `weeksToShow`)
  - `weekOffset = 0` → 4 dernières semaines, `weekOffset = -1` → les 4 semaines précédentes, etc.
  - `muscleFilter = null` → toutes muscles (global), sinon filtre sur le muscle exact
  - Calcul du `weekRangeLabel` (ex: "03/02 – 02/03")
  - `hasNext = weekOffset < 0`, `hasPrev = true` (pas de limite connue des données)
- Mise à jour de l'import dans `statsMuscle.ts` pour inclure `WeeklySetsChartResult`
- Automatiquement disponible via le barrel `statsHelpers.ts` (`export *`)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 71 passed
- Nouveau test créé : non (fonction pure simple, logique de fenêtrage testable visuellement)

## Documentation mise à jour
aucune (JSDoc ajouté directement sur la fonction)

## Statut
✅ Résolu — 20260227-2220

## Commit
[à remplir]
