# feat(stats) — Progressive overload indicator — weight/volume trend in exercise history
Date : 2026-03-15 10:15

## Instruction
docs/bmad/prompts/20260315-1000-sprint9-B.md

## Rapport source
docs/bmad/prompts/20260315-1000-sprint9-B.md (description directe — sprint9 Groupe B)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/progressiveOverloadHelpers.ts` (NOUVEAU)
- `mobile/src/screens/ExerciseHistoryScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`
- `mobile/src/model/utils/__tests__/progressiveOverloadHelpers.test.ts` (NOUVEAU)

## Ce qui a été fait
- **progressiveOverloadHelpers.ts** : nouveau helper `computeOverloadTrend()` qui :
  - groupe les sets par jour (même jour = même séance)
  - calcule le poids max et le volume (Σ weight×reps) par séance
  - prend les N dernières séances (windowSize, défaut 5)
  - applique une régression linéaire simple (slope normalisé 0→1)
  - retourne `trend: 'up'|'down'|'stable'` + `percentChange` + `dataPoints`
  - seuil : > +2% → up, < -2% → down, sinon stable
- **ExerciseHistoryScreen.tsx** : section "Surcharge progressive" ajoutée après le graphique (avant la liste historique), visible seulement si `weightTrend.lastSessions >= 3`. Affiche poids max et volume avec indicateurs ↑↓→ colorés + pourcentage + disclaimer.
- **fr.ts / en.ts** : clés `exerciseHistory.overload.{title, maxWeight, volume, disclaimer}` ajoutées dans la section `exerciseHistory`.
- Couleur `textMuted` absente du thème → remplacée par `textSecondary`.

## Vérification
- TypeScript : ✅ (aucune erreur dans les fichiers modifiés — erreurs pré-existantes dans HomeScreen/StatsHeatmapScreen/StatsStrengthScreen issues du travail parallèle Sprint9)
- Tests : ✅ 7 passed (progressiveOverloadHelpers.test.ts)
- Nouveau test créé : oui — `progressiveOverloadHelpers.test.ts`

## Documentation mise à jour
Aucune modification CLAUDE.md nécessaire (pattern standard helper + UI).

## Statut
✅ Résolu — 20260315-1015

## Commit
38f0486 feat(stats): progressive overload indicator — weight/volume trend in exercise history
