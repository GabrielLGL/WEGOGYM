# feat(home) — Indice de fatigue — ACWR-based workload monitoring on dashboard
Date : 2026-03-15 11:30

## Instruction
docs/bmad/prompts/20260315-1130-sprint10-A.md

## Rapport source
Description directe (prompt sprint 10 — Groupe A)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/fatigueIndexHelpers.ts` (nouveau)
- `mobile/src/model/utils/__tests__/fatigueIndexHelpers.test.ts` (nouveau)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/i18n/fr.ts`
- `mobile/src/i18n/en.ts`

## Ce qui a été fait
- Créé `fatigueIndexHelpers.ts` : calcul ACWR simplifié (acute = 7j, chronic = moy 8 semaines), 4 zones (recovery/optimal/reaching/overreaching), index 0-100
- Ajouté import + `useMemo fatigueResult` dans `HomeScreenBase` après `calendarWeeks`
- Ajouté carte fatigue dans le JSX après la section heatmap calendrier : icône dynamique, barre de progression avec marqueur 50%, stats volume, recommandation
- Couleurs par zone : recovery → `colors.placeholder`, optimal → `colors.primary`, reaching → `#F59E0B`, overreaching → `colors.danger`
- Note : `colors.textMuted` du prompt n'existe pas dans le thème → remplacé par `colors.placeholder`
- Ajouté 8 styles (`fatigueCard`, `fatigueHeader`, `fatigueTitle`, `fatigueBarBg`, `fatigueBarFill`, `fatigueMarker`, `fatigueStats`, `fatigueRecommendation`)
- Ajouté traductions `home.fatigue.*` dans `fr.ts` et `en.ts` (4 zones + 4 recommandations)
- Créé 6 tests unitaires couvrant les 4 zones, le clamp, le soft-delete et les abandons

## Vérification
- TypeScript : ✅ zéro erreur sur les fichiers modifiés (erreurs pré-existantes dans ExerciseHistoryScreen, StatsPRTimelineScreen, etc.)
- Tests : ✅ 6/6 passed (`fatigueIndexHelpers.test.ts`)
- Nouveau test créé : oui

## Documentation mise à jour
aucune (pas de nouveau pattern — ACWR déjà bien documenté dans le prompt)

## Statut
✅ Résolu — 20260315-1130

## Commit
6b435cc feat(home): fatigue index card — ACWR-based workload monitoring on dashboard
