# 03 — Code Review

**Run:** 2026-03-10 23:57
**Résultat:** 0 critique, 5 moyennes, 2 mineures

## Points conformes
- Portal pattern, withObservables, no `any`, database.write(), soft-delete, useHaptics, useModalState, validation centralisée, navigation Native Stack, i18n, __DEV__ guards

## Violations détectées

### 🟡 Moyennes
1. **HistoryDetailScreen:133-141** — `durationText` useMemo réimplémente `formatDuration()` inline. DRY violation avec `statsDuration.ts:38-43`.
2. **workoutSetUtils.ts:43-63 + 101-120** — `saveWorkoutSet` et `addRetroactiveSet` quasi-identiques (seul `isPr` diffère). Refactoriser en `createSetRecord()`.
3. **openaiProvider.ts:19,42,79** — Modèle `gpt-4.1-mini` hardcodé 3 fois. Extraire en constante.
4. **aiService.ts:177-188** — `testProviderConnection` pour Claude brûle une génération complète (2048 tokens). Gemini/OpenAI utilisent 10 tokens. Créer `testClaudeConnection()` léger.
5. **ProgramDetailBottomSheet.tsx:18** — `Dimensions.get('window')` au scope module (stale sur foldables/rotation). Utiliser `useWindowDimensions()`.

### 🔵 Mineures
6. **User observable dupliqué 4 fois** — `database.get<User>('users').query().observe().pipe(...)` dans WorkoutScreen, AssistantScreen, ProgramsScreen, SessionDetailScreen.
7. **statsMuscle.ts:42** — `othersLabel = 'Autres'` default en français. Forcer le passage de `t.stats.others`.

## Score : 17/20
