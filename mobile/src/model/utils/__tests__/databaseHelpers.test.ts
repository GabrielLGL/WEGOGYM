import {
  parseNumericInput,
  parseIntegerInput,
  filterExercises,
  searchExercises,
  filterAndSearchExercises,
} from '../databaseHelpers'
import Exercise from '../../models/Exercise'

// Mock Exercise objects for testing
const createMockExercise = (
  id: string,
  name: string,
  muscles: string[],
  equipment: string
): Partial<Exercise> => ({
  id,
  name,
  muscles,
  equipment,
})

describe('databaseHelpers', () => {
  describe('parseNumericInput', () => {
    it('should parse valid numeric strings', () => {
      expect(parseNumericInput('10')).toBe(10)
      expect(parseNumericInput('3.5')).toBe(3.5)
      expect(parseNumericInput('0')).toBe(0)
      expect(parseNumericInput('-5')).toBe(-5)
    })

    it('should return fallback for invalid inputs', () => {
      expect(parseNumericInput('abc')).toBe(0)
      expect(parseNumericInput('')).toBe(0)
      expect(parseNumericInput('  ')).toBe(0)
    })

    it('should use custom fallback', () => {
      expect(parseNumericInput('abc', 10)).toBe(10)
      expect(parseNumericInput('', -1)).toBe(-1)
    })

    it('should handle numeric strings with leading/trailing spaces', () => {
      expect(parseNumericInput('  10  ')).toBe(10)
      expect(parseNumericInput(' 3.5 ')).toBe(3.5)
    })
  })

  describe('parseIntegerInput', () => {
    it('should parse valid integer strings', () => {
      expect(parseIntegerInput('10')).toBe(10)
      expect(parseIntegerInput('0')).toBe(0)
      expect(parseIntegerInput('-5')).toBe(-5)
    })

    it('should truncate decimal values', () => {
      expect(parseIntegerInput('3.9')).toBe(3)
      expect(parseIntegerInput('10.1')).toBe(10)
    })

    it('should return fallback for invalid inputs', () => {
      expect(parseIntegerInput('abc')).toBe(0)
      expect(parseIntegerInput('')).toBe(0)
      expect(parseIntegerInput('  ')).toBe(0)
    })

    it('should use custom fallback', () => {
      expect(parseIntegerInput('abc', 1)).toBe(1)
      expect(parseIntegerInput('', -1)).toBe(-1)
    })
  })

  describe('filterExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux', 'Triceps'], 'Poids libre'),
      createMockExercise('2', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('3', 'Leg press', ['Quadriceps', 'Fessiers'], 'Machine'),
      createMockExercise('4', 'Pompes', ['Pectoraux', 'Triceps'], 'Poids du corps'),
    ] as Exercise[]

    it('should return all exercises when no filters applied', () => {
      const filtered = filterExercises(mockExercises)
      expect(filtered.length).toBe(4)
    })

    it('should filter by muscle', () => {
      const filtered = filterExercises(mockExercises, 'Pectoraux')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '4'])
    })

    it('should filter by equipment', () => {
      const filtered = filterExercises(mockExercises, null, 'Poids libre')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should filter by both muscle and equipment', () => {
      const filtered = filterExercises(mockExercises, 'Pectoraux', 'Poids libre')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should return empty array when no matches', () => {
      const filtered = filterExercises(mockExercises, 'Dorsaux', 'Machine')
      expect(filtered.length).toBe(0)
    })

    it('should handle null/undefined filters', () => {
      expect(filterExercises(mockExercises, null, null).length).toBe(4)
      expect(filterExercises(mockExercises, undefined, undefined).length).toBe(4)
    })
  })

  describe('searchExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux'], 'Poids libre'),
      createMockExercise('2', 'Développé militaire', ['Épaules'], 'Poids libre'),
      createMockExercise('3', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('4', 'LEG PRESS', ['Quadriceps'], 'Machine'),
    ] as Exercise[]

    it('should return all exercises for empty query', () => {
      expect(searchExercises(mockExercises, '').length).toBe(4)
      expect(searchExercises(mockExercises, '   ').length).toBe(4)
    })

    it('should search case-insensitively', () => {
      const filtered = searchExercises(mockExercises, 'développé')
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should match partial names', () => {
      const filtered = searchExercises(mockExercises, 'curl')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('3')
    })

    it('should handle uppercase queries', () => {
      const filtered = searchExercises(mockExercises, 'LEG')
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('4')
    })

    it('should return empty array when no matches', () => {
      const filtered = searchExercises(mockExercises, 'squat')
      expect(filtered.length).toBe(0)
    })
  })

  describe('filterAndSearchExercises', () => {
    const mockExercises = [
      createMockExercise('1', 'Développé couché', ['Pectoraux', 'Triceps'], 'Poids libre'),
      createMockExercise('2', 'Développé incliné', ['Pectoraux'], 'Poids libre'),
      createMockExercise('3', 'Curl biceps', ['Biceps'], 'Poids libre'),
      createMockExercise('4', 'Pompes', ['Pectoraux', 'Triceps'], 'Poids du corps'),
    ] as Exercise[]

    it('should return all exercises when no options provided', () => {
      const filtered = filterAndSearchExercises(mockExercises, {})
      expect(filtered.length).toBe(4)
    })

    it('should apply muscle filter only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
      })
      expect(filtered.length).toBe(3)
    })

    it('should apply equipment filter only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        equipment: 'Poids libre',
      })
      expect(filtered.length).toBe(3)
    })

    it('should apply search query only', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        searchQuery: 'développé',
      })
      expect(filtered.length).toBe(2)
    })

    it('should combine all filters', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
        equipment: 'Poids libre',
        searchQuery: 'développé',
      })
      expect(filtered.length).toBe(2)
      expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
    })

    it('should apply filters in correct order (filter then search)', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: 'Pectoraux',
        searchQuery: 'curl', // Should match nothing (curl is for Biceps)
      })
      expect(filtered.length).toBe(0)
    })

    it('should handle null filters', () => {
      const filtered = filterAndSearchExercises(mockExercises, {
        muscle: null,
        equipment: null,
        searchQuery: '',
      })
      expect(filtered.length).toBe(4)
    })
  })
})
