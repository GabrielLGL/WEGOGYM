import {
  isValidText,
  isValidNumeric,
  validateWorkoutInput,
  validateSetInput,
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
      expect(result.errors).toContain('Le nombre de répétitions est requis')
    })

    it('should reject zero reps', () => {
      const result = validateWorkoutInput('3', '0', '50')
      expect(result.valid).toBe(false)
    })

    it('should accept a valid reps range "6-8"', () => {
      const result = validateWorkoutInput('3', '6-8', '50')
      expect(result.valid).toBe(true)
    })

    it('should reject reps range where min > max', () => {
      const result = validateWorkoutInput('3', '8-6', '50')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le min de reps doit être ≤ au max')
    })

    it('should reject reps range with out-of-bounds value', () => {
      const result = validateWorkoutInput('3', '0-8', '50')
      expect(result.valid).toBe(false)
    })

    it('should reject invalid reps format (too many dashes)', () => {
      const result = validateWorkoutInput('3', '6-8-10', '50')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Format de reps invalide — utiliser un entier ou une range (ex: 6-8)')
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

    // setsMax validation (lines 105-113)
    it('should accept valid setsMax when >= sets', () => {
      const result = validateWorkoutInput('3', '10', '50', '5')
      expect(result.valid).toBe(true)
    })

    it('should reject setsMax when less than sets', () => {
      const result = validateWorkoutInput('5', '10', '50', '3')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le max de séries doit être ≥ au min')
    })

    it('should reject non-numeric setsMax', () => {
      const result = validateWorkoutInput('3', '10', '50', 'abc')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le max de séries doit être un nombre valide')
    })

    it('should accept empty setsMax', () => {
      const result = validateWorkoutInput('3', '10', '50', '')
      expect(result.valid).toBe(true)
    })

    it('should accept setsMax equal to sets', () => {
      const result = validateWorkoutInput('3', '10', '50', '3')
      expect(result.valid).toBe(true)
    })

    it('should skip setsMax validation when sets is invalid', () => {
      const result = validateWorkoutInput('abc', '10', '50', '3')
      expect(result.valid).toBe(false)
      // setsMax error should not appear since sets is NaN
      expect(result.errors).not.toContain('Le max de séries doit être ≥ au min')
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

  describe('validateSetInput', () => {
    it('should accept valid weight and reps', () => {
      const result = validateSetInput('80', '10')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should accept zero weight (bodyweight exercises)', () => {
      expect(validateSetInput('0', '10').valid).toBe(true)
    })

    it('should accept decimal weight', () => {
      expect(validateSetInput('22.5', '8').valid).toBe(true)
    })

    it('should reject empty weight', () => {
      const result = validateSetInput('', '10')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Le poids doit être un nombre valide (>= 0)')
    })

    it('should reject negative weight', () => {
      const result = validateSetInput('-5', '10')
      expect(result.valid).toBe(false)
    })

    it('should reject non-numeric weight', () => {
      expect(validateSetInput('abc', '10').valid).toBe(false)
    })

    it('should reject whitespace-only weight', () => {
      expect(validateSetInput('   ', '10').valid).toBe(false)
    })

    it('should reject empty reps', () => {
      const result = validateSetInput('80', '')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Les répétitions doivent être >= 1')
    })

    it('should reject zero reps', () => {
      expect(validateSetInput('80', '0').valid).toBe(false)
    })

    it('should reject negative reps', () => {
      expect(validateSetInput('80', '-1').valid).toBe(false)
    })

    it('should reject non-numeric reps', () => {
      expect(validateSetInput('80', 'ten').valid).toBe(false)
    })

    it('should accumulate errors for both invalid weight and reps', () => {
      const result = validateSetInput('', '')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(2)
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
