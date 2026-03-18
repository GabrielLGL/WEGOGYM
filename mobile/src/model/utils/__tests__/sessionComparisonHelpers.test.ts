import { computeSessionComparison } from '../sessionComparisonHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeCurrentSet(exerciseId: string, weight: number, reps: number) {
  return { exerciseId, weight, reps }
}

function makePreviousSet(exerciseId: string, weight: number, reps: number, historyId: string, daysAgo: number) {
  return {
    exerciseId,
    weight,
    reps,
    historyId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  }
}

function makeExercise(id: string, name: string) {
  return { id, name }
}

describe('computeSessionComparison', () => {
  it('retourne hasComparison false si pas de séance précédente', () => {
    const current = [makeCurrentSet('ex1', 100, 10)]
    const exercises = [makeExercise('ex1', 'Bench Press')]
    const result = computeSessionComparison(current, [], exercises, 'h1')
    expect(result.hasComparison).toBe(false)
    expect(result.overallVolumeDelta).toBe(0)
  })

  it('calcule le delta de volume correctement', () => {
    const current = [makeCurrentSet('ex1', 100, 10)] // volume = 1000
    const previous = [makePreviousSet('ex1', 80, 10, 'h0', 3)] // volume = 800
    const exercises = [makeExercise('ex1', 'Bench Press')]
    const result = computeSessionComparison(current, previous, exercises, 'h1')
    expect(result.hasComparison).toBe(true)
    expect(result.exercises[0].deltas!.volume).toBe(200) // 1000 - 800
    expect(result.exercises[0].deltas!.volumePercent).toBe(25) // 200/800*100
  })

  it('calcule le delta de poids max correctement', () => {
    const current = [
      makeCurrentSet('ex1', 100, 10),
      makeCurrentSet('ex1', 110, 8),
    ]
    const previous = [
      makePreviousSet('ex1', 90, 10, 'h0', 3),
      makePreviousSet('ex1', 100, 8, 'h0', 3),
    ]
    const exercises = [makeExercise('ex1', 'Squat')]
    const result = computeSessionComparison(current, previous, exercises, 'h1')
    expect(result.exercises[0].current.maxWeight).toBe(110)
    expect(result.exercises[0].previous!.maxWeight).toBe(100)
    expect(result.exercises[0].deltas!.maxWeight).toBe(10)
  })

  it('gère les exercices sans séance précédente (previous null)', () => {
    const current = [
      makeCurrentSet('ex1', 100, 10),
      makeCurrentSet('ex2', 50, 12),
    ]
    const previous = [makePreviousSet('ex1', 80, 10, 'h0', 3)]
    const exercises = [
      makeExercise('ex1', 'Bench Press'),
      makeExercise('ex2', 'Curls'),
    ]
    const result = computeSessionComparison(current, previous, exercises, 'h1')
    const ex2 = result.exercises.find(e => e.exerciseId === 'ex2')!
    expect(ex2.previous).toBeNull()
    expect(ex2.deltas).toBeNull()
  })

  it('exclut la séance actuelle des précédentes (par historyId)', () => {
    const current = [makeCurrentSet('ex1', 100, 10)]
    // Le set avec historyId='h1' (séance actuelle) ne doit pas compter
    const previous = [
      makePreviousSet('ex1', 100, 10, 'h1', 0),
      makePreviousSet('ex1', 80, 10, 'h0', 3),
    ]
    const exercises = [makeExercise('ex1', 'Bench Press')]
    const result = computeSessionComparison(current, previous, exercises, 'h1')
    expect(result.exercises[0].previous!.maxWeight).toBe(80) // h0, pas h1
  })

  it('calcule overallVolumeDeltaPercent correctement', () => {
    const current = [
      makeCurrentSet('ex1', 100, 10), // 1000
      makeCurrentSet('ex2', 50, 12),  // 600
    ]
    const previous = [
      makePreviousSet('ex1', 80, 10, 'h0', 3), // 800
      makePreviousSet('ex2', 40, 12, 'h0', 3), // 480
    ]
    const exercises = [
      makeExercise('ex1', 'Bench'),
      makeExercise('ex2', 'Curls'),
    ]
    const result = computeSessionComparison(current, previous, exercises, 'h1')
    // total current = 1600, total previous = 1280, delta = 320
    expect(result.overallVolumeDelta).toBe(320)
    expect(result.overallVolumeDeltaPercent).toBeCloseTo(25, 0) // 320/1280*100
  })

  it('utilise le nom de l exercice depuis exerciseMap', () => {
    const current = [makeCurrentSet('ex1', 100, 10)]
    const exercises = [makeExercise('ex1', 'Développé couché')]
    const result = computeSessionComparison(current, [], exercises, 'h1')
    expect(result.exercises[0].exerciseName).toBe('Développé couché')
  })
})
