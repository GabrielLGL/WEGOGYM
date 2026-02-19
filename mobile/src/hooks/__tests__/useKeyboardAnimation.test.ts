import { renderHook } from '@testing-library/react-native'
import { Animated, Keyboard } from 'react-native'
import { useKeyboardAnimation } from '../useKeyboardAnimation'

describe('useKeyboardAnimation', () => {
  let addListenerSpy: jest.SpyInstance
  let timingSpy: jest.SpyInstance
  const mockRemove = jest.fn()
  const mockStart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Spy sur Keyboard.addListener
    addListenerSpy = jest
      .spyOn(Keyboard, 'addListener')
      .mockReturnValue({ remove: mockRemove } as unknown as ReturnType<typeof Keyboard.addListener>)

    // Spy sur Animated.timing
    timingSpy = jest
      .spyOn(Animated, 'timing')
      .mockReturnValue({ start: mockStart } as unknown as ReturnType<typeof Animated.timing>)
  })

  afterEach(() => {
    addListenerSpy.mockRestore()
    timingSpy.mockRestore()
  })

  describe('initialisation', () => {
    it('should retourner une instance Animated.Value', () => {
      const { result } = renderHook(() => useKeyboardAnimation(-50))

      expect(result.current).toBeInstanceOf(Animated.Value)
    })

    it('should fonctionner avec l\'offset par défaut (-50)', () => {
      const { result } = renderHook(() => useKeyboardAnimation())

      expect(result.current).toBeInstanceOf(Animated.Value)
    })

    it('should fonctionner avec un offset positif', () => {
      const { result } = renderHook(() => useKeyboardAnimation(100))

      expect(result.current).toBeInstanceOf(Animated.Value)
    })

    it('should fonctionner avec un offset nul', () => {
      const { result } = renderHook(() => useKeyboardAnimation(0))

      expect(result.current).toBeInstanceOf(Animated.Value)
    })
  })

  describe('enregistrement des listeners', () => {
    it('should enregistrer deux listeners de clavier au montage', () => {
      renderHook(() => useKeyboardAnimation(-50))

      expect(addListenerSpy).toHaveBeenCalledTimes(2)
    })

    it('should enregistrer un listener pour l\'affichage du clavier', () => {
      renderHook(() => useKeyboardAnimation(-50))

      const calls = addListenerSpy.mock.calls
      const showEvents = calls.map((c) => c[0])
      const hasShowEvent =
        showEvents.includes('keyboardDidShow') ||
        showEvents.includes('keyboardWillShow')

      expect(hasShowEvent).toBe(true)
    })

    it('should enregistrer un listener pour la disparition du clavier', () => {
      renderHook(() => useKeyboardAnimation(-50))

      const calls = addListenerSpy.mock.calls
      const hideEvents = calls.map((c) => c[0])
      const hasHideEvent =
        hideEvents.includes('keyboardDidHide') ||
        hideEvents.includes('keyboardWillHide')

      expect(hasHideEvent).toBe(true)
    })
  })

  describe('nettoyage', () => {
    it('should retirer les deux listeners au démontage', () => {
      const { unmount } = renderHook(() => useKeyboardAnimation(-50))

      unmount()

      expect(mockRemove).toHaveBeenCalledTimes(2)
    })
  })

  describe('animation sur événement clavier', () => {
    it('should appeler Animated.timing avec toValue=offset quand le clavier apparaît', () => {
      renderHook(() => useKeyboardAnimation(-150))

      const calls = addListenerSpy.mock.calls
      const showCall = calls.find(
        (c) =>
          c[0] === 'keyboardDidShow' || c[0] === 'keyboardWillShow'
      )

      expect(showCall).toBeDefined()

      // Déclencher l'événement
      showCall![1]()

      expect(timingSpy).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: -150,
          duration: 250,
          useNativeDriver: true,
        })
      )
      expect(mockStart).toHaveBeenCalled()
    })

    it('should appeler Animated.timing avec toValue=0 quand le clavier disparaît', () => {
      renderHook(() => useKeyboardAnimation(-150))

      const calls = addListenerSpy.mock.calls
      const hideCall = calls.find(
        (c) =>
          c[0] === 'keyboardDidHide' || c[0] === 'keyboardWillHide'
      )

      expect(hideCall).toBeDefined()

      // Déclencher l'événement
      hideCall![1]()

      expect(timingSpy).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      )
      expect(mockStart).toHaveBeenCalled()
    })
  })

  describe('changement d\'offset', () => {
    it('should ré-enregistrer les listeners quand offset change', () => {
      const { rerender } = renderHook(
        ({ offset }) => useKeyboardAnimation(offset),
        { initialProps: { offset: -50 } }
      )

      addListenerSpy.mockClear()
      mockRemove.mockClear()

      rerender({ offset: -100 })

      // Les anciens listeners sont retirés et les nouveaux enregistrés
      expect(mockRemove).toHaveBeenCalled()
      expect(addListenerSpy).toHaveBeenCalled()
    })

    it('should utiliser le nouvel offset lors du prochain événement clavier', () => {
      const { rerender } = renderHook(
        ({ offset }) => useKeyboardAnimation(offset),
        { initialProps: { offset: -50 } }
      )

      rerender({ offset: -200 })

      const calls = addListenerSpy.mock.calls
      const showCall = calls
        .slice() // copie pour éviter la mutation
        .reverse() // prendre le dernier listener enregistré
        .find((c) =>
          c[0] === 'keyboardDidShow' || c[0] === 'keyboardWillShow'
        )

      expect(showCall).toBeDefined()
      showCall![1]()

      expect(timingSpy).toHaveBeenLastCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({ toValue: -200 })
      )
    })
  })
})
