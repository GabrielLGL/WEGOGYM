<!-- v1.0 — 2026-02-28 -->
# Prompt — augmente le coverage — 20260228-1500

## Demande originale
`/prompt augmente le coverage`

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260228-1500-coverage-A.md` | statsDateUtils, statsDuration, statsKPIs, statsMuscle, statsPRs, statsVolume | 1 | ✅ |
| B | `20260228-1500-coverage-B.md` | exerciseQueryUtils, exerciseStatsUtils, workoutSessionUtils, workoutSetUtils, parseUtils, programImportUtils | 1 | ✅ |
| C | `20260228-1500-coverage-C.md` | BadgesScreen, ExerciseHistoryScreen, ProgramDetailScreen, AssistantPreviewScreen | 2 | ✅ |
| D | `20260228-1500-coverage-D.md` | BadgeCelebration, BadgeCard, ThemeContext | 2 | ✅ |

## Ordre d'exécution
- Vague 1 (A + B) : parallèle — aucune dépendance entre elles
- Vague 2 (C + D) : parallèle — dépendent implicitement du contexte stabilisé par vague 1

## Résultat final
- **Avant** : ~43 % utils, ~80 % screens, ~53 % services
- **Après** : 94 suites, **1564 tests**, **0 fail**
- Fix bonus : `statsDuration.ts` — exclusion des sessions soft-deletées dans `computeDurationStats`

## Patterns documentés (pour futures sessions)
- `jest.mock()` factories hoistées : utiliser `require()` au lieu des imports
- `BottomSheet` : mocker directement pour tests synchrones
- `LanguageContext` : non global, mocker par fichier
- `ThemeContext` test : importer via chemin long pour matcher `moduleNameMapper`
- Timer leaks `Animated` : `jest.useFakeTimers()` / `jest.useRealTimers()`
