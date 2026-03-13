# feat(home) — Activity feed — scrollable personal workout journal
Date : 2026-03-13 23:30

## Instruction
docs/bmad/prompts/20260313-2320-sprint4-E.md

## Rapport source
docs/bmad/prompts/20260313-2320-sprint4-E.md

## Classification
Type : feat
Fichiers modifiés :
- mobile/src/screens/ActivityFeedScreen.tsx (NOUVEAU)
- mobile/src/navigation/index.tsx
- mobile/src/screens/HomeScreen.tsx
- mobile/src/i18n/fr.ts
- mobile/src/i18n/en.ts

## Ce qui a été fait
- Créé `ActivityFeedScreen` : FlatList de cartes enrichies montrant les séances passées
  - Chaque carte affiche : nom séance, date relative, durée, volume, nb séries, PRs, top 3 exercices, top 3 muscles
  - Empty state avec icône + message
  - Tap → navigation vers HistoryDetail
  - Badge "Abandonné" en rouge pour séances abandonnées
  - Chips muscles style WorkoutSummarySheet
  - `withObservables` pattern avec `useDeferredMount`
  - Query DB : `histories` (deleted_at null, sorted by start_time desc, limit 50), `sets`, `sessions`, `exercises`
- Ajouté route `ActivityFeed` dans navigation (lazy import + Stack.Screen)
- Ajouté tuile "Journal" dans HomeScreen section "Entraînement"
- Ajouté traductions FR/EN : `home.tiles.activityFeed`, `navigation.activityFeed`, `activityFeed.*`

## Vérification
- TypeScript : ✅ (seule erreur = StatsHallOfFameScreen d'un autre Claude)
- Tests : ✅ 1734 passed
- Nouveau test créé : non

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260313-2330

## Commit
2f1f8ee feat(home): activity feed — scrollable personal workout journal
