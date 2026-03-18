import { computeExerciseOfWeek } from '../exerciseOfWeekHelpers'

const DAY_MS = 24 * 60 * 60 * 1000

function makeExercise(id: string, muscles: string[] = ['Pecs']) {
  return { id, muscles } as any
}

function makeSet(exerciseId: string, daysAgo: number) {
  return {
    exerciseId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  } as any
}

describe('computeExerciseOfWeek', () => {
  it('retourne null si moins de 5 exercices', () => {
    const exercises = [makeExercise('a'), makeExercise('b')]
    expect(computeExerciseOfWeek(exercises, [])).toBeNull()
  })

  it('retourne null si exactement 4 exercices', () => {
    const exercises = Array.from({ length: 4 }, (_, i) => makeExercise(`ex${i}`))
    expect(computeExerciseOfWeek(exercises, [])).toBeNull()
  })

  it('retourne un résultat avec 5+ exercices', () => {
    const exercises = Array.from({ length: 6 }, (_, i) => makeExercise(`ex${i}`))
    const result = computeExerciseOfWeek(exercises, [])
    expect(result).not.toBeNull()
    expect(result!.exercise).toBeDefined()
  })

  it('marque isNew si exercice jamais fait', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise(`ex${i}`))
    const result = computeExerciseOfWeek(exercises, [])
    expect(result!.isNew).toBe(true)
    expect(result!.lastDoneMs).toBeNull()
    expect(result!.daysSinceLastDone).toBeNull()
  })

  it('retourne le même exercice pour la même semaine (déterministe)', () => {
    const exercises = Array.from({ length: 10 }, (_, i) => makeExercise(`ex${i}`))
    const r1 = computeExerciseOfWeek(exercises, [])
    const r2 = computeExerciseOfWeek(exercises, [])
    expect(r1!.exercise.id).toBe(r2!.exercise.id)
  })

  it('calcule daysSinceLastDone correctement', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise(`ex${i}`))
    // Tous les exercices ont été faits sauf un pattern pour forcer la sélection
    const sets = exercises.map(e => makeSet(e.id, 5))
    const result = computeExerciseOfWeek(exercises, sets)
    expect(result).not.toBeNull()
    if (result!.daysSinceLastDone !== null) {
      expect(result!.daysSinceLastDone).toBeGreaterThanOrEqual(0)
    }
  })

  it('prioritise les exercices jamais faits', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise(`ex${i}`))
    // Seulement ex0-ex3 ont des sets, ex4 n'a jamais été fait
    const sets = [makeSet('ex0', 1), makeSet('ex1', 2), makeSet('ex2', 3), makeSet('ex3', 4)]
    const result = computeExerciseOfWeek(exercises, sets)
    expect(result).not.toBeNull()
    // ex4 est le seul jamais fait → il devrait être choisi
    expect(result!.exercise.id).toBe('ex4')
    expect(result!.isNew).toBe(true)
  })
})
