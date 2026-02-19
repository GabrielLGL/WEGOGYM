// Mock database avant les imports
jest.mock('../index', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
    batch: jest.fn(),
  },
}))

import { BASIC_EXERCISES } from '../seed'

describe('seed — BASIC_EXERCISES', () => {
  it('est un tableau non vide', () => {
    expect(Array.isArray(BASIC_EXERCISES)).toBe(true)
    expect(BASIC_EXERCISES.length).toBeGreaterThan(0)
  })

  it('contient au moins 40 exercices', () => {
    expect(BASIC_EXERCISES.length).toBeGreaterThanOrEqual(40)
  })

  it('chaque exercice a un name, muscles et equipment', () => {
    BASIC_EXERCISES.forEach(ex => {
      expect(typeof ex.name).toBe('string')
      expect(ex.name.length).toBeGreaterThan(0)
      expect(Array.isArray(ex.muscles)).toBe(true)
      expect(ex.muscles.length).toBeGreaterThan(0)
      expect(typeof ex.equipment).toBe('string')
    })
  })

  it('contient des exercices de pecs', () => {
    const pecs = BASIC_EXERCISES.filter(ex => ex.muscles.includes('Pecs'))
    expect(pecs.length).toBeGreaterThan(0)
  })

  it('contient des exercices de dos', () => {
    const dos = BASIC_EXERCISES.filter(ex => ex.muscles.includes('Dos'))
    expect(dos.length).toBeGreaterThan(0)
  })

  it('contient des exercices poids du corps', () => {
    const bodyweight = BASIC_EXERCISES.filter(ex => ex.equipment === 'Poids du corps')
    expect(bodyweight.length).toBeGreaterThan(0)
  })

  it('tous les exercices ont des noms uniques', () => {
    const names = BASIC_EXERCISES.map(ex => ex.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('contient le Développé Couché Barre', () => {
    const found = BASIC_EXERCISES.find(ex => ex.name === 'Développé Couché Barre')
    expect(found).toBeDefined()
    expect(found?.muscles).toContain('Pecs')
  })
})
