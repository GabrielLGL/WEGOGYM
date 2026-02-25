import { parseRepsTarget, suggestProgression } from '../progressionHelpers'

describe('progressionHelpers', () => {
  describe('parseRepsTarget', () => {
    it('parse un range "6-8" correctement', () => {
      const result = parseRepsTarget('6-8')
      expect(result).toEqual({ type: 'range', min: 6, max: 8 })
    })

    it('parse un range "8-12" correctement', () => {
      const result = parseRepsTarget('8-12')
      expect(result).toEqual({ type: 'range', min: 8, max: 12 })
    })

    it('parse un fixe "5" correctement', () => {
      const result = parseRepsTarget('5')
      expect(result).toEqual({ type: 'fixed', value: 5 })
    })

    it('parse un fixe "1" correctement', () => {
      const result = parseRepsTarget('1')
      expect(result).toEqual({ type: 'fixed', value: 1 })
    })

    it('retourne null pour null', () => {
      expect(parseRepsTarget(null)).toBeNull()
    })

    it('retourne null pour undefined', () => {
      expect(parseRepsTarget(undefined)).toBeNull()
    })

    it('retourne null pour une chaine vide', () => {
      expect(parseRepsTarget('')).toBeNull()
    })

    it('retourne null pour une chaine avec espaces', () => {
      expect(parseRepsTarget('   ')).toBeNull()
    })

    it('retourne null pour un range invalide (min >= max)', () => {
      expect(parseRepsTarget('8-6')).toBeNull()
    })

    it('retourne null pour un range egal (8-8)', () => {
      expect(parseRepsTarget('8-8')).toBeNull()
    })

    it('retourne null pour un fixe zero', () => {
      expect(parseRepsTarget('0')).toBeNull()
    })

    it('retourne null pour un fixe negatif', () => {
      expect(parseRepsTarget('-5')).toBeNull()
    })

    it('gere les espaces autour du range', () => {
      const result = parseRepsTarget(' 6-8 ')
      expect(result).toEqual({ type: 'range', min: 6, max: 8 })
    })

    it('retourne null pour du texte non-numerique', () => {
      expect(parseRepsTarget('abc')).toBeNull()
    })
  })

  describe('suggestProgression', () => {
    describe('range (double progression)', () => {
      it('suggere +2.5 kg quand le max du range est atteint', () => {
        const result = suggestProgression(80, 8, '6-8')
        expect(result).toEqual({
          suggestedWeight: 82.5,
          suggestedReps: 6,
          label: '+2.5 kg',
        })
      })

      it('suggere +1 rep quand le range n\'est pas atteint', () => {
        const result = suggestProgression(80, 6, '6-8')
        expect(result).toEqual({
          suggestedWeight: 80,
          suggestedReps: 7,
          label: '+1 rep',
        })
      })

      it('suggere +1 rep quand au milieu du range', () => {
        const result = suggestProgression(80, 7, '6-8')
        expect(result).toEqual({
          suggestedWeight: 80,
          suggestedReps: 8,
          label: '+1 rep',
        })
      })

      it('suggere +2.5 kg quand lastReps depasse le max du range', () => {
        const result = suggestProgression(80, 10, '6-8')
        expect(result).toEqual({
          suggestedWeight: 82.5,
          suggestedReps: 6,
          label: '+2.5 kg',
        })
      })

      it('fonctionne avec un range large 8-12', () => {
        const result = suggestProgression(60, 12, '8-12')
        expect(result).toEqual({
          suggestedWeight: 62.5,
          suggestedReps: 8,
          label: '+2.5 kg',
        })
      })

      it('arrondit les reps fractionnaires avec +1', () => {
        const result = suggestProgression(80, 6.5, '6-8')
        expect(result).toEqual({
          suggestedWeight: 80,
          suggestedReps: 8,
          label: '+1 rep',
        })
      })
    })

    describe('fixe (progression poids uniquement)', () => {
      it('suggere +2.5 kg pour un fixe "5"', () => {
        const result = suggestProgression(100, 5, '5')
        expect(result).toEqual({
          suggestedWeight: 102.5,
          suggestedReps: 5,
          label: '+2.5 kg',
        })
      })

      it('suggere +2.5 kg pour un fixe "1"', () => {
        const result = suggestProgression(150, 1, '1')
        expect(result).toEqual({
          suggestedWeight: 152.5,
          suggestedReps: 1,
          label: '+2.5 kg',
        })
      })

      it('suggere +2.5 kg pour un fixe "3"', () => {
        const result = suggestProgression(120, 3, '3')
        expect(result).toEqual({
          suggestedWeight: 122.5,
          suggestedReps: 3,
          label: '+2.5 kg',
        })
      })
    })

    describe('cas sans suggestion', () => {
      it('retourne null pour repsTarget null', () => {
        expect(suggestProgression(80, 8, null)).toBeNull()
      })

      it('retourne null pour repsTarget undefined', () => {
        expect(suggestProgression(80, 8, undefined)).toBeNull()
      })

      it('retourne null pour repsTarget vide', () => {
        expect(suggestProgression(80, 8, '')).toBeNull()
      })

      it('retourne null pour lastWeight 0', () => {
        expect(suggestProgression(0, 8, '6-8')).toBeNull()
      })

      it('retourne null pour lastWeight negatif', () => {
        expect(suggestProgression(-10, 8, '6-8')).toBeNull()
      })

      it('retourne null pour lastReps 0', () => {
        expect(suggestProgression(80, 0, '6-8')).toBeNull()
      })

      it('retourne null pour lastReps negatif', () => {
        expect(suggestProgression(80, -1, '6-8')).toBeNull()
      })
    })
  })
})
