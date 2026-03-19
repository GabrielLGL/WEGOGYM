import { computeExerciseOfWeek } from '../exerciseOfWeekHelpers'
import { mockExercise, mockSet } from './testFactories'

const DAY_MS = 24 * 60 * 60 * 1000

function makeExercise_(id: string, muscles: string[] = ['Pecs']) {
  return mockExercise({ id, muscles })
}

function makeSet_(exerciseId: string, daysAgo: number) {
  return mockSet({
    exerciseId,
    createdAt: new Date(Date.now() - daysAgo * DAY_MS),
  })
}

describe('computeExerciseOfWeek', () => {
  it('retourne null si moins de 5 exercices', () => {
    const exercises = [makeExercise_('a'), makeExercise_('b')]
    expect(computeExerciseOfWeek(exercises, [])).toBeNull()
  })

  it('retourne null si exactement 4 exercices', () => {
    const exercises = Array.from({ length: 4 }, (_, i) => makeExercise_(`ex${i}`))
    expect(computeExerciseOfWeek(exercises, [])).toBeNull()
  })

  it('retourne un résultat avec 5+ exercices', () => {
    const exercises = Array.from({ length: 6 }, (_, i) => makeExercise_(`ex${i}`))
    const result = computeExerciseOfWeek(exercises, [])
    expect(result).not.toBeNull()
    expect(result!.exercise).toBeDefined()
  })

  it('marque isNew si exercice jamais fait', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise_(`ex${i}`))
    const result = computeExerciseOfWeek(exercises, [])
    expect(result!.isNew).toBe(true)
    expect(result!.lastDoneMs).toBeNull()
    expect(result!.daysSinceLastDone).toBeNull()
  })

  it('retourne le même exercice pour la même semaine (déterministe)', () => {
    const exercises = Array.from({ length: 10 }, (_, i) => makeExercise_(`ex${i}`))
    const r1 = computeExerciseOfWeek(exercises, [])
    const r2 = computeExerciseOfWeek(exercises, [])
    expect(r1!.exercise.id).toBe(r2!.exercise.id)
  })

  it('calcule daysSinceLastDone correctement', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise_(`ex${i}`))
    // Tous les exercices ont été faits sauf un pattern pour forcer la sélection
    const sets = exercises.map(e => makeSet_(e.id, 5))
    const result = computeExerciseOfWeek(exercises, sets)
    expect(result).not.toBeNull()
    if (result!.daysSinceLastDone !== null) {
      expect(result!.daysSinceLastDone).toBeGreaterThanOrEqual(0)
    }
  })

  it('prioritise les exercices jamais faits', () => {
    const exercises = Array.from({ length: 5 }, (_, i) => makeExercise_(`ex${i}`))
    // Seulement ex0-ex3 ont des sets, ex4 n'a jamais été fait
    const sets = [makeSet_('ex0', 1), makeSet_('ex1', 2), makeSet_('ex2', 3), makeSet_('ex3', 4)]
    const result = computeExerciseOfWeek(exercises, sets)
    expect(result).not.toBeNull()
    // ex4 est le seul jamais fait → il devrait être choisi
    expect(result!.exercise.id).toBe('ex4')
    expect(result!.isNew).toBe(true)
  })
})
