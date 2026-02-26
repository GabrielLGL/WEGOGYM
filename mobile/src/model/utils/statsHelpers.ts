// ─── statsHelpers — Barrel de re-export ──────────────────────────────────────
// Tous les imports existants restent compatibles via ce barrel.
// Le code est découpé en sous-modules thématiques :
//   statsTypes.ts      — types & interfaces
//   statsDateUtils.ts  — toDateKey, labelToPeriod, getPeriodStart
//   statsKPIs.ts       — computeGlobalKPIs, streaks, computeMotivationalPhrase
//   statsDuration.ts   — computeDurationStats, formatDuration
//   statsVolume.ts     — computeVolumeStats, buildHeatmapData, formatVolume
//   statsMuscle.ts     — computeMuscleRepartition, computeSetsPerMuscle*
//   statsPRs.ts        — computePRsByExercise, computeTopExercisesByFrequency

export * from './statsTypes'
export * from './statsDateUtils'
export * from './statsKPIs'
export * from './statsDuration'
export * from './statsVolume'
export * from './statsMuscle'
export * from './statsPRs'
