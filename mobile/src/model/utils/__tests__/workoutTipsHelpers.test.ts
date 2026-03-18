import { getTipKeyForExercise } from '../workoutTipsHelpers'

describe('getTipKeyForExercise', () => {
  it('retourne un tip générique si aucun muscle connu', () => {
    const key = getTipKeyForExercise('some-id', [])
    expect(key).toMatch(/^generic_\d$/)
  })

  it('retourne un tip générique pour muscles inconnus', () => {
    const key = getTipKeyForExercise('abc', ['MuscleInconnu'])
    expect(key).toMatch(/^generic_\d$/)
  })

  it('retourne un tip spécifique au muscle si connu', () => {
    const key = getTipKeyForExercise('test', ['Pecs'])
    expect(key).toMatch(/^pecs_\d$/)
  })

  it('retourne toujours une string non-vide', () => {
    const key = getTipKeyForExercise('', [])
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThan(0)
  })

  it('est déterministe pour le même exerciceId et muscles', () => {
    const k1 = getTipKeyForExercise('ex123', ['Dos', 'Biceps'])
    const k2 = getTipKeyForExercise('ex123', ['Dos', 'Biceps'])
    expect(k1).toBe(k2)
  })

  it('retourne un tip parmi les candidats des muscles fournis', () => {
    const key = getTipKeyForExercise('xyz', ['Epaules'])
    expect(key).toMatch(/^epaules_\d$/)
  })

  it('gère plusieurs muscles avec des tips combinés', () => {
    const key = getTipKeyForExercise('multi', ['Pecs', 'Triceps'])
    // Devrait être un tip pecs ou triceps
    expect(key).toMatch(/^(pecs|triceps)_\d$/)
  })
})
