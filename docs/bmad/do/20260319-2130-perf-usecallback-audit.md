# perf(hooks) — useCallback audit sur 6 écrans
Date : 2026-03-19 21:30

## Instruction
docs/bmad/prompts/20260319-2100-polish-M-usecallback-audit.md

## Rapport source
docs/bmad/prompts/20260319-2100-polish-M-usecallback-audit.md

## Classification
Type : perf
Fichiers modifiés :
- mobile/src/screens/ReportDetailScreen.tsx
- mobile/src/screens/LeaderboardScreen.tsx
- mobile/src/screens/PersonalChallengesScreen.tsx

## Ce qui a été fait
- **ReportDetailScreen** : wrappé `handlePrev`, `handleNext`, `handleToggleType` dans `useCallback` avec deps correctes
- **LeaderboardScreen** : wrappé `handleCopyCode`, `handleShareCode`, `handleImport`, `handleOpenRemove`, `handleConfirmRemove`, `handleOpenAddModal` dans `useCallback`
- **PersonalChallengesScreen** : extrait `keyExtractor` et `renderItem` du FlatList dans des `useCallback`
- **StatsCalendarScreen** : déjà optimisé, aucun changement nécessaire
- **BadgesScreen** : déjà optimisé, aucun changement nécessaire
- **SkillTreeScreen** : aucun handler à wrapper (pas de callbacks passés en props)

## Vérification
- TypeScript : ✅ (erreurs pré-existantes sur HomeHeroAction/HomeNavigationGrid/home/index — non liées)
- Tests : ✅ 2209 passed (22 failed pré-existants sur weeklyGoalsHelpers)
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260319-2130

## Commit
1de2eed perf(hooks): useCallback audit on 3 screens (ReportDetail, Leaderboard, PersonalChallenges)
