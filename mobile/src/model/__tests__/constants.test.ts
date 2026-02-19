import { MUSCLES_LIST, EQUIPMENT_LIST } from '../constants'

describe('constants', () => {
  describe('MUSCLES_LIST', () => {
    it('est un tableau non vide', () => {
      expect(Array.isArray(MUSCLES_LIST)).toBe(true)
      expect(MUSCLES_LIST.length).toBeGreaterThan(0)
    })

    it('contient les groupes musculaires principaux', () => {
      expect(MUSCLES_LIST).toContain('Pecs')
      expect(MUSCLES_LIST).toContain('Dos')
      expect(MUSCLES_LIST).toContain('Quadriceps')
      expect(MUSCLES_LIST).toContain('Biceps')
      expect(MUSCLES_LIST).toContain('Triceps')
      expect(MUSCLES_LIST).toContain('Abdos')
      expect(MUSCLES_LIST).toContain('Epaules')
    })

    it('contient 11 groupes musculaires', () => {
      expect(MUSCLES_LIST).toHaveLength(11)
    })
  })

  describe('EQUIPMENT_LIST', () => {
    it('est un tableau non vide', () => {
      expect(Array.isArray(EQUIPMENT_LIST)).toBe(true)
      expect(EQUIPMENT_LIST.length).toBeGreaterThan(0)
    })

    it('contient les types d\'équipement principaux', () => {
      expect(EQUIPMENT_LIST).toContain('Poids libre')
      expect(EQUIPMENT_LIST).toContain('Machine')
      expect(EQUIPMENT_LIST).toContain('Poulies')
      expect(EQUIPMENT_LIST).toContain('Poids du corps')
    })

    it('contient 4 types d\'équipement', () => {
      expect(EQUIPMENT_LIST).toHaveLength(4)
    })
  })
})
