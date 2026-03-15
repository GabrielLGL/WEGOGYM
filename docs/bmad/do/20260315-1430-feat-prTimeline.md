# FEAT(stats) — Timeline des Records Personnels (#99)
Date : 2026-03-15 14:30

## Instruction
docs/bmad/prompts/20260315-1130-sprint10-D.md

## Rapport source
description directe (rapport sprint10-D)

## Classification
Type : feat
Fichiers modifiés :
- `mobile/src/model/utils/prTimelineHelpers.ts` (NEW)
- `mobile/src/screens/StatsPRTimelineScreen.tsx` (NEW)
- `mobile/src/model/utils/__tests__/prTimelineHelpers.test.ts` (NEW)
- `mobile/src/navigation/index.tsx` (lazy import + route + Stack.Screen)
- `mobile/src/screens/StatsScreen.tsx` (bouton podium-outline)
- `mobile/src/screens/__tests__/StatsScreen.test.tsx` (fix test Records)
- `mobile/src/i18n/fr.ts` (navigation.statsPRTimeline, stats.prTimeline, section prTimeline)
- `mobile/src/i18n/en.ts` (navigation.statsPRTimeline, stats.prTimeline, section prTimeline)

## Ce qui a été fait
- **prTimelineHelpers.ts** : helper `buildPRTimeline()` qui filtre les sets isPr=true, calcule le gain/gainPercent par rapport au PR précédent du même exercice (en traitant en ordre croissant pour garder l'historique), groupe par mois (décroissant)
- **StatsPRTimelineScreen.tsx** : écran SectionList avec stats rapides (total PRs, ce mois, gain moyen), timeline verticale dot+connecteur par entrée, dot jaune pour premier PR, dot primary pour PR avec gain, wrappé dans useDeferredMount + withObservables
- **Navigation** : lazy import, route `StatsPRTimeline: undefined`, Stack.Screen avec titre i18n
- **StatsScreen** : bouton `podium-outline` / "Records" ajouté à STAT_BUTTONS
- **i18n** : sections complètes FR/EN (navigation, stats, prTimeline)
- **Test** : fix du test StatsScreen (Records apparaît 2×) + 6 tests unitaires pour buildPRTimeline
- **Correction** : `colors.textMuted` → `colors.placeholder` (n'existe pas dans ThemeColors)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1764 passed (4 suites pré-existantes en échec, non liés)
- Nouveau test créé : oui — 6 tests `prTimelineHelpers.test.ts`

## Documentation mise à jour
aucune (helper utilitaire interne, pas dans CLAUDE.md section 4)

## Statut
✅ Résolu — 20260315-1430

## Commit
5a5ef8a feat(stats): PR timeline screen — chronological personal records with monthly grouping
