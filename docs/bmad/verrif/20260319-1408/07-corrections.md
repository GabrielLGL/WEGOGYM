# Passe 7/8 — Corrections

## 7a — Critiques (4 corrigés)

| # | Problème | Fichier | Fix |
|---|----------|---------|-----|
| 1 | startTime.getTime() sans null check | HomeInsightsCarousel.tsx | filter h.startTime avant getTime() |
| 2 | ProgressPhoto Relation<> manquant | ProgressPhoto.ts | import Relation + type Relation<BodyMeasurement> |
| 3 | JSON.parse sans try/catch | widgetDataService.ts | try/catch + return null |
| 4 | User.friendCode optional mismatch | User.ts + leaderboardHelpers.ts | string | null + fallback ?? '' |

## 7b — Warnings (4 corrigés)

| # | Problème | Fichier | Fix |
|---|----------|---------|-----|
| 5 | props: any HomeScreen | HomeScreen.tsx | Record<string, unknown> |
| 6 | props: any LeaderboardScreen | LeaderboardScreen.tsx | Record<string, unknown> |
| 7 | Hardcoded #F59E0B20 | StatsDurationScreen.tsx | colors.amber + '20' |
| 8 | Hardcoded "ami/amis" | HomeNavigationGrid.tsx + fr.ts + en.ts | t.leaderboard.friendCount(n) |

## 7c — Suggestions (0 corrigés)

- Import Program dans HomeHeroAction : vérifié, utilisé dans les props → pas mort
- Hardcoded fallback 'intermediate' : minor, pas de risque fonctionnel
- AnimatedSplash couleurs : acceptable car hors ThemeProvider

## Vérification post-corrections

- TypeScript : ✅ 0 erreur
- Tests : ✅ 2231 passed, 188 suites
