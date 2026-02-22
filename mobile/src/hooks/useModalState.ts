import { useState } from 'react'

/**
 * Hook pour gerer l'etat d'un modal.
 *
 * @example
 * const addModal = useModalState()
 *
 * // Ouvrir un modal
 * <Button onPress={addModal.open} />
 *
 * // Afficher le modal
 * {addModal.isOpen && <View>...</View>}
 *
 * // Fermer le modal
 * <Button onPress={addModal.close} />
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}
