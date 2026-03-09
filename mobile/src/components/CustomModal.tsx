import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native'
import { Portal } from '@gorhom/portal'
import { useColors } from '../contexts/ThemeContext'
import { borderRadius, spacing, fontSize } from '../theme/index'

interface Props {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  buttons?: React.ReactNode
}

export const CustomModal: React.FC<Props> = ({ visible, onClose, title, children, buttons }) => {
  const colors = useColors()
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current

  const styles = useMemo(() => StyleSheet.create({
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
      elevation: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    title: {
      color: colors.text,
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    body: {
      marginBottom: spacing.lg,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.ms,
    },
  }), [colors])

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 })
      ]).start()
    } else {
      fadeAnim.setValue(0)
      scaleAnim.setValue(0.95)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Portal>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.title}>{title}</Text>

          <View style={styles.body}>
            {children}
          </View>

          {buttons && (
            <View style={styles.buttonsRow}>
              {buttons}
            </View>
          )}
        </Animated.View>
      </View>
    </Portal>
  )
}
