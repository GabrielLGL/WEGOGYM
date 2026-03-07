/**
 * databaseHelpers.ts — Barrel de re-export
 *
 * Ce fichier re-exporte toutes les fonctions utilitaires DB depuis les sous-modules
 * thématiques. Les 15+ importeurs existants continuent à fonctionner sans modification.
 *
 * Sous-modules :
 * - parseUtils.ts          : parseNumericInput, parseIntegerInput, formatRelativeDate
 * - exerciseQueryUtils.ts  : getNextPosition, filterExercises, searchExercises, filterAndSearchExercises
 * - workoutSessionUtils.ts : createWorkoutHistory, completeWorkoutHistory, updateHistoryNote, getLastSessionVolume, softDeleteHistory
 * - workoutSetUtils.ts     : saveWorkoutSet, deleteWorkoutSet, getMaxWeightForExercise, addRetroactiveSet, recalculateSetPrs
 * - exerciseStatsUtils.ts  : ExerciseSessionStat, getLastPerformanceForExercise, buildExerciseStatsFromData,
 *                            getExerciseStatsFromSets, buildRecapExercises, getLastSetsForExercises
 * - programImportUtils.ts  : importPresetProgram, markOnboardingCompleted
 * - aiPlanUtils.ts         : importGeneratedPlan, importGeneratedSession
 */

export * from './parseUtils'
export * from './exerciseQueryUtils'
export * from './workoutSessionUtils'
export * from './workoutSetUtils'
export * from './exerciseStatsUtils'
export * from './programImportUtils'
export * from './aiPlanUtils'
export * from './dataManagementUtils'
