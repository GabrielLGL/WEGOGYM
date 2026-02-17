import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native'
import { Portal } from '@gorhom/portal'
import { colors, borderRadius, spacing, fontSize } from '../theme'

const screenHeight = Dimensions.get('window').height

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  animationSpeed?: number // Vitesse du spring (défaut: 12)
}

/**
 * BottomSheet - Modal qui glisse depuis le bas de l'écran
 *
 * Remplace les 2 implémentations inline dupliquées.
 * Utilise une animation spring fluide et peut être configuré.
 *
 * @param visible - Contrôle la visibilité du bottom sheet
 * @param onClose - Callback appelé quand l'utilisateur ferme le sheet
 * @param title - Titre optionnel affiché en haut du sheet
 * @param children - Contenu du bottom sheet
 * @param animationSpeed - Vitesse de l'animation spring (défaut: 12)
 *
 * @example
 * const [isVisible, setIsVisible] = useState(false)
 *
 * <BottomSheet
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   title="Options"
 * >
 *   <TouchableOpacity onPress={() => {...}}>
 *     <Text>Option 1</Text>
 *   </TouchableOpacity>
 *   <TouchableOpacity onPress={() => {...}}>
 *     <Text>Option 2</Text>
 *   </TouchableOpacity>
 * </BottomSheet>
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  animationSpeed = 12,
}) => {
  const [showContent, setShowContent] = useState(visible)
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setShowContent(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: animationSpeed,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowContent(false))
    }
  }, [visible, animationSpeed])

  if (!showContent) return null

  return (
    <Portal>
      <View style={styles.container}>
        {/* Overlay semi-transparent cliquable pour fermer */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Contenu du bottom sheet */}
        <Animated.View
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle de drag visuel */}
          <View style={styles.dragHandle} />

          {/* Titre optionnel */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Contenu enfant */}
          {children}
        </Animated.View>
      </View>
    </Portal>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bottomSheetOverlay,
  },
  content: {
    width: '100%',
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.separator,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
})
