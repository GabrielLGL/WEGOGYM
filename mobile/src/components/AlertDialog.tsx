import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native'
import { Portal } from '@gorhom/portal'
import { borderRadius, spacing, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

interface AlertDialogProps {
  visible: boolean
  title: string
  message?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  /** Hide the cancel button (useful for simple error/info alerts with a single "OK" action) */
  hideCancel?: boolean
}

/**
 * AlertDialog - Modal de confirmation réutilisable
 *
 * Remplace les 5 implémentations dupliquées de modals de confirmation.
 * Inclut haptics automatique et synchronisation de la tab bar.
 *
 * @example
 * const [isAlertVisible, setIsAlertVisible] = useState(false)
 *
 * <AlertDialog
 *   visible={isAlertVisible}
 *   title="Supprimer ce programme ?"
 *   message="Cette action est irréversible."
 *   onConfirm={async () => {
 *     await deleteProgram()
 *     setIsAlertVisible(false)
 *   }}
 *   onCancel={() => setIsAlertVisible(false)}
 *   confirmText="Supprimer"
 * />
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor,
  hideCancel = false,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)
  const effectiveConfirmColor = confirmColor ?? colors.danger
  const haptics = useHaptics()
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current

  // Animation d'entrée
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start()
    } else {
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.95)
    }
  }, [visible])

  const handleConfirm = async () => {
    haptics.onDelete() // Heavy haptic pour action critique
    try {
      await onConfirm()
    } catch (error) {
      if (__DEV__) console.error('[AlertDialog] onConfirm failed:', error)
      haptics.onError() // Feedback tactile si l'action échoue
    }
  }

  const handleCancel = () => {
    haptics.onPress() // Medium haptic pour annulation
    onCancel()
  }

  if (!visible) return null

  return (
    <Portal>
      <View style={styles.container}>
        {/* Overlay sombre cliquable pour fermer */}
        <TouchableWithoutFeedback onPress={handleCancel}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Contenu du dialog */}
        <Animated.View
          style={[
            styles.content,
            neuShadow.elevated,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          {/* Boutons d'action */}
          <View style={styles.buttonsRow}>
            {!hideCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: effectiveConfirmColor }]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Portal>
  )
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    content: {
      width: '85%',
      maxWidth: 400,
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      elevation: 12,
      shadowColor: colors.neuShadowDark,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    message: {
      color: colors.textSecondary,
      fontSize: fontSize.md,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 20,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.secondaryButton,
    },
    buttonText: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: fontSize.md,
    },
    confirmButtonText: {
      color: colors.primaryText,
      fontWeight: 'bold',
      fontSize: fontSize.md,
    },
  })
}
