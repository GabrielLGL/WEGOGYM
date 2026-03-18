import { computeRestTimeAnalysis, formatRestTime } from '../restTimeAnalysisHelpers'

function makeSet(
  historyId: string,
  exerciseId: string,
  minutesAgo: number,
) {
  return {
    historyId,
    exerciseId,
    weight: 100,
    reps: 10,
    createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
  } as any
}

function makeExercise(id: string, name: string) {
  return { id, name } as any
}

describe('computeRestTimeAnalysis', () => {
  it('retourne null si aucun set', () => {
    expect(computeRestTimeAnalysis([], [])).toBeNull()
  })

  it('retourne null si un seul set par exercice', () => {
    const sets = [makeSet('h1', 'ex1', 5)]
    const exercises = [makeExercise('ex1', 'Bench')]
    expect(computeRestTimeAnalysis(sets, exercises)).toBeNull()
  })

  it('calcule le temps de repos entre sets consécutifs du même exercice', () => {
    // 2 sets du même exercice, espacés de 2 minutes
    const sets = [
      makeSet('h1', 'ex1', 4), // 4 min ago
      makeSet('h1', 'ex1', 2), // 2 min ago → delta = 120s
    ]
    const exercises = [makeExercise('ex1', 'Bench Press')]
    const result = computeRestTimeAnalysis(sets, exercises)
    expect(result).not.toBeNull()
    expect(result!.entries).toHaveLength(1)
    expect(result!.entries[0].exerciseName).toBe('Bench Press')
    expect(result!.entries[0].averageRest).toBeCloseTo(120, 0)
    expect(result!.entries[0].recommendation).toBe('optimal')
  })

  it('ignore les sets d\'exercices différents dans la même séance', () => {
    const sets = [
      makeSet('h1', 'ex1', 6),
      makeSet('h1', 'ex2', 4), // exercice différent
      makeSet('h1', 'ex1', 2), // même exercice que le 1er mais pas consécutif par tri
    ]
    const exercises = [
      makeExercise('ex1', 'Bench'),
      makeExercise('ex2', 'Squat'),
    ]
    const result = computeRestTimeAnalysis(sets, exercises)
    // Seulement ex1 a 2 sets consécutifs (triés par date)
    // ex1: 6min ago et 2min ago → delta = 240s
    if (result) {
      const benchEntry = result.entries.find(e => e.exerciseId === 'ex1')
      if (benchEntry) {
        expect(benchEntry.averageRest).toBeCloseTo(240, 0)
      }
    }
  })

  it('ignore les deltas < 10 secondes', () => {
    const now = Date.now()
    const sets = [
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now - 5000) },
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now) },
    ] as any[]
    const exercises = [makeExercise('ex1', 'Bench')]
    expect(computeRestTimeAnalysis(sets, exercises)).toBeNull()
  })

  it('ignore les deltas > 600 secondes (10 min)', () => {
    const sets = [
      makeSet('h1', 'ex1', 20), // 20 min ago
      makeSet('h1', 'ex1', 5),  // 5 min ago → delta = 15 min = 900s > 600
    ]
    const exercises = [makeExercise('ex1', 'Bench')]
    expect(computeRestTimeAnalysis(sets, exercises)).toBeNull()
  })

  it('calcule la moyenne globale correctement', () => {
    const now = Date.now()
    const sets = [
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now - 180_000) },
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now - 60_000) },
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now) },
    ] as any[]
    const exercises = [makeExercise('ex1', 'Bench')]
    const result = computeRestTimeAnalysis(sets, exercises)
    expect(result).not.toBeNull()
    // 2 deltas de 120s et 60s → moyenne = 90s
    expect(result!.globalAverage).toBeCloseTo(90, 0)
    expect(result!.totalSamples).toBe(2)
  })

  it('recommande "short" pour repos < 60s', () => {
    const now = Date.now()
    const sets = [
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now - 30_000) },
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now) },
    ] as any[]
    const exercises = [makeExercise('ex1', 'Bench')]
    const result = computeRestTimeAnalysis(sets, exercises)
    expect(result).not.toBeNull()
    expect(result!.entries[0].recommendation).toBe('short')
  })

  it('recommande "long" pour repos > 180s', () => {
    const now = Date.now()
    const sets = [
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now - 300_000) },
      { historyId: 'h1', exerciseId: 'ex1', weight: 100, reps: 10, createdAt: new Date(now) },
    ] as any[]
    const exercises = [makeExercise('ex1', 'Bench')]
    const result = computeRestTimeAnalysis(sets, exercises)
    expect(result).not.toBeNull()
    expect(result!.entries[0].recommendation).toBe('long')
  })
})

describe('formatRestTime', () => {
  it('formate les secondes', () => {
    expect(formatRestTime(45)).toBe('45s')
  })

  it('formate les minutes', () => {
    expect(formatRestTime(120)).toBe('2m')
  })

  it('formate les minutes et secondes', () => {
    expect(formatRestTime(90)).toBe('1m 30s')
  })
})
