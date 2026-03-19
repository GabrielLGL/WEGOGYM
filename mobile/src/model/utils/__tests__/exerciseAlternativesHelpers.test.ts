import { findAlternatives } from '../exerciseAlternativesHelpers'

const makeExercise = (id: string, name: string, muscles: string[]) => ({ id, name, muscles })
const makeSet = (exerciseId: string, daysAgo = 0) => ({
  exerciseId,
  createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
})

describe('findAlternatives', () => {
  const bench = makeExercise('e1', 'Développé couché', ['pecs', 'triceps', 'shoulders'])
  const incline = makeExercise('e2', 'Développé incliné', ['pecs', 'shoulders'])
  const fly = makeExercise('e3', 'Écarté poulie', ['pecs'])
  const squat = makeExercise('e4', 'Squat', ['quads', 'glutes'])
  const curl = makeExercise('e5', 'Curl biceps', ['biceps'])

  const allExercises = [bench, incline, fly, squat, curl]

  it('retourne vide si aucun exercice alternatif pratiqué', () => {
    const result = findAlternatives(bench, allExercises, [])
    expect(result).toEqual([])
  })

  it('retourne les exercices partageant des muscles communs', () => {
    const sets = [makeSet('e2', 1), makeSet('e3', 2), makeSet('e4', 3)]
    const result = findAlternatives(bench, allExercises, sets)
    expect(result.length).toBe(2) // incline + fly, pas squat
    expect(result.map(r => r.exerciseId)).toContain('e2')
    expect(result.map(r => r.exerciseId)).toContain('e3')
    expect(result.map(r => r.exerciseId)).not.toContain('e4')
  })

  it('exclut l\'exercice source de ses propres alternatives', () => {
    const sets = [makeSet('e1', 1), makeSet('e2', 1)]
    const result = findAlternatives(bench, allExercises, sets)
    expect(result.map(r => r.exerciseId)).not.toContain('e1')
  })

  it('trie par matchScore décroissant', () => {
    const sets = [makeSet('e2', 1), makeSet('e3', 1)]
    const result = findAlternatives(bench, allExercises, sets)
    // incline partage 2 muscles (pecs, shoulders) → score plus haut que fly (1 muscle: pecs)
    expect(result[0].exerciseId).toBe('e2')
    expect(result[0].matchScore).toBeGreaterThan(result[1].matchScore)
  })

  it('respecte maxResults', () => {
    const sets = [makeSet('e2', 1), makeSet('e3', 2), makeSet('e5', 3)]
    const result = findAlternatives(bench, allExercises, sets, 1)
    expect(result.length).toBe(1)
  })

  it('inclut sharedMuscles et totalSets corrects', () => {
    const sets = [makeSet('e2', 1), makeSet('e2', 2), makeSet('e2', 3)]
    const result = findAlternatives(bench, allExercises, sets)
    const inclineResult = result.find(r => r.exerciseId === 'e2')!
    expect(inclineResult.sharedMuscles).toEqual(expect.arrayContaining(['pecs', 'shoulders']))
    expect(inclineResult.totalSets).toBe(3)
  })

  it('exclut les exercices sans muscles en commun', () => {
    const sets = [makeSet('e4', 1), makeSet('e5', 1)]
    const result = findAlternatives(bench, allExercises, sets)
    expect(result.map(r => r.exerciseId)).not.toContain('e4')
    expect(result.map(r => r.exerciseId)).not.toContain('e5')
  })
})
