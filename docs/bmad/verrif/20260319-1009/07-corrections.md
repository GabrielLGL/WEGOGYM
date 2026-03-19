# Passe 7/8 — Corrections — 20260319-1009

## 7a — Critiques 🔴 (3 corrigés)

| # | Fichier | Correction |
|---|---------|------------|
| 1 | HomeScreen.tsx:2073 | Sets query `THIRTY_DAYS_MS` → `NINETY_DAYS_MS` (flashback 3m recevait données tronquées) |
| 2 | weeklyGoalsHelpers.ts:72-73 | Guard division par zero : `sessionsTarget > 0 ? ... : 0` |
| 3 | schema.ts:4 + CLAUDE.md | Commentaire version `35` → `38` (cohérence avec schéma réel) |

## 7b — Warnings 🟡 (6 corrigés)

| # | Fichier | Correction |
|---|---------|------------|
| 1 | volumeRecordsHelpers.ts:35-41 | ISO week calculation corrigé (utilise Jan 4 ISO reference) |
| 2 | workoutSummaryHelpers.ts:58 | Guard `diffMs < 0` → retourne "à l'instant" / "just now" |
| 3 | setQualityHelpers.ts:44 | Population stdDev → sample stdDev (Bessel: `n-1`) |
| 4 | trainingDensityHelpers.ts:34 | Guard `startTime` futur via `Math.max(0, ...)` |
| 5 | User.ts:63 | `@field('wearable_last_sync_at')` → `@date(...)` + type `Date \| null` |
| 6 | WearableSyncLog.ts:7 | `@field('sync_at')` → `@date(...)` + type `Date` |

### Cascading fixes (caused by 7b#5-6)
- SettingsWearableSection.tsx: `Date.now()` → `new Date()` pour syncAt et wearableLastSyncAt
- SettingsWearableSection.tsx: `formatTimeAgo` et `formatLogDate` acceptent `Date | number`

## 7c — Suggestions 🔵 (0)

Non traitées — impact négligeable. HomeScreen.tsx:2054 `THIRTY_DAYS_MS` supprimé (variable morte après fix CRIT#1).

## Vérification post-corrections
- TypeScript : ✅ 0 errors
- Tests : ✅ 187 passed, 2220 tests, 0 failures
- Zéro régression
