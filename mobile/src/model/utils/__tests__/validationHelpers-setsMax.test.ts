/**
 * Additional tests for validationHelpers.ts — setsMax validation (lines 104-113)
 */
import { validateWorkoutInput } from '../validationHelpers'

describe('validateWorkoutInput — setsMax parameter', () => {
  it('should accept valid setsMax greater than sets', () => {
    const result = validateWorkoutInput('3', '10', '50', '5')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should accept setsMax equal to sets', () => {
    const result = validateWorkoutInput('3', '10', '50', '3')
    expect(result.valid).toBe(true)
  })

  it('should reject setsMax less than sets', () => {
    const result = validateWorkoutInput('5', '10', '50', '3')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le max de séries doit être ≥ au min')
  })

  it('should reject non-numeric setsMax', () => {
    const result = validateWorkoutInput('3', '10', '50', 'abc')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le max de séries doit être un nombre valide')
  })

  it('should ignore empty setsMax', () => {
    const result = validateWorkoutInput('3', '10', '50', '')
    expect(result.valid).toBe(true)
  })

  it('should ignore whitespace-only setsMax', () => {
    const result = validateWorkoutInput('3', '10', '50', '   ')
    expect(result.valid).toBe(true)
  })

  it('should ignore undefined setsMax', () => {
    const result = validateWorkoutInput('3', '10', '50', undefined)
    expect(result.valid).toBe(true)
  })

  it('should not validate setsMax against invalid sets', () => {
    // sets is invalid (abc), setsMax is valid (5) — should have sets error but not setsMax error
    const result = validateWorkoutInput('abc', '10', '50', '5')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le nombre de séries doit être un nombre valide')
    expect(result.errors).not.toContain('Le max de séries doit être ≥ au min')
  })
})
