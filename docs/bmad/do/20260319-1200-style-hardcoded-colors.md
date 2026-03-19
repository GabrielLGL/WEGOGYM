# style(theme) — Remplacer 71 couleurs hardcodées par tokens theme

Date : 2026-03-19 12:00

## Instruction
Remplace les 71 couleurs hex hardcodées par des tokens du theme (colors.*) dans les 21 fichiers screens + helpers.

## Rapport source
docs/bmad/verrif/20260319-1009/RAPPORT.md problème #1 et #10

## Classification
Type : style
Fichiers modifiés :
- mobile/src/theme/index.ts (15 nouveaux tokens dark + light)
- mobile/src/model/utils/muscleRecoveryHelpers.ts
- mobile/src/model/utils/sessionIntensityHelpers.ts
- mobile/src/model/utils/__tests__/sessionIntensityHelpers.test.ts (mock amber)
- mobile/src/screens/HomeScreen.tsx
- mobile/src/screens/ExercisesScreen.tsx
- mobile/src/screens/ActivityFeedScreen.tsx
- mobile/src/screens/PersonalChallengesScreen.tsx
- mobile/src/screens/SelfLeaguesScreen.tsx
- mobile/src/screens/MonthlyBulletinScreen.tsx
- mobile/src/screens/ReportDetailScreen.tsx
- mobile/src/screens/ProgressPhotosScreen.tsx
- mobile/src/screens/StatsMonthlyProgressScreen.tsx
- mobile/src/screens/StatsHallOfFameScreen.tsx
- mobile/src/screens/StatsTrainingSplitScreen.tsx
- mobile/src/screens/StatsExerciseFrequencyScreen.tsx
- mobile/src/screens/StatsStrengthScreen.tsx
- mobile/src/screens/StatsDurationScreen.tsx
- mobile/src/screens/StatsVolumeRecordsScreen.tsx
- mobile/src/screens/StatsVolumeDistributionScreen.tsx
- mobile/src/screens/StatsSetQualityScreen.tsx
- mobile/src/screens/StatsPRTimelineScreen.tsx
- mobile/src/screens/StatsRestTimeScreen.tsx
- mobile/src/screens/StatsMuscleBalanceScreen.tsx
- mobile/src/screens/WorkoutScreen.tsx

## Ce qui a ete fait

### Tokens ajoutés dans theme/index.ts (dark + light)
- `success` — vert status (#10B981 / #059669)
- `amber` — ambre/attention (#F59E0B / #D97706)
- `gold`, `silver`, `bronze` — médailles
- `purple`, `pink`, `blue` — palette data viz
- `neutralGray`, `lightGray` — gris sémantiques
- `heatmap1`, `heatmap2`, `heatmap3` — intensité heatmap
- `negative` — erreur data viz (#EF4444 / #DC2626)

### Constantes module-level converties en fonctions
- `POSITIVE_COLOR` -> `colors.success`
- `TREND_ICONS` -> `getTrendIcon(trend, colors)` (StatsMonthlyProgress)
- `MEDAL_COLORS` -> `getMedalColor(rank, colors)` (StatsHallOfFame)
- `LEVEL_COLORS` -> `getLevelColor(level, colors)` (StatsStrength)
- `TREND_COLORS` -> `getTrendColor(trend, colors)` (StatsExerciseFrequency)
- `BADGE_COLORS` -> `getBadgeColor(rec, colors)` (StatsRestTime)
- `STATUS_COLORS` -> `getStatusColor(status, colors)` (StatsMuscleBalance)
- `BAR_COLORS` -> inline palette avec tokens (StatsVolumeDistribution)
- `getSplitColor(type, primary, danger, muted)` -> `getSplitColor(type, colors)` (StatsTrainingSplit)

### #FFFFFF -> colors.primaryText
ActivityFeed, ReportDetail, ProgressPhotos, StatsExerciseFrequency, StatsVolumeDistribution, StatsSetQuality, StatsMuscleBalance, StatsRestTime

### Fichiers exclus (intentionnellement)
- AnimatedSplash.tsx — bootstrap avant ThemeProvider
- KoreWidget.tsx — processus Android isolé
- i18n/fr.ts, en.ts — descriptions textuelles
- Fichiers __tests__/ (sauf mock sessionIntensity corrigé pour TS)

## Verification
- TypeScript : ✅ 0 erreurs
- Tests : ✅ 2230 passed, 188 suites
- Nouveau test créé : non
- Grep hardcoded hex dans screens/helpers : 0 résultat

## Documentation mise a jour
aucune

## Statut
✅ Résolu — 20260319-1200

## Commit
