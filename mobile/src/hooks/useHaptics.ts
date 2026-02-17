import { useMemo } from 'react'
import * as Haptics from 'expo-haptics'

/**
 * Hook qui fournit une API sémantique pour les retours haptiques.
 *
 * Encapsule les choix de ImpactFeedbackStyle appropriés selon le contexte,
 * rendant le code plus lisible et cohérent.
 *
 * L'objet retourné est mémorisé pour éviter les re-renders inutiles.
 *
 * @example
 * const haptics = useHaptics()
 *
 * <Button onPress={() => {
 *   haptics.onPress()
 *   // action...
 * }} />
 *
 * <DeleteButton onPress={() => {
 *   haptics.onDelete()
 *   // suppression...
 * }} />
 */
export function useHaptics() {
  return useMemo(() => ({
    /**
     * Feedback pour une pression standard (boutons, switches, etc.)
     * Utilise Medium pour un retour tactile équilibré.
     */
    onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    },

    /**
     * Feedback pour une sélection dans une liste ou un menu.
     * Utilise Light pour un retour subtil.
     */
    onSelect: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    },

    /**
     * Feedback pour une action critique ou destructive (suppression).
     * Utilise Heavy pour un retour tactile fort et avertissant.
     */
    onDelete: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    },

    /**
     * Feedback pour une validation ou confirmation d'action.
     * Utilise Medium pour un retour tactile de confirmation.
     */
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    },

    /**
     * Feedback pour un drag and drop ou réorganisation.
     * Utilise Light pour un retour subtil et fluide.
     */
    onDrag: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    },

    /**
     * Feedback pour une erreur ou action invalide.
     * Utilise la notification d'erreur pour un retour distinctif.
     */
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    },

    /**
     * Feedback pour un succès important (workout complété, etc.).
     * Utilise la notification de succès pour un retour distinctif.
     */
    onMajorSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
  }), []) // Mémorisé - ne change jamais
}
