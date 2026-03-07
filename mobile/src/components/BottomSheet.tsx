import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Easing, BackHandler, useWindowDimensions } from 'react-native'
import { Portal } from '@gorhom/portal'
import { borderRadius, spacing, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  animationDuration?: number // Durée de l'animation en ms (défaut: 250)
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
 * @param animationDuration - Durée de l'animation en ms (défaut: 250)
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
  animationDuration = 250,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)
  const { height: screenHeight } = useWindowDimensions()
  const [showContent, setShowContent] = useState(visible)
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose()
      return true
    })
    return () => subscription.remove()
  }, [visible, onClose])

  useEffect(() => {
    if (visible) {
      setShowContent(true)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
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
  }, [visible, animationDuration])

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
            neuShadow.elevated,
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

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    },
    dragHandle: {
      width: spacing.xxl,
      height: spacing.xs,
      backgroundColor: colors.separator,
      borderRadius: borderRadius.xxs,
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
}
