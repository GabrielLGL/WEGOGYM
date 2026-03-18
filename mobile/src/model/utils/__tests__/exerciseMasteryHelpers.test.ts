import { computeExerciseMastery } from '../exerciseMasteryHelpers'

function makeExercise(id: string) {
  return { id, name: `Exercise ${id}`, muscles: ['Pecs'] } as any
}

function makeSet(exerciseId: string, weight: number, reps: number) {
  return { exerciseId, weight, reps } as any
}

describe('computeExerciseMastery', () => {
  it('retourne level 0 si aucun set pour un exercice', () => {
    const exercises = [makeExercise('ex1')]
    const result = computeExerciseMastery(exercises, [])
    const mastery = result.get('ex1')!
    expect(mastery.level).toBe(0)
    expect(mastery.totalSets).toBe(0)
    expect(mastery.score).toBe(0)
  })

  it('mastery augmente avec le nombre de sets', () => {
    const exercises = [makeExercise('ex1')]
    // 5 sets → setsScore = 10
    const fewSets = Array.from({ length: 5 }, () => makeSet('ex1', 100, 10))
    const resultFew = computeExerciseMastery(exercises, fewSets)

    // 20 sets → setsScore = 40 (cap)
    const manySets = Array.from({ length: 20 }, () => makeSet('ex1', 100, 10))
    const resultMany = computeExerciseMastery(exercises, manySets)

    expect(resultMany.get('ex1')!.score).toBeGreaterThan(resultFew.get('ex1')!.score)
  })

  it('niveau de maîtrise (0 → 5)', () => {
    const exercises = [makeExercise('ex1')]
    // Beaucoup de sets avec variété de reps ET progression
    // 20 sets première moitié à 50kg, deuxième moitié à 100kg, reps variées
    const sets = [
      ...Array.from({ length: 10 }, (_, i) => makeSet('ex1', 50, (i % 5) * 5 + 1)),
      ...Array.from({ length: 10 }, (_, i) => makeSet('ex1', 100, (i % 5) * 5 + 1)),
    ]
    const result = computeExerciseMastery(exercises, sets)
    const mastery = result.get('ex1')!
    expect(mastery.level).toBeGreaterThanOrEqual(3)
    expect(mastery.hasProgression).toBe(true)
  })

  it('distinctRepRanges détecte la variété des rep ranges', () => {
    const exercises = [makeExercise('ex1')]
    // Sets dans différents ranges : 3 (force), 10 (hypertrophie), 20 (endurance)
    const sets = [
      makeSet('ex1', 150, 3),
      makeSet('ex1', 100, 10),
      makeSet('ex1', 50, 20),
    ]
    const result = computeExerciseMastery(exercises, sets)
    const mastery = result.get('ex1')!
    expect(mastery.distinctRepRanges).toBe(3)
  })

  it('retourne une entrée par exercice', () => {
    const exercises = [makeExercise('ex1'), makeExercise('ex2')]
    const sets = [
      makeSet('ex1', 100, 10),
      makeSet('ex2', 60, 12),
    ]
    const result = computeExerciseMastery(exercises, sets)
    expect(result.size).toBe(2)
    expect(result.has('ex1')).toBe(true)
    expect(result.has('ex2')).toBe(true)
  })

  it('hasProgression = true si la 2e moitié des sets a un poids plus élevé', () => {
    const exercises = [makeExercise('ex1')]
    // 4 sets minimum pour détecter la progression
    const sets = [
      makeSet('ex1', 60, 10),
      makeSet('ex1', 60, 10),
      makeSet('ex1', 80, 10),
      makeSet('ex1', 80, 10),
    ]
    const result = computeExerciseMastery(exercises, sets)
    expect(result.get('ex1')!.hasProgression).toBe(true)
  })
})
