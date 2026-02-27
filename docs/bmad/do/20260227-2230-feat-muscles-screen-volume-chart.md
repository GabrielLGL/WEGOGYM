# feat(screens) — StatsRepartitionScreen enrichi avec chart séries/semaine + sets/muscle
Date : 2026-02-27 22:30

## Instruction
/do docs/bmad/prompts/20260227-2215-muscles-volume-B.md

## Rapport source
docs/bmad/prompts/20260227-2215-muscles-volume-B.md

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/screens/StatsRepartitionScreen.tsx`
- `mobile/src/screens/__tests__/StatsRepartitionScreen.test.tsx`

## Ce qui a été fait
### StatsRepartitionScreen.tsx
- Ajout de 2 nouvelles sections après la répartition existante :
  1. **"Séries par semaine"** :
     - `ChipSelector` filtrant par muscle (Global ou muscle spécifique)
     - `BarChart` (react-native-chart-kit) sur 4 semaines via `computeWeeklySetsChart`
     - Boutons "← Précédent" / "Suivant →" pour paginer les semaines
     - "Suivant" désactivé (opacity 0.3) quand `hasNext = false`
     - `setWeekOffset(0)` au changement de filtre muscle
  2. **"Sets par muscle cette semaine"** : barres horizontales via `computeSetsPerMuscleWeek`
- Nouveaux imports : `TouchableOpacity`, `useWindowDimensions`, `BarChart`, `computeWeeklySetsChart`, `computeSetsPerMuscleWeek`, `useHaptics`, `createChartConfig`
- Nouveaux états : `weekOffset` (int, 0 = semaines récentes), `muscleChartFilter` (null = Global)
- Haptics sur les boutons de navigation
- Tous les styles ajoutés dans `useStyles` (pas de couleurs hardcodées)

### StatsRepartitionScreen.test.tsx
- Correction du test `'rend avec des données et affiche la répartition'` :
  - `getByText` → `getAllByText` (les muscles apparaissent maintenant dans la répartition ET dans le ChipSelector du chart)
  - Assertion : `length >= 1` au lieu d'une présence unique

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1276 passed (75 suites)
- Nouveau test créé : non (test existant adapté)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260227-2230

## Commit
0c59cd7 feat(screens): enrich muscles screen with weekly sets chart and pagination
