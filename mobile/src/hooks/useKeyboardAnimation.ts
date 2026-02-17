import { useEffect, useRef } from 'react'
import { Keyboard, Animated, Platform } from 'react-native'

/**
 * Hook pour animer un composant en fonction de l'apparition/disparition du clavier.
 *
 * Remplace les implémentations dupliquées dans HomeScreen et ExercisesScreen.
 * L'animation slide vers le haut quand le clavier apparaît et redescend quand il disparaît.
 *
 * @param offset - Décalage vertical en pixels (négatif = monte, positif = descend)
 * @returns Animated.Value à utiliser dans le style du composant
 *
 * @example
 * const slideAnim = useKeyboardAnimation(-50)
 *
 * <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
 *   <TextInput />
 * </Animated.View>
 */
export function useKeyboardAnimation(offset: number = -50) {
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Sur iOS, utiliser keyboardWillShow/keyboardWillHide pour une animation fluide
    // Sur Android, utiliser keyboardDidShow/keyboardDidHide
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
      Animated.timing(slideAnim, {
        toValue: offset,
        duration: 250,
        useNativeDriver: true,
      }).start()
    })

    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [offset, slideAnim])

  return slideAnim
}
