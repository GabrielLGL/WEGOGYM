import React, { useEffect, useRef, useMemo } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { Portal } from '@gorhom/portal'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastConfig {
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastProps {
  config: ToastConfig
  onDismiss: () => void
}

const ICON_MAP: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
}

export const Toast: React.FC<ToastProps> = ({ config, onDismiss }) => {
  const { colors } = useTheme()
  const styles = useStyles(colors)
  const variant = config.variant ?? 'success'
  const duration = config.duration ?? 2500

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  const borderColor = variant === 'success'
    ? colors.success
    : variant === 'error'
      ? colors.danger
      : colors.amber

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss())
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Portal>
      <Animated.View
        style={[
          styles.container,
          { borderLeftColor: borderColor, opacity, transform: [{ translateY }] },
        ]}
      >
        <Ionicons name={ICON_MAP[variant]} size={20} color={borderColor} style={styles.icon} />
        <Text style={styles.message} numberOfLines={1}>{config.message}</Text>
      </Animated.View>
    </Portal>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      left: spacing.lg,
      right: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderLeftWidth: 4,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.ms,
      paddingHorizontal: spacing.md,
      zIndex: 9999,
      elevation: 8,
      shadowColor: colors.neuShadowDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
    },
    icon: {
      marginRight: spacing.sm,
    },
    message: {
      flex: 1,
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  }), [colors])
}
