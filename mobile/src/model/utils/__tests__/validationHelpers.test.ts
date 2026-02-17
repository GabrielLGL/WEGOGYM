import {
  isValidText,
  isValidNumeric,
  validateWorkoutInput,
  validateMuscles,
  validateExerciseInput,
} from '../validationHelpers'

describe('validationHelpers', () => {
  describe('isValidText', () => {
    it('should return true for valid text', () => {
      expect(isValidText('Hello')).toBe(true)
      expect(isValidText('  World  ')).toBe(true)
    })

    it('should return false for empty or whitespace-only text', () => {
      expect(isValidText('')).toBe(false)
      expect(isValidText('   ')).toBe(false)
      expect(isValidText('\t\n')).toBe(false)
    })
  })

  describe('isValidNumeric', () => {
    it('should return true for valid positive numbers', () => {
      expect(isValidNumeric('10')).toBe(true)
      expect(isValidNumeric('3.5')).toBe(true)
      expect(isValidNumeric(5)).toBe(true)
    })

    it('should return false for zero and negative numbers by default', () => {
      expect(isValidNumeric('0')).toBe(false)
      expect(isValidNumeric('-5')).toBe(false)
    })

    it('should respect custom min value', () => {
      expect(isValidNumeric('0', -1)).toBe(true) // 0 > -1
      expect(isValidNumeric('5', 10)).toBe(false) // 5 <= 10
      expect(isValidNumeric('15', 10)).toBe(true) // 15 > 10
    })

    it('should return false for non-numeric values', () => {
      expect(isValidNumeric('abc')).toBe(false)
      expect(isValidNumeric('')).toBe(false)
      expect(isValidNumeric('10abc')).toBe(false)
    })
  })

  describe('validateWorkoutInput', () => {
    it('should validate correct workout inputs', () => {
      const result = validateWorkoutInput('3', '10', '50')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should validate workout without weight', () => {
      const result = validateWorkoutInput('4', '12')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty sets', () => {
      const result = validateWorkoutInput('', '10', '50')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Le nombre de séries est requis et doit être supérieur à 0'
      )
    })

    it('should reject zero sets', () => {
      const result = validateWorkoutInput('0', '10', '50')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject empty reps', () => {
      const result = validateWorkoutInput('3', '', '50')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Le nombre de répétitions est requis et doit être supérieur à 0'
      )
    })

    it('should reject zero reps', () => {
      const result = validateWorkoutInput('3', '0', '50')
      expect(result.valid).toBe(false)
    })

    it('should reject invalid numeric sets', () => {
      const result = validateWorkoutInput('abc', '10', '50')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le nombre de séries doit être un nombre valide')
    })

    it('should reject invalid numeric weight when provided', () => {
      const result = validateWorkoutInput('3', '10', 'heavy')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le poids doit être un nombre valide')
    })

    it('should allow zero weight', () => {
      const result = validateWorkoutInput('3', '10', '0')
      expect(result.valid).toBe(true)
    })

    it('should accumulate multiple errors', () => {
      const result = validateWorkoutInput('', '', 'abc')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(3)
    })
  })

  describe('validateMuscles', () => {
    it('should return true for non-empty muscle array', () => {
      expect(validateMuscles(['Pectoraux'])).toBe(true)
      expect(validateMuscles(['Pectoraux', 'Triceps'])).toBe(true)
    })

    it('should return false for empty muscle array', () => {
      expect(validateMuscles([])).toBe(false)
    })
  })

  describe('validateExerciseInput', () => {
    it('should validate correct exercise input', () => {
      const result = validateExerciseInput(
        'Développé couché',
        ['Pectoraux', 'Triceps'],
        'Poids libre'
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty name', () => {
      const result = validateExerciseInput('', ['Pectoraux'], 'Poids libre')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Le nom de l'exercice est requis")
    })

    it('should reject whitespace-only name', () => {
      const result = validateExerciseInput('   ', ['Pectoraux'], 'Poids libre')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Le nom de l'exercice est requis")
    })

    it('should reject empty muscles', () => {
      const result = validateExerciseInput('Développé couché', [], 'Poids libre')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Au moins un muscle doit être sélectionné')
    })

    it('should reject empty equipment', () => {
      const result = validateExerciseInput('Développé couché', ['Pectoraux'], '')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("L'équipement est requis")
    })

    it('should accumulate all errors', () => {
      const result = validateExerciseInput('', [], '')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(3)
    })
  })
})
