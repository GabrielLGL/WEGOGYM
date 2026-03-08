/**
 * Tests for barrel re-export files — databaseHelpers.ts & statsHelpers.ts
 * Ensures all re-exports are valid and accessible.
 */

jest.mock('../../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

describe('databaseHelpers barrel', () => {
  it('re-exports parseUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.parseNumericInput).toBeDefined()
    expect(mod.parseIntegerInput).toBeDefined()
  })

  it('re-exports exerciseQueryUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.getNextPosition).toBeDefined()
    expect(mod.filterExercises).toBeDefined()
    expect(mod.searchExercises).toBeDefined()
  })

  it('re-exports workoutSessionUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.createWorkoutHistory).toBeDefined()
    expect(mod.completeWorkoutHistory).toBeDefined()
  })

  it('re-exports workoutSetUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.saveWorkoutSet).toBeDefined()
    expect(mod.deleteWorkoutSet).toBeDefined()
  })

  it('re-exports exerciseStatsUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.buildRecapExercises).toBeDefined()
    expect(mod.getLastPerformanceForExercise).toBeDefined()
  })

  it('re-exports programImportUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.importPresetProgram).toBeDefined()
    expect(mod.markOnboardingCompleted).toBeDefined()
  })

  it('re-exports aiPlanUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.importGeneratedPlan).toBeDefined()
  })

  it('re-exports dataManagementUtils', () => {
    const mod = require('../databaseHelpers')
    expect(mod.deleteAllData).toBeDefined()
  })
})

describe('statsHelpers barrel', () => {
  it('re-exports statsTypes', () => {
    const mod = require('../statsHelpers')
    expect(mod).toBeDefined()
  })

  it('re-exports statsContext', () => {
    const mod = require('../statsHelpers')
    expect(mod.prepareStatsContext).toBeDefined()
  })

  it('re-exports statsDateUtils', () => {
    const mod = require('../statsHelpers')
    expect(mod.toDateKey).toBeDefined()
    expect(mod.getPeriodStart).toBeDefined()
  })

  it('re-exports statsKPIs', () => {
    const mod = require('../statsHelpers')
    expect(mod.computeGlobalKPIs).toBeDefined()
    expect(mod.computeCurrentStreak).toBeDefined()
  })

  it('re-exports statsDuration', () => {
    const mod = require('../statsHelpers')
    expect(mod.computeDurationStats).toBeDefined()
    expect(mod.formatDuration).toBeDefined()
  })

  it('re-exports statsVolume', () => {
    const mod = require('../statsHelpers')
    expect(mod.computeVolumeStats).toBeDefined()
  })

  it('re-exports statsMuscle', () => {
    const mod = require('../statsHelpers')
    expect(mod.computeMuscleRepartition).toBeDefined()
  })

  it('re-exports statsPRs', () => {
    const mod = require('../statsHelpers')
    expect(mod.computePRsByExercise).toBeDefined()
  })
})
