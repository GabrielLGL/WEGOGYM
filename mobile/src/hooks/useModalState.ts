import { useState, useEffect } from 'react'
import { DeviceEventEmitter } from 'react-native'

/**
 * Hook pour gérer l'état d'un modal avec synchronisation automatique de la tab bar.
 *
 * Émet automatiquement les événements HIDE_TAB_BAR/SHOW_TAB_BAR selon l'état du modal.
 * Remplace le pattern répété de DeviceEventEmitter + useState dans tous les screens.
 *
 * @example
 * const addModal = useModalState()
 * const deleteModal = useModalState()
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

  // Synchronise automatiquement la tab bar avec l'état du modal
  useEffect(() => {
    DeviceEventEmitter.emit(isOpen ? 'HIDE_TAB_BAR' : 'SHOW_TAB_BAR')
  }, [isOpen])

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen, // Pour compatibilité avec ancien code si nécessaire
  }
}

/**
 * Hook pour gérer plusieurs modals avec synchronisation automatique de la tab bar.
 *
 * La tab bar est cachée dès qu'au moins un modal est ouvert.
 * Utile quand un composant a plusieurs modals/overlays différents.
 *
 * @param modalStates - Tableau des états des modals à surveiller
 *
 * @example
 * const [isAddModalVisible, setIsAddModalVisible] = useState(false)
 * const [isOptionsVisible, setIsOptionsVisible] = useState(false)
 * const [isAlertVisible, setIsAlertVisible] = useState(false)
 *
 * useMultiModalSync([isAddModalVisible, isOptionsVisible, isAlertVisible])
 */
export function useMultiModalSync(modalStates: boolean[]) {
  // Convertir le tableau en string pour éviter les re-renders sur référence
  const modalStatesKey = modalStates.join(',')

  useEffect(() => {
    const anyModalOpen = modalStates.some(state => state)
    DeviceEventEmitter.emit(anyModalOpen ? 'HIDE_TAB_BAR' : 'SHOW_TAB_BAR')
  }, [modalStatesKey]) // Dépend de la string, pas du tableau
}
