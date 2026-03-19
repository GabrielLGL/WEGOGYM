# refactor(nav) — Supprimer `as never` dans navigation.navigate()
Date : 2026-03-19 22:00

## Instruction
docs/bmad/prompts/20260319-2100-polish-K-nav-typesafety.md

## Rapport source
docs/bmad/prompts/20260319-2100-polish-K-nav-typesafety.md

## Classification
Type : refactor
Fichiers modifiés :
- mobile/src/components/home/HomeHeroAction.tsx
- mobile/src/components/home/HomeNavigationGrid.tsx
- mobile/src/components/home/HomeStatusStrip.tsx
- mobile/src/components/home/HomeInsightsSection.tsx
- mobile/src/screens/StatsScreen.tsx

## Ce qui a été fait
- **Routes littérales** (`'ReportDetail'`) : supprimé `as never` directement — TS résout le type car les params sont optionnels (`| undefined`).
- **Routes dynamiques** (variable `route: keyof RootStackParamList`) : remplacé `as never` par un cast ciblé `(navigation.navigate as (screen: string) => void)(route)` avec commentaire explicatif. React Navigation 7 génère des overloads par route littérale, ce qui empêche TS de résoudre un union type — le cast est documenté et limité au `navigate` plutôt qu'au paramètre.
- Le paramètre `route` de `handleShortcut` dans HomeHeroAction a été re-typé de `string` à `keyof RootStackParamList`.

## Vérification
- TypeScript : ✅ (0 erreur liée aux changements ; 3 erreurs pré-existantes dans tests)
- Tests : ✅ 2219 passed (12 failed pré-existants dans statsDuration/trainingDensity/weeklyGoals)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260319-2200

## Commit
afa88ff refactor(nav): remove `as never` casts from navigation.navigate() calls
