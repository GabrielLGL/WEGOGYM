import { computeVariantSuggestions } from '../variantHelpers'
import { mockExercise } from './testFactories'

function makeExercise_(id: string, muscles: string[] = []) {
  return mockExercise({ id, muscles })
}

describe('computeVariantSuggestions', () => {
  it('retourne vide si exercice sans muscles', () => {
    const target = makeExercise_('ex1', [])
    const all = [target, makeExercise_('ex2', ['Pecs'])]
    expect(computeVariantSuggestions(target, all, new Set())).toEqual([])
  })

  it('retourne vide si aucun candidat avec muscles communs', () => {
    const target = makeExercise_('ex1', ['Pecs'])
    const all = [target, makeExercise_('ex2', ['Quadriceps'])]
    expect(computeVariantSuggestions(target, all, new Set())).toEqual([])
  })

  it("n'inclut pas l'exercice source dans les variantes", () => {
    const target = makeExercise_('ex1', ['Pecs', 'Triceps'])
    const all = [target, makeExercise_('ex2', ['Pecs'])]
    const results = computeVariantSuggestions(target, all, new Set())
    expect(results.every(r => r.exercise.id !== 'ex1')).toBe(true)
  })

  it('retourne des variantes partageant le même groupe musculaire', () => {
    const target = makeExercise_('ex1', ['Pecs', 'Triceps'])
    const all = [
      target,
      makeExercise_('ex2', ['Pecs', 'Epaules']),
      makeExercise_('ex3', ['Triceps']),
      makeExercise_('ex4', ['Quadriceps']),
    ]
    const results = computeVariantSuggestions(target, all, new Set())
    expect(results.length).toBe(2) // ex2 et ex3
    for (const r of results) {
      expect(r.sharedMuscles.length).toBeGreaterThan(0)
    }
  })

  it('respecte la limite demandée', () => {
    const target = makeExercise_('ex1', ['Pecs'])
    const all = [
      target,
      makeExercise_('ex2', ['Pecs']),
      makeExercise_('ex3', ['Pecs']),
      makeExercise_('ex4', ['Pecs']),
      makeExercise_('ex5', ['Pecs']),
    ]
    const results = computeVariantSuggestions(target, all, new Set(), 2)
    expect(results.length).toBe(2)
  })

  it('priorise les exercices déjà pratiqués', () => {
    const target = makeExercise_('ex1', ['Pecs'])
    const all = [
      target,
      makeExercise_('ex2', ['Pecs']),
      makeExercise_('ex3', ['Pecs']),
    ]
    const used = new Set(['ex3'])
    const results = computeVariantSuggestions(target, all, used)
    expect(results[0].exercise.id).toBe('ex3')
    expect(results[0].hasHistory).toBe(true)
  })

  it('calcule un similarityScore entre 0 et 1', () => {
    const target = makeExercise_('ex1', ['Pecs', 'Triceps', 'Epaules'])
    const all = [target, makeExercise_('ex2', ['Pecs'])]
    const results = computeVariantSuggestions(target, all, new Set())
    expect(results[0].similarityScore).toBeGreaterThan(0)
    expect(results[0].similarityScore).toBeLessThanOrEqual(1)
  })
})
