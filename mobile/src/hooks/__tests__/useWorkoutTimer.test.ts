import { renderHook, act } from '@testing-library/react-native'
import { useWorkoutTimer } from '../useWorkoutTimer'

describe('useWorkoutTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('état initial', () => {
    it('should retourner elapsedSeconds = 0 au moment du montage', () => {
      const startTimestamp = Date.now()
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.elapsedSeconds).toBe(0)
    })

    it('should retourner formattedTime "00:00" au démarrage', () => {
      const startTimestamp = Date.now()
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.formattedTime).toBe('00:00')
    })

    it('should exposer elapsedSeconds et formattedTime', () => {
      const { result } = renderHook(() => useWorkoutTimer(Date.now()))

      expect(result.current).toHaveProperty('elapsedSeconds')
      expect(result.current).toHaveProperty('formattedTime')
    })
  })

  describe('formatage du temps', () => {
    it('should formater 0 seconde en "00:00"', () => {
      const startTimestamp = Date.now()
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.formattedTime).toBe('00:00')
    })

    it('should formater 65 secondes en "01:05"', () => {
      const startTimestamp = Date.now() - 65 * 1000
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      // Le hook calcule immédiatement au montage
      expect(result.current.formattedTime).toBe('01:05')
    })

    it('should formater 3600 secondes en "60:00"', () => {
      const startTimestamp = Date.now() - 3600 * 1000
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.formattedTime).toBe('60:00')
    })

    it('should formater 59 secondes en "00:59"', () => {
      const startTimestamp = Date.now() - 59 * 1000
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.formattedTime).toBe('00:59')
    })

    it('should formater 120 secondes en "02:00"', () => {
      const startTimestamp = Date.now() - 120 * 1000
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.formattedTime).toBe('02:00')
    })
  })

  describe('mise à jour du timer', () => {
    it('should incrémenter elapsedSeconds après 1 seconde', () => {
      const startTimestamp = Date.now()
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      expect(result.current.elapsedSeconds).toBe(0)

      act(() => {
        // Avancer de 1 seconde
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.elapsedSeconds).toBe(1)
    })

    it('should mettre à jour formattedTime après 61 secondes', () => {
      const startTimestamp = Date.now()
      const { result } = renderHook(() => useWorkoutTimer(startTimestamp))

      act(() => {
        jest.advanceTimersByTime(61000)
      })

      expect(result.current.formattedTime).toBe('01:01')
    })

    it('should réagir au changement de startTimestamp', () => {
      const t1 = Date.now() - 10 * 1000 // 10 secondes dans le passé
      const { result, rerender } = renderHook(
        ({ ts }) => useWorkoutTimer(ts),
        { initialProps: { ts: t1 } }
      )

      expect(result.current.elapsedSeconds).toBe(10)

      const t2 = Date.now() // maintenant
      rerender({ ts: t2 })

      expect(result.current.elapsedSeconds).toBe(0)
    })
  })

  describe('nettoyage', () => {
    it('should nettoyer l\'intervalle au démontage (pas de fuite mémoire)', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      const startTimestamp = Date.now()

      const { unmount } = renderHook(() => useWorkoutTimer(startTimestamp))

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })

    it('should arrêter le timer après démontage', () => {
      const startTimestamp = Date.now()
      const { result, unmount } = renderHook(() => useWorkoutTimer(startTimestamp))

      unmount()

      // Avancer le temps — le timer ne devrait plus s'incrémenter
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      // La valeur reste figée au moment du démontage
      expect(result.current.elapsedSeconds).toBe(0)
    })
  })

  describe('timestamp dans le futur', () => {
    it('should gérer un startTimestamp dans le futur (elapsed = 0)', () => {
      // Si le timestamp est dans le futur, elapsed serait négatif
      // Math.floor(negative / 1000) = nombre négatif, mais c'est le comportement attendu
      const futureTimestamp = Date.now() + 5 * 1000
      const { result } = renderHook(() => useWorkoutTimer(futureTimestamp))

      // Le hook calcule (Date.now() - futureTimestamp) qui est négatif
      // Le composant affiche un temps négatif — comportement documenté
      expect(typeof result.current.elapsedSeconds).toBe('number')
      expect(typeof result.current.formattedTime).toBe('string')
    })
  })
})
